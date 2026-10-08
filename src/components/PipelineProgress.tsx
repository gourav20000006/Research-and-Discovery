import React from 'react';
import { PipelineProgressEvent } from '../types/index.js';
import { Loader2 } from 'lucide-react';

interface PipelineProgressProps {
  currentEvent: PipelineProgressEvent | null;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ currentEvent }) => {
  if (!currentEvent) return null;

  return (
    <div className="bg-white border border-[rgba(26,26,26,0.12)] p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-[#1a1a1a] animate-spin shrink-0" />
          <div>
            <h4 className="font-serif-cormorant text-xl font-semibold text-[#1a1a1a]">
              Pipeline Orchestration Active
            </h4>
            <p className="label-mono text-[0.65rem] text-[rgba(26,26,26,0.6)] mt-0.5">
              {currentEvent.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono-space text-xs font-bold text-[#1a1a1a]">
            {currentEvent.progressPercent}%
          </span>
          <div className="w-28 h-1 bg-[rgba(26,26,26,0.1)] overflow-hidden">
            <div
              className="bg-[#1a1a1a] h-full transition-all duration-300 ease-out"
              style={{ width: `${currentEvent.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
