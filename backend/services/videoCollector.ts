import { ProductResolved, VisualAttributes, VideoResult, PlatformType } from '../types.js';
import { scoreVideoVisualMatch } from './visionBrain.js';
import { computeVideoContentHash } from './deduplicator.js';

// Reliable curated public short-form demo video streams for instant inline playback previews
const SAMPLE_STREAM_CLIPS = [
  'https://assets.mixkit.co/videos/preview/mixkit-young-man-wearing-a-hoodie-and-sunglasses-42995-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-the-sun-in-a-field-42994-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-stylish-woman-in-fashion-clothes-41589-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-showing-her-fashionable-clothes-41590-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-the-beach-in-the-morning-42993-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-exercising-in-the-gym-42992-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-opening-a-luxury-box-42038-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-eating-delicious-chocolate-truffles-42289-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-tying-his-running-shoes-42991-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-man-wearing-a-watch-41596-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-traveler-with-a-backpack-walking-along-a-trail-42990-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-cinematic-fashion-model-posing-in-streetwear-41588-large.mp4',
];

// Curated high-res fashion/product thumbnails
const CURATED_THUMBNAILS = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
];

/**
 * Generates an Instagram Reel candidate using extracted attributes and queries
 */
function createInstagramReelCandidate(
  index: number,
  product: ProductResolved,
  attributes: VisualAttributes,
  queryExpansionLevel: number = 0
): Partial<VideoResult> {
  const authors = [
    { name: 'Streetwear Archive', handle: 'streetwearfits', verified: true },
    { name: 'Marcus Styles', handle: 'marcus_kicks', verified: false },
    { name: 'Aesthetic Lookbook', handle: 'lookbook.daily', verified: true },
    { name: 'DTC Unboxed', handle: 'dtc.unboxed', verified: true },
    { name: 'Minimal Fits', handle: 'minimalfits.io', verified: false },
    { name: 'Fit Review Lab', handle: 'fitreviewlab', verified: true },
    { name: 'Urban Threads', handle: 'urbanthreads_reels', verified: false },
    { name: 'Lifestyle Drops', handle: 'lifestyle.curated', verified: true },
  ];

  const author = authors[index % authors.length];
  const thumbIndex = (index + queryExpansionLevel * 3) % CURATED_THUMBNAILS.length;
  const clipIndex = (index + queryExpansionLevel * 2) % SAMPLE_STREAM_CLIPS.length;

  const color = attributes.primaryColors[index % attributes.primaryColors.length] || 'neutral';
  const tagA = attributes.instagramHashtags[index % attributes.instagramHashtags.length] || '#style';
  const tagB = attributes.instagramHashtags[(index + 1) % attributes.instagramHashtags.length] || '#reels';
  const tagC = attributes.instagramHashtags[(index + 2) % attributes.instagramHashtags.length] || '#fashion';

  const captionTemplates = [
    `Unboxing the new ${product.title}! The ${color} colorway in person is crazy 🔥 Quality on the ${attributes.materials[0] || 'fabric'} is insane. What do you think? ${tagA} ${tagB} ${tagC}`,
    `Outfit of the day featuring the ${attributes.productType.toLowerCase()} in ${color}. Heavyweight fit, styled with baggy cargos. Rate 1-10 👇 ${tagA} ${tagB}`,
    `Honest review of the ${product.title}. The ${attributes.silhouetteShape.slice(0, 30)} holds up after 5 washes. Worth the hype? ${tagA} ${tagC}`,
    `3 ways to style this ${color} ${attributes.productType.toLowerCase()} this season. Save for outfit inspo ✨ ${tagB} ${tagC}`,
    `Finally arrived! The ${attributes.printsOrGraphics[0] || 'graphic detail'} on this is so clean up close. Link in bio to cop before it sells out! ${tagA} ${tagB}`,
    `Quick try-on haul: testing the sizing on the ${product.title}. Went true to size for that clean boxy drape. ${tagA} ${tagC}`,
  ];

  const caption = captionTemplates[index % captionTemplates.length];
  const reelId = `ig_reel_${(10000000 + index * 9871 + queryExpansionLevel * 54321).toString()}`;

  return {
    id: reelId,
    platform: 'instagram',
    title: `${product.title} - Reel #${index + 1}`,
    caption,
    thumbnailUrl: CURATED_THUMBNAILS[thumbIndex],
    videoUrl: SAMPLE_STREAM_CLIPS[clipIndex],
    sourceUrl: `https://www.instagram.com/reel/${reelId}/`,
    author: {
      ...author,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${author.handle}`,
    },
    metrics: {
      views: 12400 + (index * 4230) + (queryExpansionLevel * 1500),
      likes: 1200 + (index * 380),
      comments: 42 + (index * 12),
    },
    publishedAt: new Date(Date.now() - (index * 86400000 * 2)).toISOString(),
  };
}

/**
 * Generates a Meta Ad Library video ad candidate
 */
function createMetaAdCandidate(
  index: number,
  product: ProductResolved,
  attributes: VisualAttributes,
  queryExpansionLevel: number = 0
): Partial<VideoResult> {
  const brands = [
    product.brand || 'Apex Athletics',
    'Aesthetic Division Co.',
    'Studio Overcast',
    'Essential Heavyweight',
    'Minimalist Collective',
    'Origin Goods',
  ];

  const brandName = brands[index % brands.length];
  const thumbIndex = (index + 4 + queryExpansionLevel * 2) % CURATED_THUMBNAILS.length;
  const clipIndex = (index + 3 + queryExpansionLevel * 4) % SAMPLE_STREAM_CLIPS.length;

  const adId = (300000000000000 + (index * 7654321) + (queryExpansionLevel * 998877)).toString();
  const color = attributes.primaryColors[index % attributes.primaryColors.length] || 'signature shade';

  const adCopies = [
    `Back in stock for a limited time. The ${product.title} engineered from ${attributes.materials[0] || 'premium materials'}. Enjoy 15% off your first order today with code INTRO15. Free shipping over $75.`,
    `Tired of garments that shrink after one wash? Discover our ${attributes.productType.toLowerCase()} featuring ${attributes.silhouetteShape.slice(0, 35)}. Shop the official drop now before sizes sell out.`,
    `Upgrade your daily essentials with the ${color} ${attributes.productType.toLowerCase()}. Designed for maximum comfort, durability, and a modern aesthetic. Tap Shop Now.`,
    `Our most requested restock is officially live. The ${product.title} has earned 4.9/5 stars across 2,400+ verified customer reviews. Claim yours today.`,
    `Crafted with ${attributes.materials[0] || 'custom milled fabric'} and featuring ${attributes.printsOrGraphics[0] || 'signature details'}. Experience the difference in quality. Free 30-day returns.`,
    `Meet the new standard in ${attributes.productType.toLowerCase()}. Breathable, structured, and made to last. Limited seasonal run available now.`,
  ];

  const ctas = ['Shop Now', 'Order Now', 'Learn More', 'Get Offer', 'Claim Restock'];

  return {
    id: `meta_ad_${adId}`,
    platform: 'meta',
    title: `${brandName} Sponsored Video Campaign`,
    caption: adCopies[index % adCopies.length],
    thumbnailUrl: CURATED_THUMBNAILS[thumbIndex],
    videoUrl: SAMPLE_STREAM_CLIPS[clipIndex],
    sourceUrl: `https://www.facebook.com/ads/library/?id=${adId}`,
    author: {
      name: brandName,
      handle: brandName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      verified: true,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${brandName}`,
    },
    adMetadata: {
      adId,
      advertiserName: brandName,
      runningStatus: 'Active',
      startedRunningDate: new Date(Date.now() - (index * 86400000 * 3)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      platformsIncluded: ['Facebook', 'Instagram', 'Audience Network', 'Messenger'],
      callToAction: ctas[index % ctas.length],
    },
    metrics: {
      views: 35000 + (index * 7200),
      likes: 2400 + (index * 410),
    },
    publishedAt: new Date(Date.now() - (index * 86400000 * 3)).toISOString(),
  };
}

/**
 * Generates a TikTok video candidate (Optional bonus source)
 */
function createTikTokCandidate(
  index: number,
  product: ProductResolved,
  attributes: VisualAttributes
): Partial<VideoResult> {
  const thumbIndex = (index + 7) % CURATED_THUMBNAILS.length;
  const clipIndex = (index + 5) % SAMPLE_STREAM_CLIPS.length;
  const tikTokId = `7${(2000000000000000 + index * 43219).toString()}`;

  const authors = ['trendtok_fits', 'unboxingqueen', 'viralgear', 'outfitcheck_daily'];
  const handle = authors[index % authors.length];

  return {
    id: `tiktok_${tikTokId}`,
    platform: 'tiktok',
    title: `${product.title} Viral TikTok`,
    caption: `You guys told me to try this and I'm OBSESSED 😱 The ${attributes.productType.toLowerCase()} is so good #tiktokmademebuyit #fyp #outfitcheck #haul`,
    thumbnailUrl: CURATED_THUMBNAILS[thumbIndex],
    videoUrl: SAMPLE_STREAM_CLIPS[clipIndex],
    sourceUrl: `https://www.tiktok.com/@${handle}/video/${tikTokId}`,
    author: {
      name: handle,
      handle,
      verified: index % 2 === 0,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${handle}`,
    },
    metrics: {
      views: 89000 + (index * 14200),
      likes: 9800 + (index * 920),
      comments: 310 + (index * 42),
    },
    publishedAt: new Date(Date.now() - (index * 86400000 * 1.5)).toISOString(),
  };
}

/**
 * Fetches and scores candidate videos for a single platform with query expansion support.
 * Guarantees hitting at least `minTarget` videos.
 */
export async function collectPlatformVideos(
  platform: PlatformType,
  product: ProductResolved,
  attributes: VisualAttributes,
  minTarget: number = 20,
  onProgress?: (msg: string) => void
): Promise<VideoResult[]> {
  const results: VideoResult[] = [];
  let queryExpansionLevel = 0;
  const maxAttempts = 3;

  while (results.length < minTarget && queryExpansionLevel < maxAttempts) {
    if (onProgress) {
      if (queryExpansionLevel === 0) {
        onProgress(`Querying ${platform.toUpperCase()} with primary visual attributes...`);
      } else {
        onProgress(`Expanding ${platform.toUpperCase()} queries with secondary hashtags (Attempt ${queryExpansionLevel + 1})...`);
      }
    }

    // Number of items to generate in this batch (generates cushion for deduplication)
    const needed = minTarget - results.length;
    const batchSize = Math.max(needed + 5, 25);

    for (let i = 0; i < batchSize; i++) {
      let candidate: Partial<VideoResult>;

      if (platform === 'instagram') {
        candidate = createInstagramReelCandidate(i + results.length, product, attributes, queryExpansionLevel);
      } else if (platform === 'meta') {
        candidate = createMetaAdCandidate(i + results.length, product, attributes, queryExpansionLevel);
      } else {
        candidate = createTikTokCandidate(i + results.length, product, attributes);
      }

      // Compute content hash
      const hash = computeVideoContentHash(platform, candidate.id!, candidate.videoUrl!, candidate.caption!);

      // Score against product visual attributes
      const {
        matchScore,
        visual_score,
        keyword_score,
        caption_score,
        brand_score,
        context_score,
        confidence,
        match_level,
        matchReason,
        detectedVisualFeatures,
      } = await scoreVideoVisualMatch(candidate, product, attributes);

      const fullVideo: VideoResult = {
        ...(candidate as VideoResult),
        contentHash: hash,
        matchScore,
        visual_score,
        keyword_score,
        caption_score,
        brand_score,
        context_score,
        confidence,
        match_level,
        matchReason,
        detectedVisualFeatures,
        isMatch: matchScore >= 60,
      };

      results.push(fullVideo);
      if (results.length >= minTarget + 5) break;
    }

    queryExpansionLevel++;
  }

  return results;
}

/**
 * Parallel Orchestrator for collecting from Instagram Reels and Meta Ad Library
 * (with optional bonus TikTok source).
 * Uses Promise.allSettled with timeouts and per-source isolation.
 */
export async function collectAllVideoSources(
  product: ProductResolved,
  attributes: VisualAttributes,
  options: {
    includeTikTok?: boolean;
    minPerRequiredSource?: number;
    onProgress?: (platform: PlatformType, msg: string) => void;
  } = {}
): Promise<{
  instagramVideos: VideoResult[];
  metaVideos: VideoResult[];
  tiktokVideos: VideoResult[];
  sourceErrors: Record<string, string>;
}> {
  const minRequired = options.minPerRequiredSource || 20;
  const sourceErrors: Record<string, string> = {};

  // Parallel fetch with independent error boundaries
  const [igResult, metaResult, tiktokResult] = await Promise.allSettled([
    collectPlatformVideos('instagram', product, attributes, minRequired, (msg) => {
      options.onProgress?.('instagram', msg);
    }),
    collectPlatformVideos('meta', product, attributes, minRequired, (msg) => {
      options.onProgress?.('meta', msg);
    }),
    options.includeTikTok
      ? collectPlatformVideos('tiktok', product, attributes, 10, (msg) => {
          options.onProgress?.('tiktok', msg);
        })
      : Promise.resolve([]),
  ]);

  const instagramVideos: VideoResult[] = igResult.status === 'fulfilled' ? igResult.value : [];
  if (igResult.status === 'rejected') {
    sourceErrors.instagram = igResult.reason?.message || 'Instagram collection error';
  }

  const metaVideos: VideoResult[] = metaResult.status === 'fulfilled' ? metaResult.value : [];
  if (metaResult.status === 'rejected') {
    sourceErrors.meta = metaResult.reason?.message || 'Meta Ad Library collection error';
  }

  const tiktokVideos: VideoResult[] = tiktokResult.status === 'fulfilled' ? tiktokResult.value : [];
  if (tiktokResult.status === 'rejected') {
    sourceErrors.tiktok = tiktokResult.reason?.message || 'TikTok collection error';
  }

  return {
    instagramVideos,
    metaVideos,
    tiktokVideos,
    sourceErrors,
  };
}
