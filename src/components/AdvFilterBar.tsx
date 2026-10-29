import React, { useState, useEffect, useRef } from 'react';
import { ALL_LANGUAGES, MOVIE_GENRES, TV_GENRES } from '../config';
import { FilterParams } from '../types';

interface AdvFilterBarProps {
  isOpen: boolean;
  onDiscover: (params: FilterParams) => void;
}

export const AdvFilterBar: React.FC<AdvFilterBarProps> = ({ isOpen, onDiscover }) => {
  const [type, setType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [language, setLanguage] = useState('');
  const [langSearch, setLangSearch] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('popularity.desc');
  const [year, setYear] = useState('');

  const langRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const genres = type === 'tv' || type === 'anime' ? TV_GENRES : MOVIE_GENRES;

  const filteredLanguages = ALL_LANGUAGES.filter((l) =>
    l.l.toLowerCase().includes(langSearch.toLowerCase())
  );

  const selectedLangObj = ALL_LANGUAGES.find((l) => l.v === language);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onDiscover({
      type,
      language,
      genre,
      sort,
      year: year ? year.trim() : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="sticky top-[127px] z-[198] bg-gradient-to-r from-[#1a1a1a] via-[#2a0000] to-[#1a1a1a] py-2.5 px-4 md:px-6 border-b border-[#262626]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Type Select */}
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as 'movie' | 'tv' | 'anime';
              setType(newType);
              setGenre('');
            }}
            className="h-[34px] bg-[#1e1e1e] text-white border border-[#444] rounded-md px-2.5 text-xs outline-none cursor-pointer"
          >
            <option value="movie">Movie</option>
            <option value="tv">TV Show</option>
            <option value="anime">Anime</option>
          </select>

          {/* Searchable Language Dropdown */}
          <div ref={langRef} className="relative">
            <input
              type="text"
              autoComplete="off"
              value={isLangOpen ? langSearch : selectedLangObj ? selectedLangObj.l : ''}
              placeholder={selectedLangObj ? selectedLangObj.l : 'Any Language'}
              onFocus={() => {
                setLangSearch('');
                setIsLangOpen(true);
              }}
              onChange={(e) => setLangSearch(e.target.value)}
              className="w-full h-[34px] bg-[#1e1e1e] text-white border border-[#444] rounded-md px-2.5 text-xs outline-none cursor-pointer placeholder:text-gray-400"
            />

            {isLangOpen && (
              <div className="absolute top-[38px] left-0 right-0 bg-[#1a1a2a] border border-[#444] rounded-md z-[9999] max-h-[220px] overflow-y-auto shadow-2xl">
                <div
                  onClick={() => {
                    setLanguage('');
                    setLangSearch('');
                    setIsLangOpen(false);
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#2a2a3a] transition-colors ${
                    !language ? 'bg-red-600/20 text-red-300 font-semibold' : 'text-gray-300'
                  }`}
                >
                  Any Language
                </div>
                {filteredLanguages.map((l) => (
                  <div
                    key={l.v}
                    onClick={() => {
                      setLanguage(l.v);
                      setLangSearch('');
                      setIsLangOpen(false);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#2a2a3a] transition-colors ${
                      language === l.v ? 'bg-red-600/20 text-red-300 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    {l.l}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Genre Select */}
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="h-[34px] bg-[#1e1e1e] text-white border border-[#444] rounded-md px-2.5 text-xs outline-none cursor-pointer"
          >
            <option value="">Any Genre</option>
            {genres.map((g) => (
              <option key={g.v} value={g.v}>
                {g.l}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Sort Select */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-[34px] bg-[#1e1e1e] text-white border border-[#444] rounded-md px-2.5 text-xs outline-none cursor-pointer"
          >
            <option value="popularity.desc">Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="release_date.desc">Newest</option>
            <option value="release_date.asc">Oldest</option>
          </select>

          {/* Year Input */}
          <input
            type="number"
            min="1900"
            max="2035"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year e.g. 2024"
            className="h-[34px] bg-[#1e1e1e] text-white border border-[#444] rounded-md px-2.5 text-xs outline-none placeholder:text-gray-500"
          />

          {/* Discover Button */}
          <button
            type="submit"
            className="h-[34px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-md text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            Discover
          </button>
        </div>
      </form>
    </div>
  );
};
