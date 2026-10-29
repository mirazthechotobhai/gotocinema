import React, { useRef, useEffect, useState } from 'react';
import { MediaItem } from '../types';
import { imgUrl, getTitle, getYear, typeBg, typeLabel } from '../services/api';

interface FeaturedCarouselProps {
  items: MediaItem[];
  onSelectItem: (item: MediaItem) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ items, onSelectItem }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const dragInfo = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });

  const featItems = items.slice(0, 20);

  // Auto-scrolling ticker loop
  useEffect(() => {
    const sc = scrollerRef.current;
    if (!sc || !featItems.length) return;

    let rafId: number;
    let lastTs: number | null = null;
    let isPaused = false;

    const speed = window.innerWidth <= 720 ? 0.04 : 0.07;

    const tick = (ts: number) => {
      if (lastTs === null) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (!isPaused && !dragInfo.current.isDown && sc) {
        sc.scrollLeft += speed * dt;
        const half = sc.scrollWidth / 2;
        if (sc.scrollLeft >= half) {
          sc.scrollLeft -= half;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onMouseEnter = () => {
      isPaused = true;
    };
    const onMouseLeave = () => {
      if (!dragInfo.current.isDown) isPaused = false;
    };

    sc.addEventListener('mouseenter', onMouseEnter);
    sc.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      sc.removeEventListener('mouseenter', onMouseEnter);
      sc.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [featItems.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const sc = scrollerRef.current;
    if (!sc) return;
    dragInfo.current.isDown = true;
    dragInfo.current.hasMoved = false;
    dragInfo.current.startX = e.pageX;
    dragInfo.current.scrollLeft = sc.scrollLeft;
    setIsGrabbing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const sc = scrollerRef.current;
    if (!dragInfo.current.isDown || !sc) return;
    const dx = e.pageX - dragInfo.current.startX;
    if (Math.abs(dx) > 5) {
      dragInfo.current.hasMoved = true;
    }
    let n = dragInfo.current.scrollLeft - dx;
    const half = sc.scrollWidth / 2;
    if (n >= half) n -= half;
    if (n < 0) n += half;
    sc.scrollLeft = n;
  };

  const handleMouseUp = () => {
    dragInfo.current.isDown = false;
    setIsGrabbing(false);
  };

  if (!featItems.length) return null;

  // Duplicate items for continuous looping
  const loopItems = [...featItems, ...featItems];

  return (
    <div className="bg-gradient-to-b from-[#262626] via-[#f00] to-[#262626] py-5 px-2 overflow-hidden border-b border-[#262626]">
      <div className="w-full">
        <h2 className="text-white text-xl md:text-2xl uppercase font-bold tracking-wider text-center pb-2">
          Top Of The Week
        </h2>

        {/* Heading Underline Accent */}
        <div className="relative max-w-[120px] h-px bg-white mx-auto mb-4">
          <div className="absolute top-[-5px] left-0 right-0 w-[60px] h-px bg-white mx-auto" />
          <div className="absolute bottom-[-5px] left-0 right-0 w-[60px] h-px bg-white mx-auto" />
        </div>

        {/* Scroller Track */}
        <div
          ref={scrollerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex overflow-x-auto py-1 px-2 select-none hide-scrollbar ${
            isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div className="flex gap-2.5">
            {loopItems.map((item, idx) => {
              const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => {
                    if (!dragInfo.current.hasMoved) {
                      onSelectItem(item);
                    }
                  }}
                  className="shrink-0 w-[140px] rounded-md overflow-hidden bg-[#181818] cursor-pointer relative flex flex-col hover:shadow-[0_10px_24px_rgba(0,0,0,0.7)] hover:-translate-y-1 transition-all group"
                >
                  <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#111]">
                    <img
                      src={imgUrl(item.poster_path, 'w300')}
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
                  <div className="p-2 flex flex-col justify-between flex-1">
                    <div className="text-[11px] font-bold text-gray-200 line-clamp-2 leading-tight">
                      {getTitle(item)}
                    </div>
                    <div className="text-[9px] text-gray-400 mt-1">{getYear(item)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
