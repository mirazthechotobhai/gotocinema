import React, { useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { imgUrl, avatarUrl, getTitle, getYear, typeBg, typeLabel } from '../services/api';

interface MediaGridProps {
  title: string;
  items: MediaItem[];
  people?: any[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectItem: (item: MediaItem) => void;
  onSelectPerson: (id: number) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  title,
  items,
  people,
  isLoading,
  hasMore,
  onLoadMore,
  onSelectItem,
  onSelectPerson,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for infinite scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          onLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isLoading, hasMore, onLoadMore]);

  // Handle direct link ad if on
  const handleItemClick = (item: MediaItem) => {
    try {
      const ads = window.GTC_ADS;
      const directLink = ads && ads.getConfig ? ads.getConfig('directLink') : null;
      if (ads && ads.isOn && ads.isOn('directLink') && directLink && directLink.url) {
        window.open(directLink.url, '_blank', 'noopener,noreferrer');
      }
    } catch {}
    onSelectItem(item);
  };

  return (
    <div className="w-full px-2 sm:px-4 py-4 max-w-[1600px] mx-auto">
      {/* People section if search returned people */}
      {people && people.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 text-lg font-bold uppercase tracking-wider text-white px-2 mb-3">
            <span>People</span>
            <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {people.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPerson(p.id)}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all hover:-translate-y-0.5"
              >
                {p.profile_path ? (
                  <img
                    src={avatarUrl(p.profile_path, 'w185')}
                    alt={p.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0 border-2 border-red-500/40"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border-2 border-red-500/40">
                    <svg className="w-5 h-5 text-gray-400 stroke-current fill-none" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {p.known_for_department || 'Actor'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Heading */}
      <div className="flex items-center gap-3 text-lg font-bold uppercase tracking-wider text-white px-2 mb-3">
        <span>{title}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent" />
      </div>

      {/* Cards Grid */}
      {items.length === 0 && !isLoading ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          No titles found. Try adjusting your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {items.map((item, idx) => {
            const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
            const year = getYear(item);
            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => handleItemClick(item)}
                className="bg-[#181818] rounded-md overflow-hidden cursor-pointer relative flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.7)] hover:z-10 transition-all group"
              >
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#111]">
                  <img
                    src={imgUrl(item.poster_path, 'w342')}
                    alt={getTitle(item)}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className="absolute top-1.5 left-1.5 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase z-10"
                    style={{ background: typeBg(item.contentType) }}
                  >
                    {typeLabel(item.contentType)}
                  </span>
                  {rating && (
                    <span className="absolute top-1.5 right-1.5 bg-black/75 text-[#f5c518] text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                      ★ {rating}
                    </span>
                  )}
                </div>
                <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                  <div className="text-xs font-bold text-gray-200 line-clamp-2 leading-snug">
                    {getTitle(item)}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-between">
                    {year && <span>{year}</span>}
                    {rating && <span className="text-[#f5c518] font-bold">★ {rating}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Skeletons when loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5 mt-2.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-[#181818] rounded-md overflow-hidden">
              <div className="w-full aspect-[2/3] shimmer-effect" />
              <div className="p-2 space-y-2">
                <div className="h-3 w-4/5 rounded shimmer-effect" />
                <div className="h-2.5 w-1/2 rounded shimmer-effect" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-10 mt-4" />
    </div>
  );
};
