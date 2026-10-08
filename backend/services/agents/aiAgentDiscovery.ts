import { 
  ProductResolved, 
  ProductSearchContext, 
  VisualAttributes, 
  VideoResult, 
  FinalSearchResponse, 
  ProviderReport, 
  PipelineProgressEvent 
} from '../../types.js';
import { MetaAdLibraryProvider } from '../providers/MetaAdLibraryProvider.js';
import { InstagramReelsProvider } from '../providers/InstagramReelsProvider.js';
import { scoreVideoVisualMatch } from '../visionBrain.js';
import { deduplicateVideos, computeVideoContentHash } from '../deduplicator.js';

const metaProvider = new MetaAdLibraryProvider();
const instagramProvider = new InstagramReelsProvider();

export interface AgentDiscoveryOptions {
  product: ProductResolved;
  context: ProductSearchContext;
  attributes: VisualAttributes;
  includeTikTok?: boolean;
  minMatchThreshold?: number;
  onProgress?: (event: PipelineProgressEvent) => void;
}

/**
 * AI AGENT 1: Provider Auditor & Scope Agent
 * Evaluates requested search terms against platform policies and API capabilities.
 */
export async function auditProviders(
  query: string,
  context: ProductSearchContext
): Promise<{
  instagramCaps: any;
  metaCaps: any;
  auditSummary: string;
}> {
  const [instagramCaps, metaCaps] = await Promise.all([
    instagramProvider.checkCapabilities(),
    metaProvider.checkCapabilities({ geography: 'GLOBAL', adType: 'COMMERCIAL' }),
  ]);

  const auditSummary = `Audited search scopes for '${context.product_title}'. ` +
    `Meta Official Graph API: ${metaCaps.scope_supported ? 'Commercial EU/UK Supported' : 'Global Commercial Restricted — Using Public Library Fallback'}. ` +
    `Instagram Graph API: ${instagramCaps.search_supported ? 'Public Keyword Supported' : 'Keyword Discovery Restricted — Using Approved Data Provider'}.`;

  return { instagramCaps, metaCaps, auditSummary };
}

/**
 * AI AGENT 2 & 3: Fallback Orchestrator & Multi-Provider Collector Agent
 * Executes queries sequentially down each platform's compliant fallback chain.
 * Never fabricates results or duplicates entries to reach the target quota.
 */
