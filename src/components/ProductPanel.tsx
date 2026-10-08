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
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
