import React, { useState, useRef } from 'react';
import { Upload, X, SlidersHorizontal, ArrowRight, Loader2, Sparkles, Film, Tag, Globe, Image as ImageIcon } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (params: {
    query?: string;
    url?: string;
    imageBase64?: string;
    includeTikTok: boolean;
    minMatchThreshold: number;
    showPreviouslySeen: boolean;
  }) => void;
  isLoading: boolean;
  showPreviouslySeen: boolean;
  onTogglePreviouslySeen: (val: boolean) => void;
  igCount?: number;
  metaCount?: number;
  filteredDuplicates?: number;
  isVerified?: boolean;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  isLoading,
  showPreviouslySeen,
  onTogglePreviouslySeen,
  igCount = 0,
  metaCount = 0,
  filteredDuplicates = 0,
  isVerified = false,
}) => {
  const [activeTab, setActiveTab] = useState<'keyword' | 'url' | 'video_url' | 'image'>('keyword');
  const [keyword, setKeyword] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [includeTikTok, setIncludeTikTok] = useState(false);
  const [minMatchThreshold, setMinMatchThreshold] = useState(60);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleProducts = [
    { label: 'Oversized Graphic Tee', icon: '👕', query: 'oversized graphic tee' },
    { label: 'Protein Dark Chocolate', icon: '🍫', query: 'protein dark chocolate' },
    { label: 'Retro Running Sneakers', icon: '👟', query: 'sneakers' },
    { label: 'Heavyweight Boxy Hoodie', icon: '🧥', query: 'hoodie' },
    { label: 'Waterproof Tactical Backpack', icon: '🎒', query: 'backpack' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (activeTab === 'keyword' && !keyword.trim()) return;
    if (activeTab === 'url' && !productUrl.trim()) return;
    if (activeTab === 'video_url' && !videoUrl.trim()) return;
    if (activeTab === 'image' && !imagePreview) return;

    onSearch({
      query: activeTab === 'keyword' ? keyword : undefined,
      url: activeTab === 'url' ? productUrl : (activeTab === 'video_url' ? videoUrl : undefined),
      imageBase64: activeTab === 'image' ? imagePreview || undefined : undefined,
      includeTikTok,
      minMatchThreshold,
      showPreviouslySeen,
    });
  };

  const selectSampleKeyword = (sampleQuery: string) => {
    setActiveTab('keyword');
    setKeyword(sampleQuery);
    onSearch({
      query: sampleQuery,
      includeTikTok,
      minMatchThreshold,
      showPreviouslySeen,
    });
  };

  return (
    <aside className="w-full lg:w-[400px] bg-white border-r border-[rgba(26,26,26,0.08)] p-8 sm:p-10 overflow-y-auto shrink-0 flex flex-col justify-between">
      <div>
        {/* Search Input Box */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="label-mono">Product Identification</span>
          </div>

          <form onSubmit={handleTriggerSearch}>
            {activeTab === 'keyword' && (
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Graphic Tee, Sneakers..."
                  className="w-full border-none border-b border-[#1a1a1a] py-3 font-serif-cormorant text-2xl text-[#1a1a1a] placeholder:text-[rgba(26,26,26,0.3)] bg-transparent outline-none focus:border-[#1a1a1a]"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword('')}
                    className="absolute right-0 top-3 text-[rgba(26,26,26,0.4)] hover:text-[#1a1a1a]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {activeTab === 'url' && (
              <div className="relative">
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://brand.com/products/..."
                  className="w-full border-none border-b border-[#1a1a1a] py-3 font-serif-cormorant text-xl text-[#1a1a1a] placeholder:text-[rgba(26,26,26,0.3)] bg-transparent outline-none"
                />
                {productUrl && (
                  <button
                    type="button"
                    onClick={() => setProductUrl('')}
                    className="absolute right-0 top-3 text-[rgba(26,26,26,0.4)] hover:text-[#1a1a1a]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {activeTab === 'video_url' && (
              <div className="relative">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://instagram.com/reel/... or Meta Ad URL"
                  className="w-full border-none border-b border-[#1a1a1a] py-3 font-mono-space text-xs text-[#1a1a1a] placeholder:text-[rgba(26,26,26,0.4)] bg-transparent outline-none"
                />
                {videoUrl && (
                  <button
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="absolute right-0 top-3 text-[rgba(26,26,26,0.4)] hover:text-[#1a1a1a]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {activeTab === 'image' && (
              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative aspect-video rounded border border-[rgba(26,26,26,0.1)] overflow-hidden">
                    <img src={imagePreview} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border border-dashed border-[rgba(26,26,26,0.2)] hover:border-[#1a1a1a] text-center flex flex-col items-center gap-1 cursor-pointer transition"
                  >
                    <Upload className="w-4 h-4 text-[#1a1a1a]" />
                    <span className="label-mono text-[0.65rem]">Upload Photo File</span>
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons: Execute Pipeline */}
            <div className="mt-4">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  (activeTab === 'keyword' && !keyword.trim()) ||
                  (activeTab === 'url' && !productUrl.trim()) ||
                  (activeTab === 'video_url' && !videoUrl.trim()) ||
                  (activeTab === 'image' && !imagePreview)
                }
                className="w-full bg-[#1a1a1a] hover:bg-[#333333] text-white py-3.5 font-mono-space text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Pipeline...</span>
                  </>
                ) : (
                  <span>Execute Search Pipeline</span>
                )}
              </button>
            </div>

            {/* Input Mode Selector */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab('keyword')}
                className={`label-mono text-[0.62rem] transition cursor-pointer ${
                  activeTab === 'keyword' ? 'text-[#1a1a1a] font-bold underline' : 'opacity-40 hover:opacity-80'
                }`}
              >
                By Name
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`label-mono text-[0.62rem] transition cursor-pointer ${
                  activeTab === 'url' ? 'text-[#1a1a1a] font-bold underline' : 'opacity-40 hover:opacity-80'
                }`}
              >
                By URL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('video_url')}
                className={`label-mono text-[0.62rem] transition cursor-pointer ${
                  activeTab === 'video_url' ? 'text-[#1a1a1a] font-bold underline text-blue-700' : 'opacity-40 hover:opacity-80'
                }`}
              >
                By Video URL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={`label-mono text-[0.62rem] transition cursor-pointer ${
                  activeTab === 'image' ? 'text-[#1a1a1a] font-bold underline' : 'opacity-40 hover:opacity-80'
                }`}
              >
                By Image
              </button>
            </div>
          </form>
        </div>

        {/* Pipeline Metrics */}
        <div className="mt-10 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="label-mono">Pipeline Metrics</span>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="label-mono text-[0.6rem] hover:opacity-70 flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{showAdvanced ? 'Hide Config' : 'Config'}</span>
            </button>
          </div>

          <div className="flex justify-between items-baseline border-b border-[rgba(26,26,26,0.08)] pb-2">
            <span className="label-mono text-[0.68rem]">Instagram Reels</span>
            <span className="font-serif-cormorant text-2xl font-semibold text-[#1a1a1a]">
              {String(igCount).padStart(2, '0')}/20
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-[rgba(26,26,26,0.08)] pb-2">
            <span className="label-mono text-[0.68rem]">Meta Ad Library</span>
            <span className="font-serif-cormorant text-2xl font-semibold text-[#1a1a1a]">
              {String(metaCount).padStart(2, '0')}/20
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-[rgba(26,26,26,0.08)] pb-2">
            <span className="label-mono text-[0.68rem]">Filtered Duplicates</span>
            <span className="font-serif-cormorant text-2xl font-semibold text-[#1a1a1a]">
              {String(filteredDuplicates).padStart(2, '0')}
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-[rgba(26,26,26,0.08)] pb-2">
            <span className="label-mono text-[0.68rem]">Discovery Status</span>
            <span className="label-mono font-bold text-emerald-600">
              {isLoading ? 'Processing' : isVerified ? 'Verified' : 'Standby'}
            </span>
          </div>
        </div>

        {/* Advanced Config Drawer */}
        {showAdvanced && (
          <div className="mt-6 p-4 bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] space-y-4">
            <div>
              <div className="flex justify-between text-[0.65rem] font-mono-space mb-1">
                <span className="label-mono">Threshold</span>
                <span className="font-bold">{minMatchThreshold}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={minMatchThreshold}
                onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
                className="w-full accent-[#1a1a1a] h-1 bg-[rgba(26,26,26,0.2)] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[0.65rem] font-mono-space">
              <span className="label-mono">TikTok Bonus</span>
              <input
                type="checkbox"
                checked={includeTikTok}
                onChange={(e) => setIncludeTikTok(e.target.checked)}
                className="accent-[#1a1a1a] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[0.65rem] font-mono-space">
              <span className="label-mono">Previously Seen</span>
              <input
                type="checkbox"
                checked={showPreviouslySeen}
                onChange={(e) => onTogglePreviouslySeen(e.target.checked)}
                className="accent-[#1a1a1a] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Recent System Tests */}
        <div className="mt-12">
          <span className="label-mono block mb-3">Recent System Tests</span>
          <div className="flex flex-col gap-2">
            {sampleProducts.map((p) => (
              <button
                key={p.query}
                onClick={() => selectSampleKeyword(p.query)}
                className="text-left py-1 text-[0.72rem] font-medium text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a] transition cursor-pointer flex items-center justify-between group"
              >
                <span>{p.icon} {p.label}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition -translate-x-1 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
