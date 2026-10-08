export interface ProductResolved {
  title: string;
  description: string;
  mainImage: string;
  brand?: string;
  price?: string;
  sourceUrl?: string;
  isScraped: boolean;
  extractionPath?: string;
  visualAssetAvailable?: boolean;
  aiInternetGrounded?: boolean;
  aiSummary?: string;
  sources?: AIInspectionSource[];
  discoveredTags?: string[];
  mediaContext?: AIMediaDetails;
}

export interface ProductSearchContext {
  product_title: string;
  description: string;
  brand?: string;
  image_url: string;
  keywords: string[];
  source_url?: string;
  price?: string;
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

export type ProviderStatus = 
  | 'AVAILABLE' 
  | 'PARTIAL' 
  | 'UNSUPPORTED' 
  | 'RATE_LIMITED' 
  | 'AUTH_REQUIRED' 
  | 'TEMPORARILY_UNAVAILABLE' 
  | 'NO_RESULTS' 
  | 'ERROR';

export type SourceTier = 
  | 'official_api' 
  | 'public_library' 
  | 'approved_provider' 
  | 'fallback';

export interface ProviderReport {
  provider: string; // e.g. 'meta_ad_library_api', 'meta_ad_library_public', 'instagram_api', 'third_party_provider'
  sourceTier: SourceTier;
  sourceLabel: string; // e.g. 'Meta Ad Library — Official API', 'Instagram — Approved Data Provider'
  status: ProviderStatus;
  requested: number;
  found: number;
  scope_supported?: boolean;
  available: boolean;
  reason?: string;
  fallbackChain?: string[];
  rateLimitRemaining?: number;
  rateLimitResetInSeconds?: number;
}

export interface VideoResult {
  id: string; // Unique hash or platform ID (platform + normalized_video_url)
  platform: PlatformType;
  title: string;
  caption: string;
  thumbnailUrl: string;
  videoUrl: string;
  sourceUrl: string;
  sourceTier?: SourceTier;
  sourceLabel?: string;
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
  // Detailed Combined Relevance Scoring (0 - 100)
  matchScore: number;
  visual_score: number | null; // null if no permitted visual asset was available
  keyword_score: number;
  caption_score: number;
  brand_score: number;
  context_score: number;
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  match_confidence?: 'high' | 'medium' | 'low' | 'unknown';
  match_level: 'very_strong' | 'strong' | 'possible' | 'weak';
  matchReason: string;
  detectedVisualFeatures: string[];
  visualAssetAvailable?: boolean;
  isMatch: boolean;
  publishedAt: string;
  contentHash: string;
  isPreviouslySeen?: boolean;
  isNearDuplicate?: boolean;
  duplicateOfId?: string;
  searchId?: string;
}

export interface DiscoveredVideoEntry {
  video_id: string;
  platform: PlatformType;
  video_url: string;
  product_context: string;
  first_seen: string;
  last_seen: string;
}

export interface PipelineProgressEvent {
  step: 
    | 'resolving' 
    | 'auditing_providers'
    | 'vision_analysis' 
    | 'collecting_instagram' 
    | 'collecting_meta' 
    | 'collecting_tiktok' 
    | 'deduplicating' 
    | 'scoring' 
    | 'complete' 
    | 'error';
  progressPercent: number;
  message: string;
  details?: Record<string, any>;
}

export interface FinalSearchResponse {
  success: boolean;
  searchId: string;
  search_status: 'complete' | 'partial' | 'fallback' | 'empty' | 'error';
  summaryNotice?: string;
  instagram: ProviderReport;
  meta_ads: ProviderReport;
  tiktok?: ProviderReport;
  product: ProductResolved;
  productContext: ProductSearchContext;
  attributes: VisualAttributes;
  results: VideoResult[];
  dedupStats?: {
    totalEvaluated: number;
    crossSearchDuplicates: number;
    nearDuplicateAds: number;
    exactIdCollisions: number;
    passedDeduplication: number;
  };
  provenanceBreakdown: {
    officialApiCount: number;
    publicLibraryCount: number;
    approvedProviderCount: number;
  };
}

export interface SearchRecord {
  id: string;
  query: string;
  url?: string;
  product: ProductResolved;
  productContext?: ProductSearchContext;
  attributes: VisualAttributes;
  totalVideos: number;
  instagramCount: number;
  metaCount: number;
  tiktokCount: number;
  filteredDuplicatesCount: number;
  results: VideoResult[];
  instagramReport?: ProviderReport;
  metaReport?: ProviderReport;
  summaryNotice?: string;
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
    sourceLabel?: string;
  };
  lowMatchSample: {
    platform: string;
    score: number;
    reason: string;
    sourceLabel?: string;
  };
  duplicatesFiltered: number;
  dedupRatio: string;
  instagramStatus: ProviderStatus;
  metaStatus: ProviderStatus;
}

export interface AIInspectionSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface AIProductDetails {
  name: string;
  brand: string;
  category: string;
  description: string;
  estimatedPrice?: string;
  officialWebsite?: string;
  keyFeatures: string[];
  colorwaysOrMaterials: string[];
  targetAudience: string;
  identifiedImage?: string;
}

export interface AIMediaDetails {
  platformDetected?: 'Instagram' | 'Meta Ad' | 'TikTok' | 'YouTube Shorts' | 'General Video' | 'Web Page' | 'Image';
  creatorOrAdvertiser?: string;
  videoHookOrCaption?: string;
  audioTrackOrMusic?: string;
  visualStyle?: string;
  commercialIntent?: 'High Commercial / Conversion' | 'UGC Organic Review' | 'Editorial / Lifestyle' | 'Unboxing';
  adAnglesAndHooks?: string[];
}

export interface AIInspectionResult {
  success: boolean;
  inputType: 'video_url' | 'image' | 'name';
  inputRef: string;
  aiModelUsed: string;
  aiProvider: 'gemini' | 'openai';
  discoveredProduct: AIProductDetails;
  mediaDetails?: AIMediaDetails;
  internetGrounding: {
    searchQueriesUsed: string[];
    sources: AIInspectionSource[];
    groundingSummary: string;
  };
  recommendedQueries: {
    instagramKeywords: string[];
    metaAdLibraryQueries: string[];
    hashtags: string[];
  };
  rawAnalysisText?: string;
  timestamp: string;
}

export interface AIInspectionRequest {
  inputType: 'video_url' | 'image' | 'name';
  videoUrl?: string;
  imageBase64?: string;
  imageUrl?: string;
  name?: string;
  aiProvider?: 'gemini' | 'openai';
  customOpenAiKey?: string;
}

