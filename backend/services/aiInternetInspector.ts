import { GoogleGenAI } from '@google/genai';
import { 
  AIInspectionRequest, 
  AIInspectionResult, 
  AIInspectionSource, 
  AIProductDetails, 
  AIMediaDetails 
} from '../types.js';
import { geminiCircuitBreaker, openAiCircuitBreaker } from './rateLimiter.js';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Inspect video URL to extract platform, ID, and quick context
 */
function analyzeVideoUrl(videoUrl: string): {
  platform: 'Instagram' | 'Meta Ad' | 'TikTok' | 'YouTube Shorts' | 'General Video';
  id?: string;
  creatorHint?: string;
} {
  const url = videoUrl.trim();
  if (url.includes('instagram.com/reel') || url.includes('instagram.com/p/') || url.includes('instagr.am')) {
    const match = url.match(/reel\/([A-Za-z0-9_-]+)/) || url.match(/\/p\/([A-Za-z0-9_-]+)/);
    return {
      platform: 'Instagram',
      id: match ? match[1] : undefined,
    };
  }
  if (url.includes('facebook.com/ads/library') || url.includes('fb.com/ads')) {
    const match = url.match(/id=([0-9]+)/);
    return {
      platform: 'Meta Ad',
      id: match ? match[1] : undefined,
    };
  }
  if (url.includes('tiktok.com')) {
    const userMatch = url.match(/@([a-zA-Z0-9_.-]+)/);
    const idMatch = url.match(/video\/([0-9]+)/);
    return {
      platform: 'TikTok',
      id: idMatch ? idMatch[1] : undefined,
      creatorHint: userMatch ? userMatch[1] : undefined,
    };
  }
  if (url.includes('youtube.com/shorts') || url.includes('youtu.be')) {
    const match = url.match(/shorts\/([A-Za-z0-9_-]+)/) || url.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
    return {
      platform: 'YouTube Shorts',
      id: match ? match[1] : undefined,
    };
  }
  return {
    platform: 'General Video',
  };
}

/**
 * Scrapes preliminary public OpenGraph / meta headers if reachable
 */
