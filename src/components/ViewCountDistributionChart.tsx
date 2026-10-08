import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { VideoResult } from '../types/index.js';
import { TrendingUp, BarChart2, Eye, Award, ExternalLink } from 'lucide-react';

interface ViewCountDistributionChartProps {
  videos: VideoResult[];
  onSelectVideo?: (video: VideoResult) => void;
}

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num.toLocaleString();
}

interface ChartDataPoint {
  index: number;
  rankLabel: string;
  name: string;
  views: number;
  matchScore: number;
  platform: string;
  author: string;
  video: VideoResult;
}

export const ViewCountDistributionChart: React.FC<ViewCountDistributionChartProps> = ({
  videos,
  onSelectVideo,
}) => {
  const [sortMode, setSortMode] = useState<'ranked' | 'sorted_views'>('ranked');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'meta'>('all');

  // Filter and extract top 20
  const top20Data = useMemo(() => {
    let pool = videos;
    if (platformFilter !== 'all') {
      pool = pool.filter((v) => v.platform === platformFilter);
    }

    // Default to first 20 as ordered by search relevance
    let selected = pool.slice(0, 20);

    if (sortMode === 'sorted_views') {
      selected = [...selected].sort(
        (a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0)
      );
    }

    return selected.map((v, idx): ChartDataPoint => {
      const views = v.metrics?.views || 0;
      return {
        index: idx + 1,
        rankLabel: `#${idx + 1}`,
        name: v.title.length > 25 ? `${v.title.slice(0, 25)}…` : v.title,
        views,
        matchScore: v.matchScore,
        platform: v.platform === 'instagram' ? 'Instagram Reel' : 'Meta Ad Library',
        author: v.author?.name || v.adMetadata?.advertiserName || 'Creator',
        video: v,
      };
    });
  }, [videos, platformFilter, sortMode]);

  // Aggregate stats across the top 20
  const stats = useMemo(() => {
    if (top20Data.length === 0) {
      return { totalViews: 0, avgViews: 0, maxViews: 0, topVideoName: 'N/A' };
    }
    const totalViews = top20Data.reduce((acc, curr) => acc + curr.views, 0);
    const avgViews = Math.round(totalViews / top20Data.length);
    const maxItem = [...top20Data].sort((a, b) => b.views - a.views)[0];

    return {
      totalViews,
      avgViews,
      maxViews: maxItem?.views || 0,
      topVideoName: maxItem?.video.title || 'N/A',
    };
  }, [top20Data]);

  if (videos.length === 0) return null;

  return (
    <section className="bg-white border border-[rgba(26,26,26,0.08)] p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[rgba(26,26,26,0.08)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#1a1a1a]" />
            <h4 className="font-serif-cormorant text-2xl sm:text-3xl font-semibold text-[#1a1a1a]">
              View Count Distribution
            </h4>
          </div>
          <p className="text-[0.72rem] text-[rgba(26,26,26,0.6)] font-mono-space mt-1">
            Recharts visualization of audience engagement across top {top20Data.length} discovery results
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Platform switch */}
          <div className="flex items-center bg-[#f5f4f0] p-0.5 border border-[rgba(26,26,26,0.1)]">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-2.5 py-1 text-[0.65rem] font-mono-space transition cursor-pointer ${
                platformFilter === 'all'
                  ? 'bg-white text-[#1a1a1a] shadow-xs font-bold'
                  : 'text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]'
              }`}
            >
              All Platforms
            </button>
            <button
              onClick={() => setPlatformFilter('instagram')}
              className={`px-2.5 py-1 text-[0.65rem] font-mono-space transition cursor-pointer ${
                platformFilter === 'instagram'
                  ? 'bg-white text-[#1a1a1a] shadow-xs font-bold'
                  : 'text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setPlatformFilter('meta')}
              className={`px-2.5 py-1 text-[0.65rem] font-mono-space transition cursor-pointer ${
                platformFilter === 'meta'
                  ? 'bg-white text-[#1a1a1a] shadow-xs font-bold'
                  : 'text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]'
              }`}
            >
              Meta Ads
            </button>
          </div>

          {/* Sort order switch */}
          <div className="flex items-center bg-[#f5f4f0] p-0.5 border border-[rgba(26,26,26,0.1)]">
            <button
              onClick={() => setSortMode('ranked')}
              className={`px-2.5 py-1 text-[0.65rem] font-mono-space transition cursor-pointer ${
                sortMode === 'ranked'
                  ? 'bg-white text-[#1a1a1a] shadow-xs font-bold'
                  : 'text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]'
              }`}
            >
              Relevance Rank
            </button>
            <button
              onClick={() => setSortMode('sorted_views')}
              className={`px-2.5 py-1 text-[0.65rem] font-mono-space transition cursor-pointer ${
                sortMode === 'sorted_views'
                  ? 'bg-white text-[#1a1a1a] shadow-xs font-bold'
                  : 'text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]'
              }`}
            >
              Views High-Low
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 bg-[#faf9f6] border border-[rgba(26,26,26,0.06)]">
          <div className="flex items-center gap-1.5 text-[rgba(26,26,26,0.5)] font-mono-space text-[0.62rem]">
            <Eye className="w-3 h-3 text-[#1a1a1a]" />
            <span>TOP 20 TOTAL REACH</span>
          </div>
          <div className="font-serif-cormorant text-2xl font-bold text-[#1a1a1a] mt-1">
            {formatCompactNumber(stats.totalViews)}
          </div>
          <div className="text-[0.65rem] text-[rgba(26,26,26,0.5)] font-mono-space mt-0.5">
            Combined views
          </div>
        </div>

        <div className="p-3.5 bg-[#faf9f6] border border-[rgba(26,26,26,0.06)]">
          <div className="flex items-center gap-1.5 text-[rgba(26,26,26,0.5)] font-mono-space text-[0.62rem]">
            <TrendingUp className="w-3 h-3 text-emerald-700" />
            <span>AVERAGE VIEWS</span>
          </div>
          <div className="font-serif-cormorant text-2xl font-bold text-[#1a1a1a] mt-1">
            {formatCompactNumber(stats.avgViews)}
          </div>
          <div className="text-[0.65rem] text-[rgba(26,26,26,0.5)] font-mono-space mt-0.5">
            Per video average
          </div>
        </div>

        <div className="p-3.5 bg-[#faf9f6] border border-[rgba(26,26,26,0.06)]">
          <div className="flex items-center gap-1.5 text-[rgba(26,26,26,0.5)] font-mono-space text-[0.62rem]">
            <Award className="w-3 h-3 text-blue-700" />
            <span>PEAK VIDEO VIEWS</span>
          </div>
          <div className="font-serif-cormorant text-2xl font-bold text-[#1a1a1a] mt-1">
            {formatCompactNumber(stats.maxViews)}
          </div>
          <div className="text-[0.65rem] text-[rgba(26,26,26,0.5)] font-mono-space mt-0.5 truncate" title={stats.topVideoName}>
            {stats.topVideoName.slice(0, 22)}…
          </div>
        </div>

        <div className="p-3.5 bg-[#faf9f6] border border-[rgba(26,26,26,0.06)]">
          <div className="flex items-center gap-1.5 text-[rgba(26,26,26,0.5)] font-mono-space text-[0.62rem]">
            <BarChart2 className="w-3 h-3 text-purple-700" />
            <span>DATA SAMPLE SIZE</span>
          </div>
          <div className="font-serif-cormorant text-2xl font-bold text-[#1a1a1a] mt-1">
            {top20Data.length} Results
          </div>
          <div className="text-[0.65rem] text-[rgba(26,26,26,0.5)] font-mono-space mt-0.5">
            Verified top videos
          </div>
        </div>
      </div>

      {/* Recharts Line Chart Container */}
      <div className="w-full h-[280px] sm:h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={top20Data}
            margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0 && onSelectVideo) {
                const point = state.activePayload[0].payload as ChartDataPoint;
                if (point?.video) {
                  onSelectVideo(point.video);
                }
              }
            }}
          >
            <CartesianGrid
              stroke="rgba(26, 26, 26, 0.07)"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="rankLabel"
              tickLine={false}
              axisLine={{ stroke: 'rgba(26, 26, 26, 0.2)' }}
              tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#1a1a1a' }}
              dy={10}
            />

            <YAxis
              tickLine={false}
              axisLine={{ stroke: 'rgba(26, 26, 26, 0.2)' }}
              tick={{ fontSize: 11, fontFamily: 'monospace', fill: 'rgba(26, 26, 26, 0.7)' }}
              tickFormatter={(v: number) => formatCompactNumber(v)}
              width={55}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0].payload as ChartDataPoint;
                return (
                  <div className="bg-[#1a1a1a] text-white p-3.5 shadow-xl border border-white/10 text-xs font-mono-space max-w-xs space-y-2">
                    <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-1.5">
                      <span className="font-bold text-amber-300">Rank {data.rankLabel}</span>
                      <span className="text-[0.65rem] text-white/70">{data.platform}</span>
                    </div>

                    <p className="text-[0.72rem] leading-snug line-clamp-2 text-white/90">
                      {data.video.title}
                    </p>

                    <div className="flex items-center justify-between text-[0.68rem] pt-1">
                      <span className="text-white/60">Views:</span>
                      <strong className="text-emerald-400 font-bold">
                        {data.views.toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-[0.68rem]">
                      <span className="text-white/60">Match Score:</span>
                      <span className="font-bold text-white">
                        {data.matchScore}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[0.68rem] text-white/50 pt-1 border-t border-white/10">
                      <span>Creator: {data.author}</span>
                      <span className="text-[0.62rem] text-blue-300 flex items-center gap-0.5">
                        Click to view <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {/* Average Views Reference Line */}
            {stats.avgViews > 0 && (
              <ReferenceLine
                y={stats.avgViews}
                stroke="#d97706"
                strokeDasharray="4 4"
                label={{
                  value: `Avg: ${formatCompactNumber(stats.avgViews)}`,
                  position: 'insideTopRight',
                  fill: '#d97706',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="views"
              name="View Count"
              stroke="#1a1a1a"
              strokeWidth={2.5}
              dot={{
                r: 3.5,
                fill: '#ffffff',
                stroke: '#1a1a1a',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: '#d97706',
                stroke: '#1a1a1a',
                strokeWidth: 2,
                cursor: 'pointer',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[0.65rem] font-mono-space text-[rgba(26,26,26,0.5)] pt-2 border-t border-[rgba(26,26,26,0.06)]">
        <span>* Interactive: Click any data point to preview the corresponding short-form video</span>
        <span className="hidden sm:inline">Dashed line indicates mean view baseline</span>
      </div>
    </section>
  );
};
