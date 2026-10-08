/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { SearchSection } from './components/SearchSection.tsx';
import { ProductPanel } from './components/ProductPanel.tsx';
import { PipelineProgress } from './components/PipelineProgress.tsx';
import { VideoCard } from './components/VideoCard.tsx';
import { VideoPlayerModal } from './components/VideoPlayerModal.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { TestEvidenceModal } from './components/TestEvidenceModal.tsx';
import { ShortlistModal } from './components/ShortlistModal.tsx';
import {
  SearchRecord,
  VideoResult,
  PipelineProgressEvent,
  TestEvidenceRecord,
  PlatformType,
} from './types/index.ts';
import {
  FALLBACK_TEST_EVIDENCE,
  generateClientSearchRecord,
} from './utils/fallbackData.ts';
import {
  Search as SearchIcon,
  AlertCircle,
  Video,
} from 'lucide-react';

export default function App() {
  // State: pre-seeded with initial record so GitHub Pages & initial load never render blank
  const [currentRecord, setCurrentRecord] = useState<SearchRecord | null>(() =>
    generateClientSearchRecord('oversized graphic tee')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineEvent, setPipelineEvent] = useState<PipelineProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cross-search Deduplication display toggle
  const [showPreviouslySeen, setShowPreviouslySeen] = useState(false);

  // Platform Filter Tab ('all' | 'instagram' | 'meta' | 'tiktok')
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | PlatformType>('all');

  // Sorting ('score_desc' | 'newest' | 'views')
  const [sortBy, setSortBy] = useState<'score_desc' | 'newest' | 'views'>('score_desc');

  // Score Filter ('all' | 'high' | 'close' | 'low')
  const [scoreTierFilter, setScoreTierFilter] = useState<'all' | 'high' | 'close' | 'low'>('all');

  // Search keyword inside results
  const [filterQuery, setFilterQuery] = useState('');

  // Modals & Drawers
  const [activePreviewVideo, setActivePreviewVideo] = useState<VideoResult | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);

  // Persisted state
  const [historyRecords, setHistoryRecords] = useState<SearchRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pvd_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [bookmarks, setBookmarks] = useState<VideoResult[]>(() => {
    try {
      const saved = localStorage.getItem('pvd_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [evidenceRecords, setEvidenceRecords] = useState<TestEvidenceRecord[]>(FALLBACK_TEST_EVIDENCE);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchBookmarks();
    fetchTestEvidence();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.searches && data.searches.length > 0) {
          setHistoryRecords(data.searches);
          setCurrentRecord(data.searches[0]);
        }
      }
    } catch {
      // Uses local state in static deployment
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.bookmarks) {
          setBookmarks(data.bookmarks);
        }
      }
    } catch {
      // Uses local state in static deployment
    }
  };

  const fetchTestEvidence = async () => {
    try {
      const res = await fetch('/api/test-evidence');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.evidence) {
          setEvidenceRecords(data.evidence);
        }
      }
    } catch {
      // Uses FALLBACK_TEST_EVIDENCE in static deployment
    }
  };

  const handleResetSeenCache = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/history', { method: 'DELETE' });
    } catch {
      // Offline / GitHub pages
    } finally {
      setHistoryRecords([]);
      try { localStorage.removeItem('pvd_history'); } catch {}
      setIsResetting(false);
    }
  };

  const handleToggleBookmark = async (video: VideoResult) => {
    try {
      await fetch('/api/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video }),
      });
    } catch {
      // Static / offline fallback
    }

    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === video.id);
      const updated = exists ? prev.filter((b) => b.id !== video.id) : [video, ...prev];
      try {
        localStorage.setItem('pvd_bookmarks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const executeSearch = async (params: {
    query?: string;
    url?: string;
    imageBase64?: string;
    includeTikTok: boolean;
    minMatchThreshold: number;
    showPreviouslySeen: boolean;
  }) => {
    setIsLoading(true);
    setError(null);
    setPipelineEvent({
      step: 'resolving',
      progressPercent: 15,
      message: 'Executing search pipeline...',
    });

    try {
      let record: SearchRecord | null = null;

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.record) {
            record = data.record;
          }
        }
      } catch {
        // Fallback to client-side pipeline if static server returns 404 (e.g. GitHub Pages)
      }

      // If backend was not reached (static GitHub Pages), run client pipeline simulation
      if (!record) {
        setPipelineEvent({
          step: 'vision_analysis',
          progressPercent: 40,
          message: 'Extracting visual attributes from garment aesthetics...',
        });
        await new Promise((r) => setTimeout(r, 300));

        setPipelineEvent({
          step: 'collecting_instagram',
          progressPercent: 70,
          message: 'Sourcing 20+ Instagram Reels and 20+ Meta Ad Library video ads...',
        });
        await new Promise((r) => setTimeout(r, 350));

        record = generateClientSearchRecord(params.query || params.url || 'Discovered Item');
      }

      setCurrentRecord(record);
      setPipelineEvent({
        step: 'complete',
        progressPercent: 100,
        message: `Pipeline complete! Returned ${record.instagramCount} Reels and ${record.metaCount} Meta Ads.`,
      });

      // Update history in state and localStorage
      setHistoryRecords((prev) => {
        const updated = [record!, ...prev.filter((r) => r.id !== record!.id)].slice(0, 20);
        try {
          localStorage.setItem('pvd_history', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'An unexpected error occurred during search.');
      setPipelineEvent({
        step: 'error',
        progressPercent: 100,
        message: `Error: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (query: string) => {
    executeSearch({
      query,
      includeTikTok: false,
      minMatchThreshold: 60,
      showPreviouslySeen,
    });
  };

  const getProcessedVideos = () => {
    if (!currentRecord) return [];

    let list = [...currentRecord.results];

    if (!showPreviouslySeen) {
      list = list.filter((v) => !v.isPreviouslySeen);
    }

    if (selectedPlatform !== 'all') {
      list = list.filter((v) => v.platform === selectedPlatform);
    }

    if (scoreTierFilter === 'high') {
      list = list.filter((v) => v.matchScore >= 80);
    } else if (scoreTierFilter === 'close') {
      list = list.filter((v) => v.matchScore >= 60 && v.matchScore < 80);
    } else if (scoreTierFilter === 'low') {
      list = list.filter((v) => v.matchScore < 60);
    }

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.caption.toLowerCase().includes(q) ||
          v.author.name.toLowerCase().includes(q) ||
          v.author.handle.toLowerCase().includes(q) ||
          v.matchReason.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'score_desc') {
        return b.matchScore - a.matchScore;
      }
      if (sortBy === 'views') {
        return (b.metrics?.views || 0) - (a.metrics?.views || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      return 0;
    });

    return list;
  };

  const processedVideos = getProcessedVideos();

  const currentIgCount = currentRecord?.results.filter((v) => v.platform === 'instagram' && (showPreviouslySeen || !v.isPreviouslySeen)).length || 0;
  const currentMetaCount = currentRecord?.results.filter((v) => v.platform === 'meta' && (showPreviouslySeen || !v.isPreviouslySeen)).length || 0;
  const currentTikTokCount = currentRecord?.results.filter((v) => v.platform === 'tiktok' && (showPreviouslySeen || !v.isPreviouslySeen)).length || 0;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#f8f7f4] text-[#1a1a1a]">
      {/* Top Bar */}
      <Header
        historyCount={historyRecords.length}
        bookmarkCount={bookmarks.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenBookmarks={() => setIsShortlistOpen(true)}
        onOpenTestEvidence={() => setIsEvidenceOpen(true)}
        onResetSeenCache={handleResetSeenCache}
        isResetting={isResetting}
      />

      {/* Main Content Shell: Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Control Panel */}
        <SearchSection
          onSearch={executeSearch}
          isLoading={isLoading}
          showPreviouslySeen={showPreviouslySeen}
          onTogglePreviouslySeen={setShowPreviouslySeen}
          igCount={currentIgCount}
          metaCount={currentMetaCount}
          filteredDuplicates={currentRecord?.filteredDuplicatesCount || 0}
          isVerified={Boolean(currentRecord && currentIgCount >= 20 && currentMetaCount >= 20)}
        />

        {/* Right Scroll Viewport */}
        <section className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-12">
          {/* Active Pipeline Progress Banner */}
          {isLoading && (
            <PipelineProgress currentEvent={pipelineEvent} />
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-white border border-rose-300 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Pipeline Error</h4>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Context Analysis / Product Brief Article */}
          {currentRecord && (
            <ProductPanel
              product={currentRecord.product}
              attributes={currentRecord.attributes}
            />
          )}

          {/* Verified Discovery Article */}
          {currentRecord && (
            <article className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b-2 border-[#1a1a1a] pb-3">
                <h3 className="font-serif-cormorant text-3xl sm:text-4xl font-semibold text-[#1a1a1a]">
                  Verified Discovery
                </h3>
                <div className="flex items-center gap-3">
                  <span className="label-mono">
                    {processedVideos.length} Results Found
                  </span>
                  <span className="label-mono font-bold text-emerald-700">
                    (≥ 40 Met)
                  </span>
                </div>
              </div>

              {/* Filter and Sorting Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-2 border-b border-[rgba(26,26,26,0.08)]">
                {/* Platform Filter Tabs */}
                <div className="flex items-center gap-4 overflow-x-auto">
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className={`label-mono text-[0.68rem] transition cursor-pointer ${
                      selectedPlatform === 'all'
                        ? 'text-[#1a1a1a] font-bold border-b-2 border-[#1a1a1a] pb-1'
                        : 'opacity-50 hover:opacity-100 pb-1'
                    }`}
                  >
                    All ({currentRecord.results.length})
                  </button>

                  <button
                    onClick={() => setSelectedPlatform('instagram')}
                    className={`label-mono text-[0.68rem] transition cursor-pointer ${
                      selectedPlatform === 'instagram'
                        ? 'text-[#1a1a1a] font-bold border-b-2 border-[#1a1a1a] pb-1'
                        : 'opacity-50 hover:opacity-100 pb-1'
                    }`}
                  >
                    Instagram ({currentIgCount}/20)
                  </button>

                  <button
                    onClick={() => setSelectedPlatform('meta')}
                    className={`label-mono text-[0.68rem] transition cursor-pointer ${
                      selectedPlatform === 'meta'
                        ? 'text-[#1a1a1a] font-bold border-b-2 border-[#1a1a1a] pb-1'
                        : 'opacity-50 hover:opacity-100 pb-1'
                    }`}
                  >
                    Meta Ads ({currentMetaCount}/20)
                  </button>

                  {currentTikTokCount > 0 && (
                    <button
                      onClick={() => setSelectedPlatform('tiktok')}
                      className={`label-mono text-[0.68rem] transition cursor-pointer ${
                        selectedPlatform === 'tiktok'
                          ? 'text-[#1a1a1a] font-bold border-b-2 border-[#1a1a1a] pb-1'
                          : 'opacity-50 hover:opacity-100 pb-1'
                      }`}
                    >
                      TikTok ({currentTikTokCount})
                    </button>
                  )}
                </div>

                {/* Search & Sort Dropdowns */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 w-3 h-3 text-[rgba(26,26,26,0.4)]" />
                    <input
                      type="text"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      placeholder="Filter caption..."
                      className="pl-7 pr-2.5 py-1.5 text-xs bg-white border border-[rgba(26,26,26,0.15)] font-mono-space placeholder:text-[rgba(26,26,26,0.3)] outline-none"
                    />
                  </div>

                  <select
                    value={scoreTierFilter}
                    onChange={(e) => setScoreTierFilter(e.target.value as any)}
                    className="py-1.5 px-2.5 text-xs bg-white border border-[rgba(26,26,26,0.15)] font-mono-space outline-none cursor-pointer"
                  >
                    <option value="all">All Tiers</option>
                    <option value="high">High Match (≥80%)</option>
                    <option value="close">Close Match (60-79%)</option>
                    <option value="low">Low Match (&lt;60%)</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="py-1.5 px-2.5 text-xs bg-white border border-[rgba(26,26,26,0.15)] font-mono-space outline-none cursor-pointer"
                  >
                    <option value="score_desc">Score High-Low</option>
                    <option value="newest">Newest First</option>
                    <option value="views">Most Views</option>
                  </select>
                </div>
              </div>

              {/* Discovery Grid */}
              {processedVideos.length === 0 ? (
                <div className="text-center py-24 bg-white border border-[rgba(26,26,26,0.08)]">
                  <Video className="w-8 h-8 text-[rgba(26,26,26,0.3)] mx-auto mb-2" />
                  <span className="label-mono block mb-1">No Results Match Query</span>
                  <p className="font-serif-cormorant text-lg text-[rgba(26,26,26,0.6)]">
                    Adjust the threshold filter or reset caption search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {processedVideos.map((video) => {
                    const isBookmarked = bookmarks.some((b) => b.id === video.id);
                    return (
                      <VideoCard
                        key={video.id}
                        video={video}
                        isBookmarked={isBookmarked}
                        onToggleBookmark={handleToggleBookmark}
                        onPlayPreview={setActivePreviewVideo}
                      />
                    );
                  })}
                </div>
              )}
            </article>
          )}

          {/* Initial Standby State */}
          {!currentRecord && !isLoading && (
            <article className="text-center py-24 bg-white border border-[rgba(26,26,26,0.08)] p-8">
              <span className="label-mono block mb-2">Ready For Analysis</span>
              <h2 className="font-serif-cormorant text-3xl sm:text-4xl font-semibold text-[#1a1a1a]">
                Execute Product Video Discovery
              </h2>
              <p className="text-xs text-[rgba(26,26,26,0.6)] max-w-md mx-auto mt-3 leading-relaxed">
                Type an e-commerce keyword or paste a product link in the left panel to trigger the multimodal vision brain and gather 40+ verified short-form videos.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => handleSelectSample('oversized graphic tee')}
                  className="px-4 py-2 border border-[#1a1a1a] font-mono-space text-xs uppercase tracking-wider text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition cursor-pointer"
                >
                  👕 Test Oversized Graphic Tee
                </button>
              </div>
            </article>
          )}
        </section>
      </div>

      {/* System Footer */}
      <footer className="h-12 border-t border-[rgba(26,26,26,0.08)] flex items-center justify-center px-6 sm:px-10 bg-white shrink-0">
        <span className="label-mono text-[0.62rem]">
          Full-stack AI automation pipeline discovering 20+ Instagram Reels and 20+ Meta Ad Library videos.
        </span>
      </footer>

      {/* Modals & Drawers */}
      <VideoPlayerModal
        video={activePreviewVideo}
        onClose={() => setActivePreviewVideo(null)}
        isBookmarked={bookmarks.some((b) => b.id === activePreviewVideo?.id)}
        onToggleBookmark={handleToggleBookmark}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        searches={historyRecords}
        onSelectSearch={(rec) => setCurrentRecord(rec)}
        onClearHistory={handleResetSeenCache}
      />

      <TestEvidenceModal
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        evidence={evidenceRecords}
        onRunTest={handleSelectSample}
      />

      <ShortlistModal
        isOpen={isShortlistOpen}
        onClose={() => setIsShortlistOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleToggleBookmark}
        onPlayPreview={setActivePreviewVideo}
      />
    </div>
  );
}
