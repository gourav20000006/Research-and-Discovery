export interface ProductResolved {
  title: string;
  description: string;
  mainImage: string;
  brand?: string;
  price?: string;
  sourceUrl?: string;
  isScraped: boolean;
}

export interface VisualAttributes {
  productType: string;
  primaryColors: string[];
  materials: string[];
  printsOrGraphics: string[];
  logosOrText: string[];
  silhouetteShape: string;
  targetAudience?: string;
  searchKeywords: string[];
  instagramHashtags: string[];
  metaAdQueries: string[];
}

export type PlatformType = 'instagram' | 'meta' | 'tiktok';

export interface VideoResult {
  id: string; // Unique hash or platform ID
  platform: PlatformType;
  title: string;
  caption: string;
  thumbnailUrl: string;
  videoUrl: string;
  sourceUrl: string;
  author: {
    name: string;
    handle: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  adMetadata?: {
    adId?: string;
    advertiserName?: string;
    runningStatus?: 'Active' | 'Inactive';
    startedRunningDate?: string;
    platformsIncluded?: string[];
    callToAction?: string;
  };
  matchScore: number; // 0 - 100
  matchReason: string;
  detectedVisualFeatures: string[];
  isMatch: boolean; // matchScore >= threshold
  publishedAt: string;
  contentHash: string;
  isPreviouslySeen?: boolean;
  isNearDuplicate?: boolean;
  duplicateOfId?: string;
  searchId?: string;
}

export interface PipelineProgressEvent {
  step: 'resolving' | 'vision_analysis' | 'collecting_instagram' | 'collecting_meta' | 'collecting_tiktok' | 'deduplicating' | 'scoring' | 'complete' | 'error';
  progressPercent: number;
  message: string;
  details?: Record<string, any>;
}

export interface SearchRecord {
  id: string;
  query: string;
  url?: string;
  product: ProductResolved;
  attributes: VisualAttributes;
  totalVideos: number;
  instagramCount: number;
  metaCount: number;
  tiktokCount: number;
  filteredDuplicatesCount: number;
  results: VideoResult[];
  createdAt: string;
}

export interface TestEvidenceRecord {
  productName: string;
  category: string;
  testQueryOrUrl: string;
  instagramCount: number;
  metaCount: number;
  tiktokCount: number;
  averageScore: number;
  highMatchSample: {
    platform: string;
    score: number;
    reason: string;
  };
  lowMatchSample: {
    platform: string;
    score: number;
    reason: string;
  };
  duplicatesFiltered: number;
  dedupRatio: string;
}
