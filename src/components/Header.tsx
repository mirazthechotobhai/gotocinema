import React, { useState, useEffect, useRef } from 'react';
import { ContentType, MediaItem } from '../types';
import { searchMulti, typeBg } from '../services/api';
import { WEBSITE_CONFIG } from '../config';

interface HeaderProps {
  currentTab: ContentType;
  onSelectTab: (tab: ContentType) => void;
  onSearch: (query: string) => void;
  onSelectMedia: (item: MediaItem) => void;
  onSelectPerson: (id: number) => void;
  isAdvFilterOpen: boolean;
  onToggleAdvFilter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onSearch,
  onSelectMedia,
  onSelectPerson,
  isAdvFilterOpen,
  onToggleAdvFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<{ people: any[]; media: any[] } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions debounced
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions(null);
      setShowSuggestions(false);
      return;
    }

    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await searchMulti(q);
        setSuggestions({
          people: res.people.slice(0, 3),
          media: res.media.slice(0, 8),
        });
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (err) {
        setSuggestions(null);
      }
    }, 280);

    return () => clearTimeout(debounceTimerRef.current);
  }, [searchQuery]);

  // Voice Search setup
  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (e: any) => {
        const text = e.results[0]?.[0]?.transcript || '';
        if (text) {
          setSearchQuery(text);
          setShowSuggestions(false);
          onSearch(text);
        }
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions || (!suggestions.people.length && !suggestions.media.length)) {
      if (e.key === 'Enter') {
        setShowSuggestions(false);
        onSearch(searchQuery);
      }
      return;
    }

    const allItems = [
      ...suggestions.people.map((p) => ({ type: 'person', data: p })),
      ...suggestions.media.map((m) => ({ type: 'media', data: m })),
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && allItems[selectedIndex]) {
        const item = allItems[selectedIndex];
        setShowSuggestions(false);
        setSearchQuery('');
        if (item.type === 'person') {
          onSelectPerson(item.data.id);
        } else {
          onSelectMedia(item.data);
        }
      } else {
        setShowSuggestions(false);
        onSearch(searchQuery);
      }
    }
  };

  return (
    <header className="sticky top-[42px] z-[199] border-b border-[#262626] bg-gradient-to-r from-[#262626] via-[#f00] to-[#262626]">
      <div className="w-full min-h-[85px] px-4 md:px-6 flex flex-col md:flex-row items-center justify-between py-3 md:py-0 gap-3 md:gap-4">
        {/* Logo Button */}
        <button
          onClick={() => {
            onSelectTab('movie');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="relative px-5 py-2.5 text-base bg-gradient-to-r from-[#262626] via-[#f00] to-[#262626] text-white border-none rounded-lg cursor-pointer inline-flex items-center gap-2.5 font-semibold shadow-[0_5px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 transition-all"
        >
          <span className="flex items-center text-lg md:text-xl font-extrabold tracking-wider">
            G
            <img
              src={`/${WEBSITE_CONFIG.logoImageUrl || 'logo-icon.png'}`}
              alt="O"
              className="h-[0.82em] w-[0.82em] object-contain inline-block relative -top-0.5 mx-0.5"
            />
            TO&nbsp;<span className="cinema-text">CINEMA</span>
          </span>
          <div className="w-6 h-6 flex items-center justify-center text-white">
            <svg
              className="w-5 h-5 fill-none stroke-current"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M19.993 9.108c.383 .4 .687 .863 .893 1.368a4.195 4.195 0 0 1 .006 3.166a4.37 4.37 0 0 1 -.887 1.372a20.233 20.233 0 0 1 -2.208 2a20.615 20.615 0 0 1 -2.495 1.669a21.322 21.322 0 0 1 -5.622 2.202a4.213 4.213 0 0 1 -3.002 -.404a3.98 3.98 0 0 1 -1.163 -.967a3.796 3.796 0 0 1 -.695 -1.312c-1.199 -3.902 -1.022 -8.312 .134 -12.23c.609 -2.057 2.643 -3.349 4.737 -2.874c3.88 .88 7.52 3.147 10.302 6.01" />
              <path d="M14.044 13.034c.67 -.505 .67 -1.489 0 -2.01a14.824 14.824 0 0 0 -1.498 -1.044a15.783 15.783 0 0 0 -1.62 -.865c-.77 -.35 -1.63 .139 -1.753 .973a15.385 15.385 0 0 0 -.1 3.786a1.232 1.232 0 0 0 1.715 1.027a14.783 14.783 0 0 0 1.694 -.827a14.46 14.46 0 0 0 1.562 -1.035v-.005" />
            </svg>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            onClick={() => {
              onSelectTab('movie');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg uppercase font-bold tracking-wider text-[11px] whitespace-nowrap transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${
              currentTab === 'movie'
                ? 'bg-[#262626] nav-cycle-text'
                : 'bg-[#262626] text-white/65 hover:text-white hover:bg-[#333]'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Movies
          </button>

          <button
            onClick={() => {
              onSelectTab('tv');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg uppercase font-bold tracking-wider text-[11px] whitespace-nowrap transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${
              currentTab === 'tv'
                ? 'bg-[#262626] nav-cycle-text'
                : 'bg-[#262626] text-white/65 hover:text-white hover:bg-[#333]'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.36 3.5H5.64C4.67 3.5 3.75 3.88 3.07 4.55 2.38 5.22 2 6.13 2 7.08v7.16c0 .95.38 1.86 1.07 2.53.68.67 1.6.05 2.57.05h12.72c.96 0 1.88.38 2.57-.29.68-.67 1.07-1.58 1.07-2.53V7.08c0-.95-.38-1.86-1.07-2.53-.68-.67-1.6-1.05-2.57-1.05z" />
            </svg>
            Shows
          </button>

          <button
            onClick={() => {
              onSelectTab('anime');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg uppercase font-bold tracking-wider text-[11px] whitespace-nowrap transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${
              currentTab === 'anime'
                ? 'bg-[#262626] nav-cycle-text'
                : 'bg-[#262626] text-white/65 hover:text-white hover:bg-[#333]'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 256 256">
              <path d="M212,80a28,28,0,1,0,28,28A28,28,0,0,0,212,80Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,212,120ZM72,108a28,28,0,1,0-28,28A28,28,0,0,0,72,108ZM44,120a12,12,0,1,1,12-12A12,12,0,0,1,44,120ZM92,88A28,28,0,1,0,64,60,28,28,0,0,0,92,88Z" />
            </svg>
            Anime
          </button>

          <button
            onClick={() => onSelectTab('livetv')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg uppercase font-bold tracking-wider text-[11px] whitespace-nowrap transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${
              currentTab === 'livetv'
                ? 'bg-[#262626] nav-cycle-text'
                : 'bg-[#262626] text-white/65 hover:text-white hover:bg-[#333]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
            Live
          </button>
        </nav>

        {/* Search & Filter Box */}
        <div ref={searchBoxRef} className="relative flex items-center w-full md:w-auto justify-center md:justify-end">
          <div className="relative flex items-center w-full sm:w-[280px] focus-within:sm:w-[340px] transition-all duration-300">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions && searchQuery.trim()) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search movies, shows, anime..."
              className="w-full h-10 pl-4 pr-[110px] rounded-full border-1.5 border-white bg-gradient-to-r from-transparent to-[#222] focus:bg-white text-white focus:text-[#333] text-xs outline-none transition-all placeholder:text-white/70 focus:placeholder:text-gray-400"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {/* Search button */}
              <button
                onClick={() => {
                  setShowSuggestions(false);
                  onSearch(searchQuery);
                }}
                title="Search"
                className="w-7 h-7 flex items-center justify-center rounded-full text-red-500 hover:bg-red-500/15 transition-colors"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              {/* Voice search button */}
              <button
                onClick={startVoiceSearch}
                title="Voice Search"
                className={`w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors ${
                  isListening ? 'voice-listening' : ''
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>

              {/* Advanced filter toggle button */}
              <button
                onClick={onToggleAdvFilter}
                title="Advanced Filter"
                className={`w-7 h-7 flex items-center justify-center rounded-full text-white/80 transition-colors ${
                  isAdvFilterOpen ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="11" y1="18" x2="13" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Suggestions Popup */}
          {showSuggestions && suggestions && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[380px] max-w-[92vw] bg-[#111827] border border-[#1e293b] rounded-xl shadow-2xl z-[10000] max-h-[440px] overflow-y-auto">
              {suggestions.people.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-black/30">
                    People
                  </div>
                  {suggestions.people.map((p, idx) => {
                    const isSelected = selectedIndex === idx;
                    const photo = p.profile_path ? `https://image.tmdb.org/t/p/w92${p.profile_path}` : '';
                    return (
                      <div
                        key={p.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setShowSuggestions(false);
                          setSearchQuery('');
                          onSelectPerson(p.id);
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer border-b border-white/5 transition-colors ${
                          isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        {photo ? (
                          <img
                            src={photo}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-red-500/30"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-red-500/30">
                            <svg className="w-5 h-5 text-gray-400 stroke-current fill-none" viewBox="0 0 24 24">
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {p.known_for_department || 'Person'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {suggestions.media.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-black/30">
                    Movies &amp; Shows
                  </div>
                  {suggestions.media.map((m, idx) => {
                    const realIdx = suggestions.people.length + idx;
                    const isSelected = selectedIndex === realIdx;
                    const ct = m.media_type === 'tv' ? 'tv' : 'movie';
                    const poster = m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : '';
                    const title = m.title || m.name || 'Untitled';
                    const yr = (m.release_date || m.first_air_date || '').slice(0, 4);

                    return (
                      <div
                        key={m.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setShowSuggestions(false);
                          setSearchQuery('');
                          onSelectMedia(m);
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer border-b border-white/5 transition-colors ${
                          isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        {poster ? (
                          <img
                            src={poster}
                            alt=""
                            className="w-9 h-[50px] rounded object-cover shrink-0 bg-slate-800"
                          />
                        ) : (
                          <div className="w-9 h-[50px] rounded bg-slate-800 flex items-center justify-center shrink-0 text-[10px] text-gray-400">
                            No Img
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{title}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase text-white"
                              style={{ background: typeBg(ct) }}
                            >
                              {ct === 'tv' ? 'TV' : 'MOVIE'}
                            </span>
                            {yr && <span>{yr}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
