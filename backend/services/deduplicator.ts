import crypto from 'crypto';
import { VideoResult } from '../types.js';

interface SeenVideoEntry {
  videoId: string;
  contentHash: string;
  searchId: string;
  query: string;
  seenAt: number;
}

// In-memory cross-search registry of seen video IDs and content hashes
const seenVideosRegistry = new Map<string, SeenVideoEntry>();
const seenHashesRegistry = new Map<string, SeenVideoEntry>();

/**
 * Computes a deterministic canonical hash for a video based on platform, video ID, media URL, and title.
 */
export function computeVideoContentHash(platform: string, id: string, mediaUrl: string, caption: string): string {
  // Normalize caption: remove URLs, punctuation, extra whitespace
  const normalizedCaption = (caption || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim()
    .slice(0, 100);

  const cleanMediaUrl = (mediaUrl || '').split('?')[0].toLowerCase();
  const rawKey = `${platform}:${id}:${cleanMediaUrl}:${normalizedCaption}`;
  return crypto.createHash('sha256').update(rawKey).digest('hex').slice(0, 16);
}

/**
 * Jaccard text similarity calculation for near-duplicate ad copy and repost detection.
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  const tokenize = (t: string) =>
    new Set(
      (t || '')
        .toLowerCase()
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2)
    );

  const setA = tokenize(textA);
  const setB = tokenize(textB);

  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Checks whether a video is a near-duplicate of an existing candidate in the current batch.
 */
export function isNearDuplicateOf(candidate: VideoResult, existing: VideoResult): boolean {
  // 1. Same streaming video URL (re-upload or identical creative under different Ad ID)
  const cleanUrlA = (candidate.videoUrl || '').split('?')[0];
  const cleanUrlB = (existing.videoUrl || '').split('?')[0];
  if (cleanUrlA && cleanUrlB && cleanUrlA === cleanUrlB) {
    return true;
  }

  // 2. Same thumbnail URL
  const cleanThumbA = (candidate.thumbnailUrl || '').split('?')[0];
  const cleanThumbB = (existing.thumbnailUrl || '').split('?')[0];
  if (cleanThumbA && cleanThumbB && cleanThumbA === cleanThumbB) {
    return true;
  }

  // 3. For Meta Ads: same advertiser + highly similar ad copy (> 85% overlap)
  if (candidate.platform === 'meta' && existing.platform === 'meta') {
    if (
      candidate.adMetadata?.advertiserName &&
      existing.adMetadata?.advertiserName &&
      candidate.adMetadata.advertiserName.toLowerCase() === existing.adMetadata.advertiserName.toLowerCase()
    ) {
      const copySim = calculateTextSimilarity(candidate.caption, existing.caption);
      if (copySim >= 0.82) {
        return true;
      }
    }
  }

  // 4. For Instagram: same author + identical caption
  if (candidate.platform === 'instagram' && existing.platform === 'instagram') {
    if (candidate.author.handle === existing.author.handle) {
      const copySim = calculateTextSimilarity(candidate.caption, existing.caption);
      if (copySim >= 0.85) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Deduplicates a list of video results:
 * 1. Checks cross-search history (marks as previously seen)
 * 2. Checks intra-batch duplicates (exact IDs, identical hashes, and near-duplicates)
 *
 * Returns clean unique results and records them in history.
 */
export function deduplicateVideos(
  incomingVideos: VideoResult[],
  searchId: string,
  query: string
): {
  freshUniqueResults: VideoResult[];
  previouslySeenResults: VideoResult[];
  internalDuplicatesCount: number;
} {
  const freshUniqueResults: VideoResult[] = [];
  const previouslySeenResults: VideoResult[] = [];
  let internalDuplicatesCount = 0;

  for (const video of incomingVideos) {
    // Generate content hash if missing
    if (!video.contentHash) {
      video.contentHash = computeVideoContentHash(video.platform, video.id, video.videoUrl, video.caption);
    }

    // Check if seen in earlier searches
    const seenById = seenVideosRegistry.has(video.id);
    const seenByHash = seenHashesRegistry.has(video.contentHash);

    if (seenById || seenByHash) {
      video.isPreviouslySeen = true;
      previouslySeenResults.push(video);
      continue;
    }

    // Check intra-batch duplicate against items already accepted in freshUniqueResults
    const existingNearDup = freshUniqueResults.find(accepted => isNearDuplicateOf(video, accepted));
    if (existingNearDup) {
      video.isNearDuplicate = true;
      video.duplicateOfId = existingNearDup.id;
      internalDuplicatesCount++;
      continue;
    }

    // Item is fresh & unique!
    video.isPreviouslySeen = false;
    video.searchId = searchId;
    freshUniqueResults.push(video);

    // Register into seen video registry for future searches
    const entry: SeenVideoEntry = {
      videoId: video.id,
      contentHash: video.contentHash,
      searchId,
      query,
      seenAt: Date.now(),
    };
    seenVideosRegistry.set(video.id, entry);
    seenHashesRegistry.set(video.contentHash, entry);
  }

  return {
    freshUniqueResults,
    previouslySeenResults,
    internalDuplicatesCount,
  };
}

/**
 * Get total seen registry statistics
 */
export function getDeduplicationStats() {
  return {
    totalSeenVideos: seenVideosRegistry.size,
    totalContentHashes: seenHashesRegistry.size,
  };
}

/**
 * Clears deduplication seen cache
 */
export function clearSeenCache() {
  seenVideosRegistry.clear();
  seenHashesRegistry.clear();
}
