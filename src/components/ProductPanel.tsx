import React from 'react';
import { ProductResolved, VisualAttributes } from '../types/index.js';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface ProductPanelProps {
  product: ProductResolved;
  attributes: VisualAttributes;
}

export const ProductPanel: React.FC<ProductPanelProps> = ({ product, attributes }) => {
  return (
    <article className="space-y-6">
      {/* Editorial Section Header */}
      <div className="flex justify-between items-baseline border-b-2 border-[#1a1a1a] pb-3">
        <h3 className="font-serif-cormorant text-3xl sm:text-4xl font-semibold text-[#1a1a1a]">
          Context Analysis
        </h3>
        <span className="label-mono">Visual Summary</span>
      </div>

      {/* Product Brief Editorial Box */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 sm:gap-12 bg-white p-6 sm:p-8 border border-[rgba(26,26,26,0.08)] shadow-sm">
        {/* Product Image Frame */}
        <div className="relative aspect-square w-full bg-[#eee] border border-[rgba(26,26,26,0.08)] overflow-hidden">
          <img
            src={product.mainImage}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.sourceUrl && (
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-2 p-1 bg-white/90 text-[#1a1a1a] text-[0.65rem] font-mono-space flex items-center gap-1 hover:bg-white"
              title="Open source"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{new URL(product.sourceUrl).hostname.replace('www.', '')}</span>
            </a>
          )}
        </div>

        {/* Product Text & Attributes */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="label-mono">
                {product.brand ? `${product.brand} • ` : ''}Ref No. {product.price || 'Item Catalog'}
              </span>
              {product.isScraped && (
                <span className="label-mono text-emerald-600 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  SSRF Verified
                </span>
              )}
            </div>

            <h4 className="font-serif-cormorant text-2xl sm:text-3xl font-semibold text-[#1a1a1a] mt-2 leading-tight">
              {product.title}
            </h4>

            <p className="text-[0.85rem] leading-relaxed text-[rgba(26,26,26,0.65)] mt-3">
              {product.description}
            </p>
          </div>

          {/* Visual Attribute Tags */}
          <div className="mt-6 pt-4 border-t border-[rgba(26,26,26,0.08)]">
            <div className="flex flex-wrap gap-2">
              {attributes.primaryColors.map((color, i) => (
                <span
                  key={`color-${i}`}
                  className="label-mono bg-[#eee] px-2.5 py-1 text-[#1a1a1a] rounded-[2px]"
                >
                  {color}
                </span>
              ))}

              {attributes.materials.map((mat, i) => (
                <span
                  key={`mat-${i}`}
                  className="label-mono bg-[#eee] px-2.5 py-1 text-[#1a1a1a] rounded-[2px]"
                >
                  {mat}
                </span>
              ))}

              {attributes.printsOrGraphics.map((print, i) => (
                <span
                  key={`print-${i}`}
                  className="label-mono bg-[#eee] px-2.5 py-1 text-[#1a1a1a] rounded-[2px]"
                >
                  {print}
                </span>
              ))}

              {attributes.silhouetteShape && (
                <span className="label-mono bg-[#f0eee9] px-2.5 py-1 text-[#1a1a1a] rounded-[2px]">
                  {attributes.silhouetteShape.slice(0, 45)}
                </span>
              )}

              {product.aiInternetGrounded && (
                <span className="label-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-[2px] font-semibold">
                  AI Web Grounded
                </span>
              )}
            </div>

            {/* Media / Video Context if inspected from video URL */}
            {product.mediaContext && (
              <div className="mt-4 p-3 bg-[#faf9f6] border border-[rgba(26,26,26,0.08)] text-[0.72rem] space-y-1">
                <div className="flex items-center justify-between text-[#1a1a1a]">
                  <span className="label-mono font-bold text-blue-700">
                    {product.mediaContext.platformDetected} Analysis
                  </span>
                  {product.mediaContext.creatorOrAdvertiser && (
                    <span className="text-[rgba(26,26,26,0.6)] font-mono-space">
                      By: {product.mediaContext.creatorOrAdvertiser}
                    </span>
                  )}
                </div>
                {product.mediaContext.videoHookOrCaption && (
                  <p className="text-[rgba(26,26,26,0.7)] italic">
                    "{product.mediaContext.videoHookOrCaption.slice(0, 140)}"
                  </p>
                )}
                {product.mediaContext.commercialIntent && (
                  <span className="inline-block label-mono text-[0.6rem] bg-white border border-[rgba(26,26,26,0.15)] px-2 py-0.5 mt-1">
                    Intent: {product.mediaContext.commercialIntent}
                  </span>
                )}
              </div>
            )}

            {/* Verified Internet Sources */}
            {product.sources && product.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[rgba(26,26,26,0.06)]">
                <span className="label-mono text-[0.6rem] text-[rgba(26,26,26,0.5)] block mb-1.5">
                  Verified Internet Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sources.slice(0, 4).map((source, idx) => (
                    <a
                      key={`source-${idx}`}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[0.65rem] font-mono-space text-blue-700 hover:text-blue-900 bg-blue-50/60 hover:bg-blue-100/60 px-2 py-0.5 border border-blue-100 transition"
                      title={source.snippet || source.title}
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>{source.title.slice(0, 28)}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
