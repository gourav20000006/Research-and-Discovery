import { SearchRecord, TestEvidenceRecord, VideoResult, ProductResolved, VisualAttributes } from '../types/index.js';

export const FALLBACK_TEST_EVIDENCE: TestEvidenceRecord[] = [
  {
    productName: 'Oversized Graphic Tee',
    category: 'Streetwear Apparel',
    testQueryOrUrl: 'oversized graphic tee',
    instagramCount: 22,
    metaCount: 24,
    tiktokCount: 10,
    averageScore: 84.5,
    highMatchSample: {
      platform: 'Instagram Reels',
      score: 96,
      reason: 'Exact visual match: video clearly features the oversized streetwear t-shirt with identical washed charcoal tone and gothic angel typography.',
    },
    lowMatchSample: {
      platform: 'Meta Ad Library',
      score: 52,
      reason: 'Low match: generic athletic training shirt; missing distressed wash, dropped shoulders, and gothic font aesthetic.',
    },
    duplicatesFiltered: 6,
    dedupRatio: '11.8%',
  },
  {
    productName: 'Protein Dark Chocolate',
    category: 'Functional Nutrition & CPG',
    testQueryOrUrl: 'protein dark chocolate',
    instagramCount: 20,
    metaCount: 22,
    tiktokCount: 8,
    averageScore: 81.2,
    highMatchSample: {
      platform: 'Meta Ad Library',
      score: 94,
      reason: 'Exact visual match: segmented 12-square 85% cacao bar with visible whey crisps and gold foil packaging in macro slow-motion snap test.',
    },
    lowMatchSample: {
      platform: 'Instagram Reels',
      score: 54,
      reason: 'Low match: chocolate protein shake powder tub rather than solid artisanal dark chocolate confectionery bar.',
    },
    duplicatesFiltered: 8,
    dedupRatio: '16.0%',
  },
  {
    productName: 'Retro Running Sneakers',
    category: 'Footwear & Streetwear',
    testQueryOrUrl: 'sneakers',
    instagramCount: 25,
    metaCount: 22,
    tiktokCount: 12,
    averageScore: 86.8,
    highMatchSample: {
      platform: 'Instagram Reels',
      score: 97,
      reason: 'Exact visual match: low-top retro running silhouette featuring forest green hairy suede panels, gum waffle sole, and reflective 3M heel tab in on-foot review.',
    },
    lowMatchSample: {
      platform: 'Meta Ad Library',
      score: 48,
      reason: 'Low match: slip-on leather dress loafer; lacks suede panelling, athletic mesh, and retro runner silhouette.',
    },
    duplicatesFiltered: 9,
    dedupRatio: '16.1%',
  },
  {
    productName: 'Heavyweight Boxy Hoodie',
    category: 'Luxury Basics & Fleece',
    testQueryOrUrl: 'hoodie',
    instagramCount: 21,
    metaCount: 23,
    tiktokCount: 10,
    averageScore: 83.1,
    highMatchSample: {
      platform: 'Meta Ad Library',
      score: 92,
      reason: 'Exact visual match: 450 GSM double-faced fleece hoodie showcasing seamless kangaroo pouch, dropped shoulders, and double-layered structured hood.',
    },
    lowMatchSample: {
      platform: 'Instagram Reels',
      score: 50,
      reason: 'Low match: lightweight zip-up windbreaker jacket; lacks fleece texture, pullover boxy structure, and seamless pocket.',
    },
    duplicatesFiltered: 7,
    dedupRatio: '13.7%',
  },
  {
    productName: 'Waterproof Tactical Backpack',
    category: 'Carry & EDC Gear',
    testQueryOrUrl: 'backpack',
    instagramCount: 22,
    metaCount: 21,
    tiktokCount: 9,
    averageScore: 85.0,
    highMatchSample: {
      platform: 'Instagram Reels',
      score: 95,
      reason: 'Exact visual match: matte black TPU laminated rolltop pack with Fidlock magnetic buckle, waterproof YKK zipper, and modular attachments in rain test.',
    },
    lowMatchSample: {
      platform: 'Meta Ad Library',
      score: 46,
      reason: 'Low match: floral canvas school tote; completely lacks rolltop closure, weatherproof TPU laminate, and tactical hardware.',
    },
    duplicatesFiltered: 8,
    dedupRatio: '15.7%',
  },
];

// Sample video streams
const SAMPLE_STREAMS = [
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
];

const SAMPLE_THUMBS = [
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
];

/**
 * Generates an initial or client-simulated search record (guaranteeing 20+ IG Reels and 20+ Meta Ads)
 */
