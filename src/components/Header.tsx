import React from 'react';
import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  bookmarkCount: number;
  onOpenHistory: () => void;
  onOpenBookmarks: () => void;
  onOpenTestEvidence: () => void;
  onOpenAIInspector?: () => void;
  onResetSeenCache: () => void;
  isResetting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  bookmarkCount,
  onOpenHistory,
  onOpenBookmarks,
  onOpenTestEvidence,
  onResetSeenCache,
  isResetting,
}) => {
  return (
    <header className="h-20 bg-[#ffffff] border-b border-[rgba(26,26,26,0.08)] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
      {/* Editorial Logo */}
      <div className="flex items-baseline gap-3">
        <h1 className="font-serif-cormorant text-2xl sm:text-3xl font-semibold italic text-[#1a1a1a] tracking-tight">
          Vision Discovery
        </h1>
        <span className="label-mono hidden md:inline text-[0.6rem] text-[rgba(26,26,26,0.4)]">
          Visual Intelligence Pipeline
        </span>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-5 sm:gap-7">
        <button
          onClick={onOpenHistory}
          className="label-mono font-semibold text-[0.7rem] text-[#1a1a1a] hover:opacity-70 transition cursor-pointer flex items-center gap-1.5"
        >
          <span>History</span>
          {historyCount > 0 && <span>({historyCount})</span>}
        </button>

        <button
          onClick={onOpenBookmarks}
          className="label-mono font-semibold text-[0.7rem] text-[#1a1a1a] hover:opacity-70 transition cursor-pointer flex items-center gap-1.5"
        >
          <span>Shortlist</span>
          {bookmarkCount > 0 && <span>({bookmarkCount})</span>}
        </button>


        <button
          onClick={onOpenTestEvidence}
          className="label-mono font-semibold text-[0.7rem] text-[#1a1a1a] hover:opacity-70 transition cursor-pointer"
        >
          Evidence
        </button>

        <button
          onClick={onResetSeenCache}
          disabled={isResetting}
          title="Reset registry cache"
          className="p-1.5 text-[#1a1a1a] hover:opacity-50 transition cursor-pointer disabled:opacity-30"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
};
