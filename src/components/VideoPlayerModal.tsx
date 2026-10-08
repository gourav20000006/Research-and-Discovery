import React from 'react';
import { VideoResult } from '../types/index.js';
import { X, ExternalLink, Bookmark, Check } from 'lucide-react';

interface VideoPlayerModalProps {
  video: VideoResult | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (video: VideoResult) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#1a1a1a]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-[rgba(26,26,26,0.15)] shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white text-[#1a1a1a] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player Section */}
        <div className="md:w-1/2 bg-black flex items-center justify-center relative min-h-[360px] md:min-h-full">
          <video
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full max-h-[75vh] object-contain"
          />
        </div>

        {/* Editorial Breakdown Section */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between gap-6 bg-[#f8f7f4]">
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="label-mono">
                  {video.platform === 'instagram' ? 'Instagram Reel' : video.platform === 'meta' ? 'Meta Ad Library' : 'TikTok'}
                </span>
                <span className="label-mono">• {video.id}</span>
              </div>
              <h3 className="font-serif-cormorant text-2xl font-semibold text-[#1a1a1a]">
                {video.title}
              </h3>
            </div>

            {/* Author Profile */}
            <div className="flex items-center gap-3 p-3 bg-white border border-[rgba(26,26,26,0.08)]">
              {video.author.avatarUrl ? (
                <img
                  src={video.author.avatarUrl}
                  alt={video.author.name}
                  className="w-9 h-9 rounded-full bg-[#eee]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-mono-space text-xs">
                  {video.author.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-medium text-xs text-[#1a1a1a]">{video.author.name}</div>
                <div className="label-mono text-[0.62rem]">@{video.author.handle}</div>
              </div>
            </div>

            {/* Match Score & Analysis */}
            <div className="p-4 bg-white border border-[rgba(26,26,26,0.08)]">
              <div className="flex items-baseline justify-between mb-2">
                <span className="label-mono">Vision Match Analysis</span>
                <span className="font-serif-cormorant text-2xl font-bold text-[#1a1a1a]">
                  {video.matchScore}%
                </span>
              </div>
              <p className="font-serif-cormorant italic text-sm text-[rgba(26,26,26,0.7)] leading-relaxed">
                "{video.matchReason}"
              </p>
            </div>

            {/* Caption */}
            <div>
              <span className="label-mono block mb-1">
                {video.platform === 'meta' ? 'Ad Campaign Copy' : 'Creator Caption'}
              </span>
              <p className="text-xs text-[rgba(26,26,26,0.7)] bg-white p-3 border border-[rgba(26,26,26,0.08)] leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                {video.caption}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[rgba(26,26,26,0.1)] flex items-center justify-between gap-3">
            <button
              onClick={() => onToggleBookmark(video)}
              className={`flex-1 py-3 px-4 font-mono-space text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition ${
                isBookmarked
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-[#1a1a1a] border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              {isBookmarked ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isBookmarked ? 'Shortlisted' : 'Save to Shortlist'}</span>
            </button>

            <a
              href={video.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-[#1a1a1a] hover:bg-[#333333] text-white font-mono-space text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <span>Platform Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
