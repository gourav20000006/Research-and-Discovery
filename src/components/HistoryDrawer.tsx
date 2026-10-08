import React from 'react';
import { SearchRecord } from '../types/index.js';
import { X, ArrowRight, Trash2 } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  searches: SearchRecord[];
  onSelectSearch: (record: SearchRecord) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  searches,
  onSelectSearch,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1a1a1a]/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white border-l border-[rgba(26,26,26,0.1)] h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(26,26,26,0.08)] flex items-center justify-between">
          <div>
            <h3 className="font-serif-cormorant text-2xl font-semibold text-[#1a1a1a]">
              Pipeline History
            </h3>
            <span className="label-mono">Cross-Search Registry</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#1a1a1a] hover:opacity-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of past searches */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {searches.length === 0 ? (
            <div className="text-center py-20 text-[rgba(26,26,26,0.5)]">
              <span className="label-mono block mb-2">No Past Queries Recorded</span>
              <p className="font-serif-cormorant text-lg">
                Run searches to populate the deduplication index.
              </p>
            </div>
          ) : (
            searches.map((rec) => (
              <div
                key={rec.id}
                onClick={() => {
                  onSelectSearch(rec);
                  onClose();
                }}
                className="group p-4 bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] hover:border-[#1a1a1a] transition cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rec.product.mainImage}
                      alt={rec.product.title}
                      className="w-10 h-10 object-cover border border-[rgba(26,26,26,0.1)]"
                    />
                    <div>
                      <h4 className="font-serif-cormorant text-base font-semibold text-[#1a1a1a] leading-tight line-clamp-1">
                        {rec.product.title}
                      </h4>
                      <span className="label-mono text-[0.6rem]">
                        {new Date(rec.createdAt).toLocaleDateString()} • {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#1a1a1a] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-[rgba(26,26,26,0.06)]">
                  <span className="label-mono">{rec.instagramCount} Reels</span>
                  <span className="label-mono">{rec.metaCount} Meta Ads</span>
                  {rec.filteredDuplicatesCount > 0 && (
                    <span className="label-mono text-amber-700">{rec.filteredDuplicatesCount} Deduped</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Clear */}
        {searches.length > 0 && (
          <div className="p-6 border-t border-[rgba(26,26,26,0.08)] bg-[#f8f7f4]">
            <button
              onClick={onClearHistory}
              className="w-full py-3 border border-[#1a1a1a] font-mono-space text-xs uppercase tracking-wider text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History & Reset Registry</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