export async function executeDiscoveryAgents(options: AgentDiscoveryOptions): Promise<FinalSearchResponse> {
  const { product, context, attributes, minMatchThreshold = 55, onProgress } = options;
  const searchId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Step 1: Provider Audit Agent
  onProgress?.({
    step: 'auditing_providers',
    progressPercent: 20,
    message: 'Auditing platform API scopes, access rights, and legal fallback pathways...',
  });

  const { auditSummary } = await auditProviders(context.product_title, context);

  // Step 2: Instagram Discovery Agent
  onProgress?.({
    step: 'collecting_instagram',
    progressPercent: 40,
    message: 'Executing Instagram Reels discovery via verified fallback chain...',
  });

  const igDiscovery = await instagramProvider.search(context.product_title, context, 20);

  // Step 3: Meta Ad Library Discovery Agent
  onProgress?.({
    step: 'collecting_meta',
    progressPercent: 60,
    message: 'Executing Meta Ad Library discovery via compliant public repository...',
  });

  const metaDiscovery = await metaProvider.search(context.product_title, context, 20);

  // Raw candidates combined
  const rawCandidates: Partial<VideoResult>[] = [
    ...igDiscovery.results,
    ...metaDiscovery.results,
  ];

  // Step 4: AI Visual Verification & Authenticity Agent
  onProgress?.({
    step: 'vision_analysis',
    progressPercent: 75,
    message: 'Analyzing visual correspondence and multi-factor relevance scoring...',
  });

  const scoredCandidates: VideoResult[] = [];
  for (const raw of rawCandidates) {
    const scoreResult = await scoreVideoVisualMatch(raw, product, attributes);
    const candidateId = raw.id || `vid_${Math.random().toString(36).substring(2, 9)}`;
    const contentHash = computeVideoContentHash(
      raw.platform || 'meta',
      candidateId,
      raw.videoUrl || '',
      raw.caption || ''
    );

    const fullResult: VideoResult = {
      ...(raw as any),
      id: candidateId,
      contentHash,
      matchScore: scoreResult.matchScore,
      visual_score: scoreResult.visual_score,
      keyword_score: scoreResult.keyword_score,
      caption_score: scoreResult.caption_score,
      brand_score: scoreResult.brand_score,
      context_score: scoreResult.context_score,
      confidence: scoreResult.confidence,
      match_confidence: scoreResult.match_confidence,
      match_level: scoreResult.match_level,
      matchReason: scoreResult.matchReason,
      detectedVisualFeatures: scoreResult.detectedVisualFeatures,
      visualAssetAvailable: scoreResult.visualAssetAvailable,
      isMatch: scoreResult.matchScore >= minMatchThreshold,
      searchId,
      publishedAt: raw.publishedAt || new Date().toISOString(),
    };

    scoredCandidates.push(fullResult);
  }

  // Step 5: Provenance & Deduplication Agent
  onProgress?.({
    step: 'deduplicating',
    progressPercent: 90,
    message: 'Enforcing cross-search deduplication and verifying authentic provenance...',
  });

  const dedupResult = deduplicateVideos(scoredCandidates, searchId, context.product_title);
  const finalResults = [
    ...dedupResult.freshUniqueResults,
    ...dedupResult.previouslySeenResults,
  ];

  // Count provenance tiers
  let officialApiCount = 0;
  let publicLibraryCount = 0;
  let approvedProviderCount = 0;

  for (const item of finalResults) {
    if (item.sourceTier === 'official_api') officialApiCount++;
    else if (item.sourceTier === 'public_library') publicLibraryCount++;
    else approvedProviderCount++;
  }

  // Check if both targets met without fabricating
  const igMet = igDiscovery.report.found >= 20;
  const metaMet = metaDiscovery.report.found >= 20;
  const isSearchPartial = !igMet || !metaMet;
  const search_status = isSearchPartial ? 'partial' : 'complete';

  let summaryNotice: string | undefined;
  if (isSearchPartial) {
    summaryNotice = `We found ${igDiscovery.report.found} Instagram Reels (target: 20) and ${metaDiscovery.report.found} Meta Ad Library videos (target: 20). Additional results were unavailable from the permitted data sources without bypassing platform constraints.`;
  } else {
    summaryNotice = `Successfully discovered ${finalResults.length} verified short-form videos across Meta Ad Library and Instagram with compliant provenance.`;
  }

  const dedupStats = {
    totalEvaluated: scoredCandidates.length,
    crossSearchDuplicates: dedupResult.previouslySeenResults.length,
    nearDuplicateAds: dedupResult.internalDuplicatesCount,
    exactIdCollisions: dedupResult.internalDuplicatesCount,
    passedDeduplication: dedupResult.freshUniqueResults.length,
  };

  onProgress?.({
    step: 'complete',
    progressPercent: 100,
    message: `Pipeline completed: ${finalResults.length} legitimate videos indexed.`,
    details: {
      instagramFound: igDiscovery.report.found,
      metaFound: metaDiscovery.report.found,
      duplicatesFiltered: dedupResult.previouslySeenResults.length + dedupResult.internalDuplicatesCount,
    },
  });

  return {
    success: true,
    searchId,
    search_status,
    summaryNotice,
    instagram: igDiscovery.report,
    meta_ads: metaDiscovery.report,
    product,
    productContext: context,
    attributes,
    results: finalResults,
    dedupStats,
    provenanceBreakdown: {
      officialApiCount,
      publicLibraryCount,
      approvedProviderCount,
    },
  };
}
