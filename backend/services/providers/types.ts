import { ProductSearchContext, ProviderReport, SourceTier, VideoResult } from '../../types.js';

export interface ProviderCapability {
  available: boolean;
  scope_supported: boolean;
  search_supported?: boolean;
  media_access_supported?: boolean;
  reason?: string;
  rateLimitRemaining?: number;
  rateLimitResetInSeconds?: number;
}

export interface IVideoDiscoveryProvider {
  id: string;
  name: string;
  tier: SourceTier;
  checkCapabilities(scope?: { geography?: string; adType?: string }): Promise<ProviderCapability>;
  search(
    query: string,
    context: ProductSearchContext,
    limit: number,
    options?: { expansionLevel?: number }
  ): Promise<{
    results: Partial<VideoResult>[];
    report: ProviderReport;
  }>;
}
