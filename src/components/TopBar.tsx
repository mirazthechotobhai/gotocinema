import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { getTitle } from '../services/api';
import { SOCIAL_CONFIG } from '../config';

interface TopBarProps {
  trendingItems: MediaItem[];
}

export const TopBar: React.FC<TopBarProps> = ({ trendingItems }) => {
  const [tickIdx, setTickIdx] = useState(0);
  const [adsTimerText, setAdsTimerText] = useState<string | null>(null);

  // Cycle trending ticker
  useEffect(() => {
    if (!trendingItems.length) return;
    const interval = setInterval(() => {
      setTickIdx((prev) => (prev + 1) % trendingItems.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [trendingItems]);

  // Sync ads timer if available
  useEffect(() => {
    const checkAdsTimer = () => {
      try {
        if (window.GTC_ADS && typeof window.GTC_ADS.getTimerState === 'function') {
          const state = window.GTC_ADS.getTimerState();
          if (state && state.active && state.remainingMs > 0) {
            const totalSec = Math.max(0, Math.ceil(state.remainingMs / 1000));
            const m = Math.floor(totalSec / 60);
            const s = totalSec % 60;
            setAdsTimerText(`ADS ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
            return;
          }
        }
      } catch {}
      setAdsTimerText(null);
    };

    checkAdsTimer();
    const interval = setInterval(checkAdsTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentItem = trendingItems[tickIdx];

  return (
    <div className="topbar-wrapper sticky top-0 z-[200] border-b border-[#262626] bg-gradient-to-b from-[#262626] via-[#f00] to-[#262626]">
      <div className="flex items-center justify-between w-full h-[42px] px-4 md:px-6">
        {/* Trending Head */}
        <div className="flex items-center gap-1.5 h-[42px] px-3 bg-[#f00] text-white text-[11px] font-semibold whitespace-nowrap shrink-0">
          <span>⚡</span>
          <span className="hidden sm:inline">TRENDING</span>
          {adsTimerText && (
            <span
              className="inline-flex items-center justify-center min-w-[68px] px-2 py-0.5 ml-2 border border-white/30 rounded bg-black/30 text-white text-[9px] font-extrabold tracking-wider"
              title="Timed ads remaining"
            >
              {adsTimerText}
            </span>
          )}
        </div>

        {/* Ticker Item */}
        <div className="overflow-hidden flex-1 min-w-0 h-[42px] flex items-center px-3">
          {currentItem && (
            <div
              key={tickIdx}
              className="flex items-center gap-2.5 animate-[tickUp_4.2s_ease_forwards]"
            >
              <span className="text-[9px] font-extrabold text-white bg-white/10 border border-white/20 backdrop-blur-md rounded px-1.5 py-0.5 shrink-0 tracking-wider">
                #{tickIdx + 1}
              </span>
              <span className="text-[10px] font-medium text-white truncate max-w-[200px] sm:max-w-[400px]">
                {getTitle(currentItem)}
              </span>
            </div>
          )}
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-2">
          {SOCIAL_CONFIG.facebook && SOCIAL_CONFIG.facebook !== '#' && (
            <a
              href={SOCIAL_CONFIG.facebook}
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/25 hover:text-white hover:scale-110 transition-all"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          )}
          {SOCIAL_CONFIG.youtube && SOCIAL_CONFIG.youtube !== '#' && (
            <a
              href={SOCIAL_CONFIG.youtube}
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube"
              className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/25 hover:text-white hover:scale-110 transition-all"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </a>
          )}
          {SOCIAL_CONFIG.telegram && SOCIAL_CONFIG.telegram !== '#' && (
            <a
              href={SOCIAL_CONFIG.telegram}
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram"
              className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/25 hover:text-white hover:scale-110 transition-all"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M21.8 2.15a1 1 0 0 0-1.08-.15L2.27 9.6a1 1 0 0 0 .08 1.86l4.07 1.36 1.86 5.58a1 1 0 0 0 1.7.38l2.34-2.34 4.15 3.05a1 1 0 0 0 1.55-.63l3-15a1 1 0 0 0-.22-.71z" />
              </svg>
            </a>
          )}
          {SOCIAL_CONFIG.instagram && SOCIAL_CONFIG.instagram !== '#' && (
            <a
              href={SOCIAL_CONFIG.instagram}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/25 hover:text-white hover:scale-110 transition-all"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
