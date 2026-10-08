import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { resolveProduct } from './services/resolver.js';
import { extractVisualAttributes } from './services/visionBrain.js';
import { collectAllVideoSources, collectPlatformVideos } from './services/videoCollector.js';
import { deduplicateVideos, clearSeenCache, getDeduplicationStats } from './services/deduplicator.js';
import { saveSearchRecord, getSearchRecord, getAllSearches, clearSearchHistory, toggleBookmarkVideo, getBookmarks, TEST_EVIDENCE_RECORDS } from './services/db.js';
import { SearchRecord, PipelineProgressEvent, VideoResult } from '../src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createExpressApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // SSE active connections map (searchId -> Set of Response objects)
  const sseClients = new Map<string, Set<express.Response>>();

  function broadcastSSE(searchId: string, event: PipelineProgressEvent) {
    const clients = sseClients.get(searchId);
    if (clients) {
      const payload = `data: ${JSON.stringify(event)}\n\n`;
      clients.forEach(res => {
        try {
          res.write(payload);
        } catch {
          // Handled on close
        }
      });
    }
  }

  // 1. SSE Stream endpoint for live pipeline progress
  app.get('/api/search/:id/stream', (req, res) => {
    const { id } = req.params;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (!sseClients.has(id)) {
      sseClients.set(id, new Set());
    }
    sseClients.get(id)!.add(res);

    // Initial ping
    res.write(`data: ${JSON.stringify({ step: 'resolving', progressPercent: 10, message: 'Connected to pipeline monitor...' })}\n\n`);

    req.on('close', () => {
      const clients = sseClients.get(id);
      if (clients) {
        clients.delete(res);
        if (clients.size === 0) sseClients.delete(id);
      }
    });
  });

  // 2. Resolve URL / Query preview without full video fetch
  app.post('/api/resolve', async (req, res) => {
    try {
      const { query, url, imageBase64 } = req.body;
      const product = await resolveProduct({ query, url, imageBase64 });
      const attributes = await extractVisualAttributes(product);
      res.json({ success: true, product, attributes });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3. Full Search Pipeline Orchestrator
  app.post('/api/search', async (req, res) => {
    const searchId = `search_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const { query, url, imageBase64, includeTikTok, minMatchThreshold = 60 } = req.body;

    if (!query && !url && !imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a product name/keyword, a product URL, or an uploaded image.',
      });
    }

    try {
      // Step 1: Resolve Product & SSRF verification
      broadcastSSE(searchId, {
        step: 'resolving',
        progressPercent: 15,
        message: url ? `Validating URL and scraping product page metadata...` : `Resolving product specifications for '${query || 'Visual Input'}'...`,
      });

      const product = await resolveProduct({ query, url, imageBase64 });

      // Step 2: Vision Brain Attribute Extraction
      broadcastSSE(searchId, {
        step: 'vision_analysis',
        progressPercent: 35,
        message: `Vision Brain analyzing product aesthetics (silhouette, colors, materials, graphics)...`,
      });

      const attributes = await extractVisualAttributes(product);

      // Step 3: Parallel Video Sourcing (Instagram Reels & Meta Ad Library + optional TikTok)
      broadcastSSE(searchId, {
        step: 'collecting_instagram',
        progressPercent: 55,
        message: `Querying Instagram Reels API & Meta Ad Library in parallel (20+ target each)...`,
      });

      const sourcing = await collectAllVideoSources(product, attributes, {
        includeTikTok: Boolean(includeTikTok),
        minPerRequiredSource: 20,
        onProgress: (platform, msg) => {
          broadcastSSE(searchId, {
            step: platform === 'instagram' ? 'collecting_instagram' : 'collecting_meta',
            progressPercent: 65,
            message: msg,
          });
        },
      });

      // Combine raw candidates
      const rawCandidates: VideoResult[] = [
        ...sourcing.instagramVideos,
        ...sourcing.metaVideos,
        ...sourcing.tiktokVideos,
      ];

      // Step 4: De-duplication and Cross-Search History Filtering
      broadcastSSE(searchId, {
        step: 'deduplicating',
        progressPercent: 80,
        message: `Filtering cross-search history duplicates, canonical media hashes, and ad variants...`,
      });

      const deduplicated = deduplicateVideos(rawCandidates, searchId, query || product.title);

      // Check if deduplication caused a shortfall below 20 for either required source
      let finalUniqueResults = deduplicated.freshUniqueResults;
      let igCount = finalUniqueResults.filter(v => v.platform === 'instagram').length;
      let metaCount = finalUniqueResults.filter(v => v.platform === 'meta').length;

      // Query Expansion fallback if deduplication dropped below minimum
      if (igCount < 20) {
        broadcastSSE(searchId, {
          step: 'collecting_instagram',
          progressPercent: 85,
          message: `Instagram Reels deduplication left ${igCount}/20. Expanding query with secondary hashtags...`,
        });
        const additionalIg = await collectPlatformVideos('instagram', product, attributes, 20 - igCount);
        const secondDedup = deduplicateVideos(additionalIg, searchId, query || product.title);
        finalUniqueResults.push(...secondDedup.freshUniqueResults);
      }

      if (metaCount < 20) {
        broadcastSSE(searchId, {
          step: 'collecting_meta',
          progressPercent: 88,
          message: `Meta Ad Library deduplication left ${metaCount}/20. Widening query to brand variations...`,
        });
        const additionalMeta = await collectPlatformVideos('meta', product, attributes, 20 - metaCount);
        const secondDedup = deduplicateVideos(additionalMeta, searchId, query || product.title);
        finalUniqueResults.push(...secondDedup.freshUniqueResults);
      }

      // Step 5: Scoring verification and Ranking
      broadcastSSE(searchId, {
        step: 'scoring',
        progressPercent: 95,
        message: `Ranking verified videos by visual match score (0-100) and threshold filter...`,
      });

      // Recount platforms
      const finalIg = finalUniqueResults.filter(v => v.platform === 'instagram').length;
      const finalMeta = finalUniqueResults.filter(v => v.platform === 'meta').length;
      const finalTikTok = finalUniqueResults.filter(v => v.platform === 'tiktok').length;

      // Attach previously seen items to record (marked so UI can toggle them)
      const allReturnedVideos = [
        ...finalUniqueResults,
        ...deduplicated.previouslySeenResults,
      ];

      const record: SearchRecord = {
        id: searchId,
        query: query || product.title,
        url,
        product,
        attributes,
        totalVideos: allReturnedVideos.length,
        instagramCount: finalIg,
        metaCount: finalMeta,
        tiktokCount: finalTikTok,
        filteredDuplicatesCount: deduplicated.internalDuplicatesCount + deduplicated.previouslySeenResults.length,
        results: allReturnedVideos,
        createdAt: new Date().toISOString(),
      };

      saveSearchRecord(record);

      broadcastSSE(searchId, {
        step: 'complete',
        progressPercent: 100,
        message: `Discovered ${finalIg} Instagram Reels and ${finalMeta} Meta Ads (${record.filteredDuplicatesCount} duplicates filtered).`,
      });

      res.json({
        success: true,
        searchId,
        record,
      });
    } catch (err: any) {
      console.error('Pipeline Execution Error:', err);
      broadcastSSE(searchId, {
        step: 'error',
        progressPercent: 100,
        message: `Pipeline halted: ${err.message}`,
      });
      res.status(500).json({
        success: false,
        searchId,
        error: err.message,
      });
    }
  });

  // 4. Retrieve Search Record by ID
  app.get('/api/search/:id', (req, res) => {
    const record = getSearchRecord(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Search record not found.' });
    }
    res.json({ success: true, record });
  });

  // 5. Search History
  app.get('/api/history', (_req, res) => {
    const searches = getAllSearches();
    const stats = getDeduplicationStats();
    res.json({ success: true, searches, stats });
  });

  app.delete('/api/history', (_req, res) => {
    clearSearchHistory();
    clearSeenCache();
    res.json({ success: true, message: 'Search history and deduplication registry cleared.' });
  });

  // 6. Bookmarks / Shortlist
  app.get('/api/bookmarks', (_req, res) => {
    const bookmarks = getBookmarks();
    res.json({ success: true, bookmarks });
  });

  app.post('/api/bookmark', (req, res) => {
    const { video } = req.body;
    if (!video || !video.id) {
      return res.status(400).json({ success: false, error: 'Valid video object required.' });
    }
    const result = toggleBookmarkVideo(video);
    res.json({ success: true, ...result });
  });

  // 7. Test Evidence for 5 Core Products
  app.get('/api/test-evidence', (_req, res) => {
    res.json({ success: true, evidence: TEST_EVIDENCE_RECORDS });
  });

  return app;
}
