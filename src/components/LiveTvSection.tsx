import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { IPTVChannel, AdminSettings } from '../types';
import { fetchM3UPlaylist } from '../services/iptv';

interface LiveTvSectionProps {
  adminSettings: AdminSettings;
}

export const LiveTvSection: React.FC<LiveTvSectionProps> = ({ adminSettings }) => {
  const [subTab, setSubTab] = useState<'fifa' | 'livetv' | 'movies'>('fifa');
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<IPTVChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<IPTVChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryTimerRef = useRef<any>(null);

  // Load playlist
  useEffect(() => {
    setIsLoading(true);
    fetchM3UPlaylist(adminSettings.iptv)
      .then((chs) => {
        setChannels(chs);
        setFilteredChannels(chs);

        // Extract groups
        const groups = Array.from(new Set(chs.map((c) => c.group).filter(Boolean))).sort();
        setCategories(groups);

        if (chs.length > 0 && !activeChannel) {
          setActiveChannel(chs[0]);
        }
      })
      .finally(() => setIsLoading(false));
  }, [adminSettings.iptv]);

  // Filter channels by query and category
  useEffect(() => {
    let res = channels;
    if (selectedCategory) {
      res = res.filter((c) => c.group === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      res = res.filter(
        (c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
      );
    }
    setFilteredChannels(res);
    setDisplayCount(100);
  }, [searchQuery, selectedCategory, channels]);

  // Play active channel stream
  useEffect(() => {
    if (subTab !== 'fifa' || !activeChannel || !videoRef.current) return;

    clearTimeout(retryTimerRef.current);
    setStreamError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    const url = activeChannel.url;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, manifestLoadingMaxRetry: 2 });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          handleStreamError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(() => {});
      video.onerror = handleStreamError;
    } else {
      video.src = url;
      video.play().catch(() => {});
    }

    return () => {
      clearTimeout(retryTimerRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeChannel, subTab]);

  const handleStreamError = () => {
    setStreamError(true);
    clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      setStreamError(false);
      handlePlayNext();
    }, 3000);
  };

  const handlePlayNext = () => {
    clearTimeout(retryTimerRef.current);
    setStreamError(false);
    if (!activeChannel || !filteredChannels.length) return;
    const idx = filteredChannels.findIndex((c) => c.id === activeChannel.id);
    const next = filteredChannels[(idx + 1) % filteredChannels.length];
    if (next) setActiveChannel(next);
  };

  const handlePlayPrev = () => {
    clearTimeout(retryTimerRef.current);
    setStreamError(false);
    if (!activeChannel || !filteredChannels.length) return;
    const idx = filteredChannels.findIndex((c) => c.id === activeChannel.id);
    const prev = filteredChannels[(idx - 1 + filteredChannels.length) % filteredChannels.length];
    if (prev) setActiveChannel(prev);
  };

  const visibleList = filteredChannels.slice(0, displayCount);

  return (
    <div className="w-full h-[calc(100vh-127px)] bg-[#111827] flex flex-col overflow-hidden text-white">
      {/* Sub-header Navigation */}
      <div className="h-11 bg-[#1f2937] flex items-center justify-between px-3 md:px-5 shrink-0 shadow-md">
        <button
          onClick={() => window.history.back()}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs font-bold transition-colors"
        >
          Back
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('fifa')}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors ${
              subTab === 'fifa' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Live Channels
          </button>
          <button
            onClick={() => setSubTab('livetv')}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors ${
              subTab === 'livetv' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            FIFA / Sports
          </button>
          <button
            onClick={() => setSubTab('movies')}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors ${
              subTab === 'movies' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Movies Portal
          </button>
        </div>

        <button
          onClick={() => {
            setSubTab('fifa');
            if (filteredChannels.length) setActiveChannel(filteredChannels[0]);
          }}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors"
        >
          Home
        </button>
      </div>

      {/* Main Content Area */}
      {subTab === 'fifa' ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0a0d12]">
          {/* Main Video View */}
          <div className="flex-1 flex flex-col bg-black overflow-hidden order-1 md:order-2">
            <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
              {activeChannel ? (
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 gap-2 p-6">
                  <svg className="w-12 h-12 stroke-current fill-none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                  <p className="font-semibold text-sm">No Channel Selected</p>
                  <span className="text-xs">Select a channel from the list to start watching</span>
                </div>
              )}

              {/* Stream Error Overlay with countdown */}
              {streamError && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0e18]/90 border border-red-500/50 rounded-xl p-4 text-center z-20 shadow-2xl backdrop-blur-md">
                  <div className="text-red-400 text-xs font-semibold mb-2">
                    ⚠️ Stream unavailable — trying next...
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handlePlayNext}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold"
                    >
                      ▶ Next Channel
                    </button>
                    <button
                      onClick={() => setStreamError(false)}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold"
                    >
                      ✕ Dismiss
                    </button>
                  </div>
                  <div className="h-0.5 bg-blue-500 rounded mt-2 w-full animate-[shrink_3s_linear_forwards]" />
                </div>
              )}
            </div>

            {/* Player Controls Bar */}
            <div className="h-14 bg-[#0d1117] border-t border-[#1e2836] px-4 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded bg-[#131820] border border-[#1e2836] flex items-center justify-center overflow-hidden shrink-0">
                  {activeChannel?.logo ? (
                    <img
                      src={activeChannel.logo}
                      alt=""
                      className="w-full h-full object-contain p-0.5"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xs font-bold text-gray-400">
                      {activeChannel?.name.charAt(0) || '▶'}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-gray-200 truncate max-w-[200px] sm:max-w-xs">
                  {activeChannel?.name || 'No channel playing'}
                </div>
              </div>

              <div className="flex items-center rounded-full overflow-hidden border border-[#1e2836] bg-[#1e2836]">
                <button
                  onClick={handlePlayPrev}
                  className="px-4 py-1.5 text-xs font-bold text-gray-200 hover:bg-[#2a3a52] flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polygon points="19 20 9 12 19 4 19 20" />
                    <line x1="5" y1="19" x2="5" y2="5" />
                  </svg>
                  Prev
                </button>
                <div className="w-px h-4 bg-white/10" />
                <button
                  onClick={handlePlayNext}
                  className="px-4 py-1.5 text-xs font-bold text-gray-200 hover:bg-[#2a3a52] flex items-center gap-1 transition-colors"
                >
                  Next
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polygon points="5 4 15 12 5 20 5 4" />
                    <line x1="19" y1="5" x2="19" y2="19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Channels List */}
          <div className="w-full md:w-80 h-64 md:h-full bg-[#0d1117] border-t md:border-t-0 md:border-r border-[#1e2836] flex flex-col shrink-0 order-2 md:order-1">
            <div className="p-3 border-b border-[#1e2836] space-y-2 shrink-0">
              {/* Search Channels */}
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131820] border border-[#1e2836] focus:border-blue-500 rounded px-2.5 py-1.5 text-xs text-white outline-none"
              />

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#131820] border border-[#1e2836] focus:border-blue-500 rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex justify-between items-center text-[11px] text-gray-400">
                <span>{isLoading ? 'Loading channels...' : `${filteredChannels.length} channels`}</span>
                <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full text-[10px]">
                  Showing {Math.min(visibleList.length, filteredChannels.length)}
                </span>
              </div>
            </div>

            {/* Channel Items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {visibleList.map((ch) => {
                const isActive = activeChannel?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded text-left transition-colors ${
                      isActive
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-[#131820] flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-gray-400">
                      {ch.logo ? (
                        <img
                          src={ch.logo}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        ch.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{ch.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{ch.group}</div>
                    </div>
                  </button>
                );
              })}

              {visibleList.length < filteredChannels.length && (
                <button
                  onClick={() => setDisplayCount((c) => c + 100)}
                  className="w-full py-2 mt-2 bg-[#131820] hover:bg-[#1e2836] border border-[#1e2836] rounded text-xs font-semibold text-gray-300"
                >
                  Load More Channels
                </button>
              )}
            </div>
          </div>
        </div>
      ) : subTab === 'livetv' ? (
        <div className="flex-1 w-full h-full relative">
          <iframe
            src={adminSettings.fifa && adminSettings.fifa !== '#' ? adminSettings.fifa : 'about:blank'}
            title="FIFA World Cup & Live Sports"
            className="w-full h-full border-none"
            allow="autoplay; fullscreen; encrypted-media"
          />
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          <iframe
            src={adminSettings.movies || 'https://kwvdnm.movielinkbd.li/'}
            title="Movies Portal"
            className="w-full h-full border-none"
            allow="autoplay; fullscreen; encrypted-media"
          />
        </div>
      )}
    </div>
  );
};
