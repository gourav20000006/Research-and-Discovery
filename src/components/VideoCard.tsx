import React from 'react';
import { VideoResult } from '../types/index.js';
import { Play, ExternalLink, Bookmark, Check } from 'lucide-react';

interface VideoCardProps {
  video: VideoResult;
  isBookmarked: boolean;
  onToggleBookmark: (video: VideoResult) => void;
  onPlayPreview: (video: VideoResult) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isBookmarked,
  onToggleBookmark,
  onPlayPreview,
}) => {
  const platformLabel =
    video.platform === 'instagram'
      ? `Instagram @${video.author.handle}`
      : video.platform === 'meta'
      ? `Meta Ad Library • ${video.adMetadata?.advertiserName || video.author.name}`
      : `TikTok @${video.author.handle}`;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 sm:p-5 bg-white border transition duration-150 items-start ${
      video.isPreviouslySeen
        ? 'border-amber-300 bg-amber-50/20'
        : 'border-[rgba(26,26,26,0.08)] hover:border-[rgba(26,26,26,0.25)]'
    }`}>
      {/* Visual Frame 4/5 Aspect Ratio */}
      <div
        className="relative aspect-[4/5] bg-[#eee] border border-[rgba(26,26,26,0.08)] overflow-hidden cursor-pointer group"
        onClick={() => onPlayPreview(video)}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
          loading="lazy"
        />

        {/* Minimalist Match Score Badge */}
        <div className="absolute top-3 right-3 bg-white px-2 py-1 font-mono-space text-[0.65rem] font-bold text-[#1a1a1a] shadow-sm tracking-tight border border-[rgba(26,26,26,0.05)]">
          {video.matchScore}% Match
        </div>

        {/* Seen badge if previously seen */}
        {video.isPreviouslySeen && (
          <div className="absolute top-3 left-3 bg-[#1a1a1a] text-white px-1.5 py-0.5 font-mono-space text-[0.58rem] uppercase tracking-wider">
            Prior Search
          </div>
        )}

        {/* Minimalist Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition">
          <div className="w-10 h-10 rounded-full bg-white text-[#1a1a1a] flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Item Details */}
      <div className="flex flex-col justify-between h-full space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="label-mono truncate">{platformLabel}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onToggleBookmark(video)}
                className={`p-1 text-[#1a1a1a] hover:opacity-70 transition cursor-pointer ${
                  isBookmarked ? 'opacity-100' : 'opacity-40'
                }`}
                title={isBookmarked ? 'Shortlisted' : 'Add to Shortlist'}
              >
                {isBookmarked ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>
              <a
                href={video.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-[#1a1a1a] opacity-40 hover:opacity-100 transition"
                title="View on platform"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <h4 className="font-serif-cormorant text-lg sm:text-xl font-semibold text-[#1a1a1a] mt-1.5 leading-snug">
            {video.title}
          </h4>

          <p className="text-[0.75rem] text-[rgba(26,26,26,0.6)] leading-relaxed mt-2 line-clamp-2">
            {video.caption}
          </p>

          {/* Editorial Vision Note */}
          <div className="text-[0.8rem] leading-relaxed text-[rgba(26,26,26,0.6)] border-t border-[rgba(26,26,26,0.08)] pt-2.5 mt-2.5 italic font-serif-cormorant">
            "{video.matchReason}"
          </div>
        </div>

        {/* Metrics Footer */}
        <div className="flex items-center gap-4 pt-2 border-t border-[rgba(26,26,26,0.06)]">
          {video.platform === 'meta' ? (
            <>
              <span className="label-mono">Ad ID {video.adMetadata?.adId?.slice(-6) || 'Active'}</span>
              <span className="label-mono text-emerald-700">● Active</span>
            </>
          ) : (
            <>
              <span className="label-mono">
                {video.metrics?.views ? `${(video.metrics.views / 1000).toFixed(1)}K Views` : 'Reel Video'}
              </span>
              <span className="label-mono">
                {video.metrics?.likes ? `${(video.metrics.likes / 1000).toFixed(1)}K Likes` : 'Engaged'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
