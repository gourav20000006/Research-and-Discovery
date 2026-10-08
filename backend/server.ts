import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { resolveProduct, createProductSearchContext } from './services/resolver.js';
import { extractVisualAttributes } from './services/visionBrain.js';
import { collectAllVideoSources, collectPlatformVideos } from './services/videoCollector.js';
import { deduplicateVideos, clearSeenCache, getDeduplicationStats } from './services/deduplicator.js';
import { saveSearchRecord, getSearchRecord, getAllSearches, clearSearchHistory, toggleBookmarkVideo, getBookmarks, TEST_EVIDENCE_RECORDS } from './services/db.js';
import { executeDiscoveryAgents } from './services/agents/aiAgentDiscovery.js';
import { inspectDetailsFromInternet } from './services/aiInternetInspector.js';
import { SearchRecord, PipelineProgressEvent, VideoResult, AIInspectionRequest } from './types.js';

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

  // Dedicated health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, service: 'backend', status: 'healthy' });
  });

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

  // 2.5 AI Internet Deep Inspector & Media Extractor (By Video URL, Image, or Name)
  app.post('/api/ai/inspect', async (req, res) => {
    try {
      const { inputType, videoUrl, imageBase64, imageUrl, name, aiProvider, customOpenAiKey } = req.body;
      if (!inputType) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameter 'inputType' ('video_url' | 'image' | 'name').",
        });
      }

      if (inputType === 'video_url' && !videoUrl) {
        return res.status(400).json({ success: false, error: 'Please provide a valid video URL.' });
      }
      if (inputType === 'image' && !imageBase64 && !imageUrl) {
        return res.status(400).json({ success: false, error: 'Please provide an image file or image URL.' });
      }
      if (inputType === 'name' && !name) {
        return res.status(400).json({ success: false, error: 'Please provide a product name or keyword.' });
      }

      const inspection = await inspectDetailsFromInternet({
        inputType,
        videoUrl,
        imageBase64,
        imageUrl,
        name,
        aiProvider: aiProvider || 'gemini',
        customOpenAiKey,
      });

      res.json(inspection);
    } catch (err: any) {
      console.error('AI Inspection error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to inspect details from the internet.',
      });
    }
  });

  // 3. Full Search Pipeline Orchestrator with AI Agents & Fallback Architecture
  app.post('/api/search', async (req, res) => {
    const searchId = `search_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const { query, url, imageBase64, includeTikTok, minMatchThreshold = 55 } = req.body;

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
        progressPercent: 10,
        message: url ? `Validating URL and scraping product page metadata...` : `Resolving product specifications for '${query || 'Visual Input'}'...`,
      });

      const product = await resolveProduct({ query, url, imageBase64 });

      // Step 2: Vision Brain Attribute Extraction
      broadcastSSE(searchId, {
        step: 'vision_analysis',
        progressPercent: 25,
        message: `Vision Brain extracting aesthetics (silhouette, colors, materials, graphics)...`,
      });

      const attributes = await extractVisualAttributes(product);
      const productContext = createProductSearchContext(product, attributes.searchKeywords);

      // Step 3: Run AI Agent Discovery Pipeline with Fallback Priority & Rate-Limiter
      const agentResult = await executeDiscoveryAgents({
        product,
        context: productContext,
        attributes,
        includeTikTok: Boolean(includeTikTok),
        minMatchThreshold: Number(minMatchThreshold) || 55,
        onProgress: (event) => broadcastSSE(searchId, event),
      });

      const finalIg = agentResult.results.filter(v => v.platform === 'instagram').length;
      const finalMeta = agentResult.results.filter(v => v.platform === 'meta').length;
      const finalTikTok = agentResult.results.filter(v => v.platform === 'tiktok').length;

      const record: SearchRecord = {
        id: searchId,
        query: query || product.title,
        url,
        product,
        productContext,
        attributes,
        totalVideos: agentResult.results.length,
        instagramCount: finalIg,
        metaCount: finalMeta,
        tiktokCount: finalTikTok,
        filteredDuplicatesCount: agentResult.dedupStats?.crossSearchDuplicates || 0,
        results: agentResult.results,
        instagramReport: agentResult.instagram,
        metaReport: agentResult.meta_ads,
        summaryNotice: agentResult.summaryNotice,
        createdAt: new Date().toISOString(),
      };

      saveSearchRecord(record);

      res.json({
        success: true,
        searchId,
        search_status: agentResult.search_status,
        summaryNotice: agentResult.summaryNotice,
        instagram: agentResult.instagram,
        meta_ads: agentResult.meta_ads,
        provenanceBreakdown: agentResult.provenanceBreakdown,
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

const app = createExpressApp();
export default app;

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}