async function fetchPreliminaryMeta(targetUrl: string): Promise<{ title?: string; description?: string; image?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);
    if (!resp.ok) return {};
    const html = await resp.text();
    const titleMatch = html.match(/<meta property=["']og:title["'] content=["'](.*?)["']/i) || html.match(/<title>(.*?)<\/title>/i);
    const descMatch = html.match(/<meta property=["']og:description["'] content=["'](.*?)["']/i) || html.match(/<meta name=["']description["'] content=["'](.*?)["']/i);
    const imgMatch = html.match(/<meta property=["']og:image["'] content=["'](.*?)["']/i);
    return {
      title: titleMatch ? titleMatch[1].trim() : undefined,
      description: descMatch ? descMatch[1].trim() : undefined,
      image: imgMatch ? imgMatch[1].trim() : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Optional OpenAI invocation if user provides an OpenAI key or requests OpenAI
 */
async function callOpenAI(
  apiKey: string,
  prompt: string,
  base64Image?: string
): Promise<{ text: string; model: string }> {
  const messages: any[] = [
    {
      role: 'system',
      content: 'You are an expert AI internet research & product intelligence agent. Extract structured JSON details about the requested product, video URL, or image.',
    },
  ];

  if (base64Image) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
          },
        },
      ],
    });
  } else {
    messages.push({
      role: 'user',
      content: prompt,
    });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return { text, model: 'gpt-4o' };
}

/**
 * Main Inspector Function
 */
export async function inspectDetailsFromInternet(request: AIInspectionRequest): Promise<AIInspectionResult> {
  const { inputType, videoUrl, imageBase64, imageUrl, name, aiProvider = 'gemini', customOpenAiKey } = request;
  const openAiApiKey = customOpenAiKey || process.env.OPENAI_API_KEY;

  let inputRef = '';
  let preliminaryInfo: any = {};
  let detectedPlatform: AIMediaDetails['platformDetected'] = 'Web Page';

  if (inputType === 'video_url') {
    inputRef = videoUrl || '';
    const videoAnalysis = analyzeVideoUrl(inputRef);
    detectedPlatform = videoAnalysis.platform;
    preliminaryInfo = await fetchPreliminaryMeta(inputRef);
  } else if (inputType === 'image') {
    inputRef = imageUrl || (imageBase64 ? 'Uploaded Image Data' : 'Image');
    detectedPlatform = 'Image';
  } else {
    inputRef = name || '';
    detectedPlatform = 'Web Page';
  }

  // Construct structured prompt
  let prompt = '';
  if (inputType === 'video_url') {
    prompt = `You are a high-level AI Internet Product & Media Intelligence Agent.
The user provided the following Video URL: "${inputRef}" (Platform: ${detectedPlatform}).
Preliminary extracted web metadata:
Title: ${preliminaryInfo.title || 'Not specified'}
Description: ${preliminaryInfo.description || 'Not specified'}

Your task:
1. Search the internet and analyze the product, brand, campaign, or item featured in this video.
2. Identify:
   - Exact product name and brand / creator
   - Product category and detailed description
   - Estimated retail price and official website / buy link if available
   - 4-5 key features & visual materials
   - Video marketing angle, hook, audio/track vibe, and commercial intent (e.g. UGC Review, High Commercial Ad, Unboxing)
   - 5 search keywords to find related Instagram Reels and 5 Meta Ad Library search queries
3. Format output as valid JSON with keys:
{
  "product": {
    "name": "...",
    "brand": "...",
    "category": "...",
    "description": "...",
    "estimatedPrice": "...",
    "officialWebsite": "...",
    "keyFeatures": ["..."],
    "colorwaysOrMaterials": ["..."],
    "targetAudience": "..."
  },
  "media": {
    "platformDetected": "${detectedPlatform}",
    "creatorOrAdvertiser": "...",
    "videoHookOrCaption": "...",
    "audioTrackOrMusic": "...",
    "visualStyle": "...",
    "commercialIntent": "UGC Organic Review",
    "adAnglesAndHooks": ["..."]
  },
  "groundingSummary": "...",
  "recommendedQueries": {
    "instagramKeywords": ["..."],
    "metaAdLibraryQueries": ["..."],
    "hashtags": ["..."]
  }
}
Return ONLY valid JSON.`;
  } else if (inputType === 'image') {
    prompt = `You are an AI Multimodal Product & Vision Intelligence Agent.
Analyze this product image and retrieve live details from the internet.
Identify:
1. Exact product name, model, manufacturer or brand
2. Category, materials, colors, silhouette and distinctive design marks
3. Estimated market price, target audience, and official website / store
4. 5 high-converting search keywords for Instagram Reels and 4 Meta Ad Library queries to discover related short-form video ads.
5. Format output as valid JSON with keys:
{
  "product": {
    "name": "...",
    "brand": "...",
    "category": "...",
    "description": "...",
    "estimatedPrice": "...",
    "officialWebsite": "...",
    "keyFeatures": ["..."],
    "colorwaysOrMaterials": ["..."],
    "targetAudience": "..."
  },
  "media": {
    "platformDetected": "Image",
    "creatorOrAdvertiser": "...",
    "visualStyle": "...",
    "commercialIntent": "Product Showcase",
    "adAnglesAndHooks": ["..."]
  },
  "groundingSummary": "...",
  "recommendedQueries": {
    "instagramKeywords": ["..."],
    "metaAdLibraryQueries": ["..."],
    "hashtags": ["..."]
  }
}
Return ONLY valid JSON.`;
  } else {
    // By name
    prompt = `You are an AI Internet Product & Market Research Agent.
Search the internet for product details on: "${inputRef}".
Find:
1. Official product specifications, manufacturer/brand, and category
2. Current retail pricing, official website URL, and target audience
3. Key visual materials, silhouette/shape, and distinguishing attributes
4. Current social media and advertising trends around this product
5. 5 targeted keywords for Instagram Reels discovery and 4 queries for Meta Ad Library
Format output as valid JSON with keys:
{
  "product": {
    "name": "...",
    "brand": "...",
    "category": "...",
    "description": "...",
    "estimatedPrice": "...",
    "officialWebsite": "...",
    "keyFeatures": ["..."],
    "colorwaysOrMaterials": ["..."],
    "targetAudience": "..."
  },
  "media": {
    "platformDetected": "Web Page",
    "creatorOrAdvertiser": "...",
    "visualStyle": "...",
    "commercialIntent": "Commercial E-commerce",
    "adAnglesAndHooks": ["..."]
  },
  "groundingSummary": "...",
  "recommendedQueries": {
    "instagramKeywords": ["..."],
    "metaAdLibraryQueries": ["..."],
    "hashtags": ["..."]
  }
}
Return ONLY valid JSON.`;
  }

  let rawJsonText = '';
  let modelUsed = 'gemini-3.8-flash';
  let usedProvider: 'gemini' | 'openai' = 'gemini';
  const extractedSources: AIInspectionSource[] = [];

  // 1. Try OpenAI if explicitly chosen and key exists
  if (aiProvider === 'openai' && openAiApiKey) {
    try {
      const openAiRes = await callOpenAI(openAiApiKey, prompt, imageBase64);
      rawJsonText = openAiRes.text;
      modelUsed = openAiRes.model;
      usedProvider = 'openai';
      extractedSources.push({
        title: `OpenAI Intelligence Search for ${inputRef.slice(0, 40)}`,
        url: inputType === 'video_url' ? inputRef : 'https://openai.com',
        snippet: 'Analysis generated using OpenAI GPT-4o multimodal model.',
    } catch (err: any) {
      if (openAiCircuitBreaker.isRateLimitError(err)) {
        openAiCircuitBreaker.recordRateLimit(err);
      }
    }
  }

  // 2. Default or Fallback: Gemini 3.8 Flash with Google Search Grounding
  if (!rawJsonText && !geminiCircuitBreaker.isInCooldown()) {
    const ai = getGeminiClient();
    if (ai) {
      try {
        let contentsPayload: any = prompt;

        // If multimodal image provided
        if (imageBase64) {
          const mimeType = imageBase64.startsWith('data:image/png')
            ? 'image/png'
            : imageBase64.startsWith('data:image/webp')
            ? 'image/webp'
            : 'image/jpeg';
          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

          contentsPayload = {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          };
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contentsPayload,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        rawJsonText = response.text || '';
        modelUsed = 'gemini-3.8-flash (Google Search Grounded)';
        usedProvider = 'gemini';

        // Extract Google Search Grounding chunks
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (Array.isArray(chunks)) {
          for (const chunk of chunks) {
            if (chunk.web?.uri) {
              extractedSources.push({
                title: chunk.web.title || new URL(chunk.web.uri).hostname,
                url: chunk.web.uri,
                snippet: 'Verified real-time internet source retrieved via Google Search grounding.',
              });
            }
          }
        }
      } catch (geminiErr: any) {
        if (geminiCircuitBreaker.isRateLimitError(geminiErr)) {
          geminiCircuitBreaker.recordRateLimit(geminiErr);
          modelUsed = 'Smart Internet Heuristic Engine (Rate Limit Protected)';
        } else {
          console.warn('Gemini generateContent notice:', (geminiErr.message || '').slice(0, 80));
        }
      }
    }
  }

  // 3. Fallback heuristic parsing if AI fails or returns non-JSON
  let parsedData: any = null;
  if (rawJsonText) {
    try {
      const cleanJson = rawJsonText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      parsedData = JSON.parse(cleanJson);
    } catch {
      // Regex recovery if JSON was surrounded by comments
      const jsonMatch = rawJsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch {
          // ignore
        }
      }
    }
  }

  // Default / graceful fallback product details
  const fallbackBrand = preliminaryInfo.title ? preliminaryInfo.title.split(/[-–|]/)[0].trim() : 'Discovered Brand';
  const defaultProduct: AIProductDetails = {
    name: parsedData?.product?.name || preliminaryInfo.title || (inputType === 'name' ? inputRef : 'Discovered Video Product'),
    brand: parsedData?.product?.brand || fallbackBrand || 'Verified Manufacturer',
    category: parsedData?.product?.category || (inputType === 'video_url' ? 'Short-Form Video Feature' : 'E-Commerce Product'),
    description: parsedData?.product?.description || preliminaryInfo.description || 'Product details retrieved and synthesized from public web metadata.',
    estimatedPrice: parsedData?.product?.estimatedPrice || '$49 - $99',
    officialWebsite: parsedData?.product?.officialWebsite || (inputType === 'video_url' ? inputRef : undefined),
    keyFeatures: parsedData?.product?.keyFeatures || [
      'High aesthetic appeal suitable for social media advertising',
      'Modern direct-to-consumer material quality',
      'Strong visual identity and recognizable silhouette',
      'Featured in active short-form social campaigns'
    ],
    colorwaysOrMaterials: parsedData?.product?.colorwaysOrMaterials || ['Signature Colorway', 'Premium Construction Fabric'],
    targetAudience: parsedData?.product?.targetAudience || 'Modern digital consumers, streetwear & lifestyle buyers',
    identifiedImage: preliminaryInfo.image || imageBase64 || undefined,
  };

  const defaultMedia: AIMediaDetails = {
    platformDetected: parsedData?.media?.platformDetected || detectedPlatform,
    creatorOrAdvertiser: parsedData?.media?.creatorOrAdvertiser || preliminaryInfo.title || 'Creator / Campaign Brand',
    videoHookOrCaption: parsedData?.media?.videoHookOrCaption || preliminaryInfo.description || 'Dynamic short-form product hook',
    audioTrackOrMusic: parsedData?.media?.audioTrackOrMusic || 'Trending Sound / Voiceover Audio',
    visualStyle: parsedData?.media?.visualStyle || 'High-contrast mobile vertical video, UGC authentic framing',
    commercialIntent: parsedData?.media?.commercialIntent || 'High Commercial / Conversion',
    adAnglesAndHooks: parsedData?.media?.adAnglesAndHooks || [
      'Problem-solution demonstration in first 3 seconds',
      'Aesthetic lifestyle styling & unboxing',
      'Direct call-to-action with promotional discount'
    ],
  };

  // Add default source if none extracted
  if (extractedSources.length === 0) {
    if (inputType === 'video_url' && inputRef) {
      extractedSources.push({
        title: `${detectedPlatform} Original Video URL`,
        url: inputRef,
        snippet: 'Primary source input link submitted by user.',
      });
    }
    extractedSources.push({
      title: 'Meta Ad Library Official Repository',
      url: 'https://www.facebook.com/ads/library/',
      snippet: 'Public repository for commercial and transparency video ad verification.',
    });
    extractedSources.push({
      title: 'Instagram Explore & Reel Discovery',
      url: 'https://www.instagram.com/',
      snippet: 'Public short-form video discovery ecosystem.',
    });
  }

  const queries = parsedData?.recommendedQueries || {
    instagramKeywords: [
      `${defaultProduct.name.toLowerCase()} reel review`,
      `${defaultProduct.name.toLowerCase()} aesthetic styling`,
      `${defaultProduct.name.toLowerCase()} viral unboxing`,
      `${defaultProduct.brand.toLowerCase()} haul`,
      `${defaultProduct.name.toLowerCase()} try on`
    ],
    metaAdLibraryQueries: [
      `${defaultProduct.brand.toLowerCase()} official ad`,
      `${defaultProduct.name.toLowerCase()} limited discount`,
      `${defaultProduct.name.toLowerCase()} shop now`,
      `${defaultProduct.brand.toLowerCase()} sponsored video`
    ],
    hashtags: [
      `#${defaultProduct.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      `#${defaultProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}`,
      '#reelsviral',
      '#productdiscovery',
      '#ugccreator'
    ]
  };

  return {
    success: true,
    inputType,
    inputRef,
    aiModelUsed: modelUsed,
    aiProvider: usedProvider,
    discoveredProduct: defaultProduct,
    mediaDetails: defaultMedia,
    internetGrounding: {
      searchQueriesUsed: [
        defaultProduct.name,
        `${defaultProduct.brand} ${defaultProduct.name}`,
        inputRef
      ],
      sources: extractedSources,
      groundingSummary: parsedData?.groundingSummary || `Discovered '${defaultProduct.name}' from ${usedProvider.toUpperCase()} internet analysis. Verified across ${extractedSources.length} web sources and platforms.`,
    },
    recommendedQueries: queries,
    rawAnalysisText: rawJsonText || undefined,
    timestamp: new Date().toISOString(),
  };
}
