import React from 'react';
import { VideoResult } from '../types/index.js';
import { X, Play, Trash2, ExternalLink } from 'lucide-react';

interface ShortlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: VideoResult[];
  onRemoveBookmark: (video: VideoResult) => void;
  onPlayPreview: (video: VideoResult) => void;
}

export const ShortlistModal: React.FC<ShortlistModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onPlayPreview,
}) => {
  if (!isOpen) return null;

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shortlisted-videos-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCSV = () => {
    const headers = ['ID', 'Platform', 'Title', 'Match Score', 'Match Reason', 'Author', 'Video URL', 'Source URL'];
    const rows = bookmarks.map((b) => [
      b.id,
      b.platform,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      b.matchScore,
      `"${(b.matchReason || '').replace(/"/g, '""')}"`,
      `"${b.author.name}"`,
      b.videoUrl,
      b.sourceUrl,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `shortlisted-videos-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#1a1a1a]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-[rgba(26,26,26,0.15)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-[rgba(26,26,26,0.08)] flex items-center justify-between">
          <div>
            <span className="label-mono">Curated Collection</span>
            <h2 className="font-serif-cormorant text-2xl sm:text-3xl font-semibold text-[#1a1a1a]">
              Shortlisted Videos ({bookmarks.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#1a1a1a] hover:opacity-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-3 bg-[#f8f7f4]">
          {bookmarks.length === 0 ? (
            <div className="text-center py-24 text-[rgba(26,26,26,0.5)]">
              <span className="label-mono block mb-2">No Videos Shortlisted</span>
              <p className="font-serif-cormorant text-lg">
                Click bookmark icon on any video card to curate items.
              </p>
            </div>
          ) : (
            bookmarks.map((video) => (
              <div
                key={video.id}
                className="p-4 bg-white border border-[rgba(26,26,26,0.08)] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="relative w-14 h-16 bg-[#eee] overflow-hidden shrink-0 cursor-pointer group"
                    onClick={() => onPlayPreview(video)}
                  >
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="label-mono">{video.platform}</span>
                      <span className="label-mono font-bold">{video.matchScore}% Match</span>
                    </div>
                    <h4 className="font-serif-cormorant text-base font-semibold text-[#1a1a1a] truncate mt-1">
                      {video.title}
                    </h4>
                    <p className="font-serif-cormorant italic text-xs text-[rgba(26,26,26,0.65)] truncate max-w-md">
                      "{video.matchReason}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={video.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[#1a1a1a] opacity-50 hover:opacity-100 transition"
                    title="Open on Platform"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onRemoveBookmark(video)}
                    className="p-2 text-[#1a1a1a] opacity-40 hover:opacity-100 transition cursor-pointer"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Export Footer */}
        {bookmarks.length > 0 && (
          <div className="p-6 border-t border-[rgba(26,26,26,0.08)] bg-white flex items-center justify-between">
            <span className="label-mono">{bookmarks.length} videos curated</span>
            <div className="flex items-center gap-3">
              <button
                onClick={exportAsJSON}
                className="px-4 py-2 border border-[#1a1a1a] font-mono-space text-xs uppercase tracking-wider text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition cursor-pointer"
              >
                Export JSON
              </button>
              <button
                onClick={exportAsCSV}
                className="px-4 py-2 bg-[#1a1a1a] text-white font-mono-space text-xs uppercase tracking-wider hover:bg-[#333333] transition cursor-pointer"
              >
                Export CSV Spreadsheet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