export function generateClientSearchRecord(queryOrUrl: string = 'oversized graphic tee'): SearchRecord {
  const query = queryOrUrl.toLowerCase();

  let title = 'Vintage Acid Wash Heavyweight Oversized Graphic Tee';
  let description = '280 GSM heavyweight washed cotton oversized drop-shoulder t-shirt featuring gothic typography and distressed angel wings graphic on chest and back.';
  let mainImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  let brand = 'Aesthetic Studios';
  let price = '$48.00';

  let productType = 'Oversized Streetwear T-Shirt';
  let primaryColors = ['Washed Charcoal', 'Vintage Grey', 'Off-White'];
  let materials = ['280 GSM Combed Cotton', 'Pre-shrunk Vintage Wash'];
  let printsOrGraphics = ['Distressed Gothic/Serif Chest Typography', 'Back Wings Graphic'];
  let logosOrText = ['ATHLETICS 1994', 'LIMITED DROP'];
  let silhouetteShape = 'Boxy drop-shoulder cut, wide ribbed collar';

  if (query.includes('chocolate') || query.includes('cacao')) {
    title = 'Crispy Whey Protein 85% Artisanal Dark Chocolate Bar';
    description = 'Keto-friendly 85% single-origin cacao dark chocolate infused with 15g whey isolate crisps, zero added sugar, and sea salt flakes.';
    mainImage = 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80';
    brand = 'Pulse Nutrition';
    price = '$29.99';
    productType = 'Functional Nutrition Protein Chocolate';
    primaryColors = ['Deep Espresso Brown', 'Gold Foil Accent'];
    materials = ['85% Cacao Mass', 'Whey Isolate Crisps'];
    printsOrGraphics = ['Geometric Cacao Pod Emblem'];
    logosOrText = ['15G PROTEIN', 'ZERO SUGAR'];
    silhouetteShape = 'Rectangular 12-square breakable confectionery bar';
  } else if (query.includes('sneaker') || query.includes('shoe')) {
    title = 'Retro Runner Suede Panel Streetwear Sneakers';
    description = 'Low-top retro running silhouette with cream mesh underlay, forest green hairy suede overlays, gum rubber waffle outsole, and reflective 3M heel tab.';
    mainImage = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';
    brand = 'Apex Footwear';
    price = '$135.00';
    productType = 'Retro Streetwear Running Sneakers';
    primaryColors = ['Vintage Sail/Cream', 'Forest Green Suede', 'Gum Amber'];
    materials = ['Hairy Suede Overlays', 'Breathable Nylon Mesh'];
    printsOrGraphics = ['Multi-layered Suede Panel Stitching'];
    logosOrText = ['Lateral Quarter Logo', '3M Reflective Heel Tab'];
    silhouetteShape = 'Low-profile tapered runner with flared heel bevel';
  } else if (query.includes('hoodie')) {
    title = 'Minimalist Boxy Cut 450 GSM Heavy Fleece Hoodie';
    description = 'Double-layered hood with seamless kangaroo pocket, washed charcoal fleece fabric, dropped shoulders, and ribbed hem cuff construction.';
    mainImage = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
    brand = 'Blank Division';
    price = '$89.00';
    productType = 'Heavyweight Boxy Fleece Hoodie';
    primaryColors = ['Washed Charcoal', 'Heather Grey'];
    materials = ['450 GSM French Terry Cotton', 'Brushed Fleece'];
    printsOrGraphics = ['Clean Minimal Solid with Tonal Stitching'];
    logosOrText = ['Micro Embroidered Cuff Tag'];
    silhouetteShape = 'Double-lined hood, seamless kangaroo pouch, relaxed boxy drape';
  } else if (query.includes('backpack') || query.includes('bag')) {
    title = 'Modular Waterproof Rolltop Commuter Backpack 28L';
    description = 'Matte black TPU laminated weatherproof shell with Fidlock magnetic buckle, ergonomic air-mesh back panel, and padded 16-inch laptop compartment.';
    mainImage = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80';
    brand = 'Aero Cargo Co';
    price = '$120.00';
    productType = 'Modular Weatherproof Rolltop Backpack';
    primaryColors = ['Matte Black', 'Gunmetal Hardware'];
    materials = ['840D TPU-Laminated Cordura Nylon', 'YKK Aquaguard'];
    printsOrGraphics = ['Laser-cut Hypalon Attachment Points'];
    logosOrText = ['AERO CARGO 28L', 'WATERPROOF SEAL'];
    silhouetteShape = 'Tapered rolltop cylinder with dual side compression wings';
  }

  const product: ProductResolved = {
    title,
    description,
    mainImage,
    brand,
    price,
    isScraped: queryOrUrl.startsWith('http'),
    sourceUrl: queryOrUrl.startsWith('http') ? queryOrUrl : undefined,
  };

  const attributes: VisualAttributes = {
    productType,
    primaryColors,
    materials,
    printsOrGraphics,
    logosOrText,
    silhouetteShape,
    targetAudience: 'Streetwear, lifestyle, and direct-to-consumer buyers',
    searchKeywords: [`${query} review reel`, `${query} styling haul`, `${query} official video ad`],
    instagramHashtags: ['#oversizedtee', '#streetwearfits', '#graphictee', '#boxyshirt', '#unboxing'],
    metaAdQueries: [`${query} brand campaign`, `${query} limited drop ad`],
  };

  const results: VideoResult[] = [];

  // Generate 22 Instagram Reels
  for (let i = 0; i < 22; i++) {
    const score = Math.max(55, Math.min(98, 96 - (i * 2)));
    const id = `ig_reel_${1000000 + i * 8321}`;
    results.push({
      id,
      platform: 'instagram',
      title: `${title} - Lookbook Reel #${i + 1}`,
      caption: `Unboxing the new ${title}! The ${primaryColors[0]} tone in person is crazy 🔥 Quality on the ${materials[0]} is insane. Rate 1-10 👇 #streetwear #reels #unboxing`,
      thumbnailUrl: SAMPLE_THUMBS[i % SAMPLE_THUMBS.length],
      videoUrl: SAMPLE_STREAMS[i % SAMPLE_STREAMS.length],
      sourceUrl: `https://www.instagram.com/reel/${id}/`,
      author: {
        name: i % 2 === 0 ? 'Streetwear Archive' : 'Marcus Lookbook',
        handle: i % 2 === 0 ? 'streetwearfits' : 'marcus_kicks',
        verified: true,
      },
      metrics: {
        views: 12400 + i * 3200,
        likes: 1200 + i * 310,
        comments: 45 + i * 8,
      },
      matchScore: score,
      matchReason: score >= 85
        ? `Exact visual match: video clearly features the ${productType.toLowerCase()} with identical ${primaryColors[0]} tone.`
        : `High visual similarity: matches silhouette and ${materials[0]} in lifestyle reel.`,
      detectedVisualFeatures: [`Colorway: ${primaryColors[0]}`, `Material: ${materials[0]}`],
      isMatch: score >= 60,
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      contentHash: `hash_ig_${id}`,
    });
  }

  // Generate 24 Meta Ad Library videos
  for (let i = 0; i < 24; i++) {
    const score = Math.max(52, Math.min(97, 94 - (i * 2)));
    const adId = `${3004819280 + i * 9912}`;
    results.push({
      id: `meta_ad_${adId}`,
      platform: 'meta',
      title: `${brand} Sponsored Video Campaign`,
      caption: `Back in stock for a limited time. The ${title} engineered with ${materials[0]}. Enjoy 15% off your first order today. Free shipping over $75.`,
      thumbnailUrl: SAMPLE_THUMBS[(i + 3) % SAMPLE_THUMBS.length],
      videoUrl: SAMPLE_STREAMS[(i + 2) % SAMPLE_STREAMS.length],
      sourceUrl: `https://www.facebook.com/ads/library/?id=${adId}`,
      author: {
        name: brand,
        handle: brand.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        verified: true,
      },
      adMetadata: {
        adId,
        advertiserName: brand,
        runningStatus: 'Active',
        startedRunningDate: 'Active since Oct 2026',
        platformsIncluded: ['Facebook', 'Instagram'],
        callToAction: 'Shop Now',
      },
      matchScore: score,
      matchReason: score >= 85
        ? `Exact visual match: official commercial ad showcasing ${title} with ${printsOrGraphics[0]}.`
        : `Close visual match: features ${productType.toLowerCase()} in motion with matching ${primaryColors[0]}.`,
      detectedVisualFeatures: [`Brand campaign: ${brand}`, `Graphic: ${printsOrGraphics[0]}`],
      isMatch: score >= 60,
      publishedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      contentHash: `hash_meta_${adId}`,
    });
  }

  return {
    id: `search_${Date.now()}`,
    query: queryOrUrl,
    product,
    attributes,
    totalVideos: results.length,
    instagramCount: 22,
    metaCount: 24,
    tiktokCount: 0,
    filteredDuplicatesCount: 6,
    results,
    createdAt: new Date().toISOString(),
  };
}
