import React, { useState, useEffect } from 'react';
import { MediaItem, MediaDetail, CastMember, AdminSettings } from '../types';
import {
  fetchMediaDetail,
  fetchCast,
  imgUrl,
  getTitle,
  getYear,
  avatarUrl
} from '../services/api';
import { loadMediaUrls } from '../services/firebase';

interface DetailModalProps {
  item: MediaItem | null;
  adminSettings: AdminSettings;
  isAdmin: boolean;
  onClose: () => void;
  onSelectPerson: (id: number) => void;
  onOpenAurl: (type: 'player' | 'download') => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  adminSettings,
  isAdmin,
  onClose,
  onSelectPerson,
  onOpenAurl,
}) => {
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeServer, setActiveServer] = useState<number | 'custom'>(0);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEp, setCurrentEp] = useState(1);
  const [totalEpsInSeason, setTotalEpsInSeason] = useState(1);
  const [customPlayerUrl, setCustomPlayerUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync hash URL for deeplinking
  useEffect(() => {
    if (!item) return;
    const slug = getTitle(item)
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim()
      .replace(/ +/g, '-')
      .substring(0, 60);
    window.history.replaceState(null, '', `#/${item.contentType}/${slug}/${item.id}`);

    return () => {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    };
  }, [item]);

  // Load details and cast
  useEffect(() => {
    if (!item) return;

    setIsPlaying(false);
    setIsTrailerPlaying(false);
    setActiveServer(item.contentType === 'tv' ? 1 : 0);
    setCurrentSeason(1);
    setCurrentEp(1);
    setIframeUrl('');

    // Fetch Firestore stored custom player & download links
    loadMediaUrls(item.contentType, item.id).then(({ dlUrl, plUrl }) => {
      setDownloadUrl(dlUrl);
      setCustomPlayerUrl(plUrl);
    });

    // Fetch TMDB or AniList details
    fetchMediaDetail(item)
      .then((d) => {
        setDetail(d);

        // Extract trailer
        const vids = d.videos?.results || [];
        const tr =
          vids.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
          vids.find((v) => v.site === 'YouTube');
        setTrailerKey(tr ? tr.key : null);

        // TV seasons
        if (d.seasons && d.seasons.length > 0) {
          const s1 = d.seasons.find((s) => s.season_number === 1) || d.seasons[0];
          setTotalEpsInSeason(s1.episode_count || 1);
        }

        // Anime cast
        if (item.contentType === 'anime' && d._anilistCast?.length) {
          setCast(d._anilistCast);
        } else {
          fetchCast(item)
            .then(setCast)
            .catch(() => setCast([]));
        }
      })
      .catch(() => setDetail(null));
  }, [item]);

  // Update total episodes when season changes
  useEffect(() => {
    if (detail?.seasons) {
      const match = detail.seasons.find((s) => s.season_number === currentSeason);
      setTotalEpsInSeason(match?.episode_count || 1);
    }
  }, [currentSeason, detail]);

  if (!item) return null;

  // Determine server list
  const isTv = item.contentType === 'tv';
  const isAnime = item.contentType === 'anime';
  const servers = isTv
    ? adminSettings.tvPlayers
    : isAnime
    ? adminSettings.animePlayers
    : adminSettings.moviePlayers;

  // Compute playback stream URL
  const computeStreamUrl = (srvIdx: number | 'custom', s: number, e: number): string => {
    if (srvIdx === 'custom') {
      return customPlayerUrl;
    }
    const idx = typeof srvIdx === 'number' ? srvIdx : 0;
    const player = servers[idx] || servers[0];
    if (!player) return '';

    let url = player.url;
    url = url.replace(/\{id\}/g, String(item.id));
    url = url.replace(/\{s\}/g, String(s));
    url = url.replace(/\{e\}/g, String(e));
    url = url.replace(/\{ep\}/g, String(e));
    return url;
  };

  const handleStartPlay = () => {
    const url = computeStreamUrl(activeServer, currentSeason, currentEp);
    setIframeUrl(url);
    setIsPlaying(true);
    setIsTrailerPlaying(false);
  };

  const handleSelectServer = (idx: number | 'custom') => {
    setActiveServer(idx);
    const url = computeStreamUrl(idx, currentSeason, currentEp);
    setIframeUrl(url);
    setIsPlaying(true);
    setIsTrailerPlaying(false);
  };

  const handlePlayTrailer = () => {
    if (!trailerKey) return;
    if (!isTrailerPlaying) {
      setIframeUrl(`https://www.youtube.com/embed/${trailerKey}?autoplay=1`);
      setIsPlaying(true);
      setIsTrailerPlaying(true);
    } else {
      setIsTrailerPlaying(false);
      handleStartPlay();
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const title = getTitle(item);
  const year = getYear(item);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
  const backdrop = detail?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`
    : item.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
    : imgUrl(item.poster_path, 'w1280');

  const genres = (detail?.genres || []).map((g) => g.name).join(', ');
  const runtime = detail?.runtime ? `${detail.runtime}m` : '';
  const seasonsCount = detail?.number_of_seasons;
  const imdbId = detail?.external_ids?.imdb_id || detail?.imdb_id;

  return (
    <div className="fixed inset-0 z-[9000] bg-[#0b0f1a] overflow-y-auto text-[#e2e8f0] flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-[#060a12] border-b border-[#1e293b]">
        <div className="flex-1 text-center font-semibold text-sm text-[#94a3b8] truncate px-4">
          {title}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {/* Video Player Section */}
      <div className="h-[55vh] sm:h-[60vh] w-full bg-[#060a12] border-b border-[#1e293b] flex flex-col relative shrink-0">
        {!isPlaying ? (
          <div
            onClick={handleStartPlay}
            className="flex-1 w-full bg-[#080d18] flex items-center justify-center text-center relative cursor-pointer overflow-hidden group"
          >
            {backdrop && (
              <img
                src={backdrop}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
              />
            )}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,0,0,0.4)]">
                <svg className="w-7 h-7 fill-red-500 ml-1" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="text-white text-base font-semibold mb-1">
                Click Watch Now to start streaming
              </div>
              <div className="text-gray-400 text-xs">{title}</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full h-full bg-black relative">
            <iframe
              src={iframeUrl}
              title="Player"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-none block"
            />
          </div>
        )}
      </div>

      {/* Episode Navigation Bar for TV & Anime */}
      {(isTv || isAnime) && isPlaying && (
        <div className="flex items-center justify-center gap-3 py-2 px-4 bg-[#060a12] border-b border-[#1e293b]">
          <button
            onClick={() => {
              if (currentEp > 1) {
                const prev = currentEp - 1;
                setCurrentEp(prev);
                setIframeUrl(computeStreamUrl(activeServer, currentSeason, prev));
              }
            }}
            disabled={currentEp <= 1}
            className="h-7 px-3 bg-[#1e293b] hover:bg-red-600 border border-[#334155] hover:border-red-600 text-gray-300 hover:text-white rounded text-xs font-semibold disabled:opacity-40 disabled:hover:bg-[#1e293b] transition-colors"
          >
            ◄ Prev Ep
          </button>
          <span className="text-xs font-semibold text-gray-400">
            {isTv ? `S${currentSeason} : ` : ''}Episode {currentEp}
          </span>
          <button
            onClick={() => {
              if (!totalEpsInSeason || currentEp < totalEpsInSeason) {
                const next = currentEp + 1;
                setCurrentEp(next);
                setIframeUrl(computeStreamUrl(activeServer, currentSeason, next));
              }
            }}
            className="h-7 px-3 bg-[#1e293b] hover:bg-red-600 border border-[#334155] hover:border-red-600 text-gray-300 hover:text-white rounded text-xs font-semibold transition-colors"
          >
            Next Ep ►
          </button>
        </div>
      )}

      {/* Player Sources Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 p-3 bg-[#080d18] border-b border-[#1e293b]">
        {servers.map((_, i) => (
          <button
            key={i}
            onClick={() => handleSelectServer(i)}
            title={`Player ${i + 1}`}
            className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
              activeServer === i
                ? 'bg-gradient-to-br from-orange-500 to-red-600 border-2 border-white/80 scale-110 shadow-[0_0_15px_rgba(242,98,7,0.6)] text-white'
                : 'bg-[#1a1e2e] text-white border border-white/25 hover:border-white/50 hover:scale-105'
            }`}
          >
            {i + 1}
          </button>
        ))}

        {/* Custom Player Source */}
        {(isAdmin || customPlayerUrl) && (
          <div className="relative inline-block">
            <button
              onClick={() => {
                if (customPlayerUrl) {
                  handleSelectServer('custom');
                } else if (isAdmin) {
                  onOpenAurl('player');
                }
              }}
              title={customPlayerUrl ? 'Custom Player' : 'Set Custom Player URL'}
              className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                activeServer === 'custom'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-400 scale-110 shadow-[0_0_15px_rgba(37,99,235,0.6)] text-white'
                  : 'bg-gradient-to-br from-[#1e3a5f] to-[#0f2240] text-white border border-blue-400/50 hover:scale-105'
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAurl('player');
                }}
                title="Edit Custom Player URL"
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 hover:bg-amber-500 text-black flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <svg className="w-2.5 h-2.5 fill-none stroke-current" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* TV Season & Episode Selectors */}
      {isTv && (
        <div className="flex items-center justify-center py-2.5 px-4 bg-[#080d18] border-b border-[#1e293b]">
          <div className="flex items-center gap-1.5 bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-1.5 shadow-inner">
            <span className="w-7 text-green-500 font-extrabold text-lg text-center">S</span>
            <span className="min-w-[24px] px-1 bg-[#1e293b] text-gray-400 rounded text-[11px] text-center">
              {detail?.seasons?.length || '—'}
            </span>
            <input
              type="number"
              min="1"
              max={detail?.seasons?.length || 99}
              value={currentSeason}
              onChange={(e) => setCurrentSeason(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 bg-[#1e293b] border border-[#334155] focus:border-red-500 text-white rounded text-center text-xs py-1 outline-none"
            />
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() =>
                  setCurrentSeason((s) => Math.min(s + 1, detail?.seasons?.length || 99))
                }
                className="w-4 h-3 bg-[#1e293b] hover:bg-[#334155] text-gray-300 rounded text-[8px] flex items-center justify-center"
              >
                ▲
              </button>
              <button
                onClick={() => setCurrentSeason((s) => Math.max(s - 1, 1))}
                className="w-4 h-3 bg-[#1e293b] hover:bg-[#334155] text-gray-300 rounded text-[8px] flex items-center justify-center"
              >
                ▼
              </button>
            </div>

            <div className="w-px h-6 bg-white/15 mx-2" />

            <span className="w-7 text-green-500 font-extrabold text-lg text-center">E</span>
            <span className="min-w-[24px] px-1 bg-[#1e293b] text-gray-400 rounded text-[11px] text-center">
              {totalEpsInSeason || '—'}
            </span>
            <input
              type="number"
              min="1"
              max={totalEpsInSeason || 999}
              value={currentEp}
              onChange={(e) => setCurrentEp(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 bg-[#1e293b] border border-[#334155] focus:border-red-500 text-white rounded text-center text-xs py-1 outline-none"
            />
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setCurrentEp((e) => Math.min(e + 1, totalEpsInSeason || 999))}
                className="w-4 h-3 bg-[#1e293b] hover:bg-[#334155] text-gray-300 rounded text-[8px] flex items-center justify-center"
              >
                ▲
              </button>
              <button
                onClick={() => setCurrentEp((e) => Math.max(e - 1, 1))}
                className="w-4 h-3 bg-[#1e293b] hover:bg-[#334155] text-gray-300 rounded text-[8px] flex items-center justify-center"
              >
                ▼
              </button>
            </div>

            <button
              onClick={handleStartPlay}
              className="h-7 px-3.5 ml-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              ► Play
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="p-5 md:p-7 flex flex-col md:flex-row gap-5 items-start">
        <div className="shrink-0 w-28 md:w-36 aspect-[2/3] rounded-lg overflow-hidden border-2 border-red-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <img
            src={imgUrl(item.poster_path, 'w342')}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-extrabold text-[#f1f5f9] mb-1.5">{title}</h1>

          <div className="flex items-center gap-2 flex-wrap text-xs md:text-sm text-gray-400 mb-3">
            {genres && <span className="text-red-300 font-semibold">{genres}</span>}
            {year && <span>• {year}</span>}
            {seasonsCount && (
              <span>
                • {seasonsCount} Season{seasonsCount > 1 ? 's' : ''}
              </span>
            )}
            {runtime && <span>• {runtime}</span>}
            {rating && <span className="text-[#fbbf24] font-bold">• ★ {rating}</span>}
            {imdbId && (
              <span>
                •{' '}
                <a
                  href={`https://www.imdb.com/title/${imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#fbbf24] font-bold hover:underline"
                >
                  IMDb
                </a>
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {trailerKey && (
              <button
                onClick={handlePlayTrailer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-700 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>
                  {isTrailerPlaying
                    ? item.contentType === 'movie'
                      ? 'Movie'
                      : item.contentType === 'tv'
                      ? 'TV Show'
                      : 'Anime'
                    : 'Trailer'}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                if (downloadUrl) window.open(downloadUrl, '_blank');
              }}
              disabled={!downloadUrl}
              title={downloadUrl ? 'Download file' : 'Download link not set'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>

            {isAdmin && (
              <button
                onClick={() => onOpenAurl('download')}
                title="Edit Download URL"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-400 text-xs font-semibold transition-colors"
              >
                <svg className="w-3 h-3 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                DL
              </button>
            )}

            <button
              onClick={handleShare}
              title={copied ? 'Link Copied!' : 'Share'}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors relative"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#1e293b] to-transparent mx-6 my-2" />

      {/* Plot Overview */}
      <div className="px-6 py-2 text-sm text-gray-300 leading-relaxed max-w-4xl">
        {detail?.overview || item.overview || 'No synopsis available.'}
      </div>

      {/* Cast Section */}
      {cast.length > 0 && (
        <div className="p-6">
          <h2 className="text-base font-bold text-white mb-3">Cast</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {cast.map((c) => {
              const photo = c._aniprofile
                ? c._aniprofile
                : c.profile_path
                ? avatarUrl(c.profile_path, 'w185')
                : '';
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (!c._aniprofile) {
                      onSelectPerson(c.id);
                    }
                  }}
                  className={`bg-[#111827] rounded-lg overflow-hidden border border-white/5 flex flex-col text-center transition-all ${
                    !c._aniprofile ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''
                  }`}
                >
                  <div className="w-full aspect-[2/3] bg-slate-800 overflow-hidden">
                    {photo ? (
                      <img src={photo} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg className="w-8 h-8 fill-none stroke-current" strokeWidth="1.5" viewBox="0 0 24 24">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-1.5">
                    <div className="text-[11px] font-bold text-gray-200 truncate">{c.name}</div>
                    <div className="text-[9px] text-red-300 truncate">{c.character}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
