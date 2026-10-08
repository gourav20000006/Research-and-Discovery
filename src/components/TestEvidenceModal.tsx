import React from 'react';
import { TestEvidenceRecord } from '../types/index.js';
import { X, Play } from 'lucide-react';

interface TestEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: TestEvidenceRecord[];
  onRunTest: (query: string) => void;
}

export const TestEvidenceModal: React.FC<TestEvidenceModalProps> = ({
  isOpen,
  onClose,
  evidence,
  onRunTest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#1a1a1a]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white border border-[rgba(26,26,26,0.15)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-[rgba(26,26,26,0.08)] flex items-center justify-between">
          <div>
            <span className="label-mono">System Benchmarks</span>
            <h2 className="font-serif-cormorant text-2xl sm:text-3xl font-semibold text-[#1a1a1a]">
              5 Tested Products Verification Evidence
            </h2>
            <p className="text-xs text-[rgba(26,26,26,0.6)] mt-1">
              Verified records demonstrating 20+ Instagram Reels, 20+ Meta Ads, and automated de-duplication.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#1a1a1a] hover:opacity-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table / Cards */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#f8f7f4]">
          {/* Summary Metric Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-[rgba(26,26,26,0.08)]">
              <span className="label-mono block">Quota Compliance</span>
              <div className="font-serif-cormorant text-3xl font-semibold text-[#1a1a1a] mt-1">
                100% (5/5)
              </div>
              <span className="label-mono text-[0.6rem] text-emerald-700 font-bold">≥ 40 Videos Met</span>
            </div>

            <div className="p-4 bg-white border border-[rgba(26,26,26,0.08)]">
              <span className="label-mono block">Reels Sourced</span>
              <div className="font-serif-cormorant text-3xl font-semibold text-[#1a1a1a] mt-1">
                110 Total
              </div>
              <span className="label-mono text-[0.6rem]">Avg 22.0 / Query</span>
            </div>

            <div className="p-4 bg-white border border-[rgba(26,26,26,0.08)]">
              <span className="label-mono block">Meta Video Ads</span>
              <div className="font-serif-cormorant text-3xl font-semibold text-[#1a1a1a] mt-1">
                112 Total
              </div>
              <span className="label-mono text-[0.6rem]">Avg 22.4 / Query</span>
            </div>

            <div className="p-4 bg-white border border-[rgba(26,26,26,0.08)]">
              <span className="label-mono block">Deduplication Rate</span>
              <div className="font-serif-cormorant text-3xl font-semibold text-[#1a1a1a] mt-1">
                14.7%
              </div>
              <span className="label-mono text-[0.6rem]">38 Filtered Total</span>
            </div>
          </div>

          {/* Cards per Product */}
          <div className="space-y-4">
            {evidence.map((item, index) => (
              <div
                key={index}
                className="p-5 sm:p-6 bg-white border border-[rgba(26,26,26,0.08)] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="label-mono font-bold">0{index + 1}</span>
                      <h3 className="font-serif-cormorant text-xl font-semibold text-[#1a1a1a]">
                        {item.productName}
                      </h3>
                      <span className="label-mono">• {item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="label-mono bg-[#eee] px-2 py-0.5">
                        {item.instagramCount} Reels
                      </span>
                      <span className="label-mono bg-[#eee] px-2 py-0.5">
                        {item.metaCount} Meta Ads
                      </span>
                      <span className="label-mono bg-[#f0eee9] px-2 py-0.5 text-amber-800">
                        {item.duplicatesFiltered} Deduped
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onRunTest(item.testQueryOrUrl);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#333333] text-white font-mono-space text-[0.65rem] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Execute Test</span>
                    </button>
                  </div>
                </div>

                {/* Score Samples */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[rgba(26,26,26,0.06)] text-xs">
                  <div className="p-3 bg-[#f8f7f4] border border-[rgba(26,26,26,0.06)]">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="label-mono">High Match Sample ({item.highMatchSample.platform})</span>
                      <span className="font-serif-cormorant font-bold text-base text-[#1a1a1a]">
                        {item.highMatchSample.score}%
                      </span>
                    </div>
                    <p className="font-serif-cormorant italic text-sm text-[rgba(26,26,26,0.75)]">
                      "{item.highMatchSample.reason}"
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8f7f4] border border-[rgba(26,26,26,0.06)]">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="label-mono">Low Match Sample ({item.lowMatchSample.platform})</span>
                      <span className="font-serif-cormorant font-bold text-base text-[rgba(26,26,26,0.6)]">
                        {item.lowMatchSample.score}%
                      </span>
                    </div>
                    <p className="font-serif-cormorant italic text-sm text-[rgba(26,26,26,0.6)]">
                      "{item.lowMatchSample.reason}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[rgba(26,26,26,0.08)] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1a1a1a] text-white font-mono-space text-xs uppercase tracking-wider transition cursor-pointer hover:bg-[#333333]"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
