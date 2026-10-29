import React, { useState } from 'react';
import { AdminSettings, ServerPlayer } from '../types';
import { saveAdminSettings, toggleGlobalDrag, auth } from '../services/firebase';
import { ADMIN_CONFIG } from '../config';

interface AdminModalProps {
  isOpen: boolean;
  settings: AdminSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: AdminSettings) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  const [iptvUrl, setIptvUrl] = useState(settings.iptv);
  const [fifaUrl, setFifaUrl] = useState(settings.fifa);
  const [moviesUrl, setMoviesUrl] = useState(settings.movies);

  const [moviePlayers, setMoviePlayers] = useState<ServerPlayer[]>([...settings.moviePlayers]);
  const [tvPlayers, setTvPlayers] = useState<ServerPlayer[]>([...settings.tvPlayers]);
  const [animePlayers, setAnimePlayers] = useState<ServerPlayer[]>([...settings.animePlayers]);

  const [newMovieUrl, setNewMovieUrl] = useState('');
  const [newMovieLabel, setNewMovieLabel] = useState('');
  const [showAddMovie, setShowAddMovie] = useState(false);

  const [newTvUrl, setNewTvUrl] = useState('');
  const [newTvLabel, setNewTvLabel] = useState('');
  const [showAddTv, setShowAddTv] = useState(false);

  const [newAnimeUrl, setNewAnimeUrl] = useState('');
  const [newAnimeLabel, setNewAnimeLabel] = useState('');
  const [showAddAnime, setShowAddAnime] = useState(false);

  const [isDragGloballyOn, setIsDragGloballyOn] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleSaveLiveTvUrls = async () => {
    const updated = {
      ...settings,
      iptv: iptvUrl.trim(),
      fifa: fifaUrl.trim(),
      movies: moviesUrl.trim(),
    };
    await saveAdminSettings(updated);
    onUpdateSettings(updated);
    showToast('✓ Live TV URLs saved!');
  };

  const handleSavePlayers = async (
    type: 'movie' | 'tv' | 'anime',
    newList: ServerPlayer[]
  ) => {
    const updated = {
      ...settings,
      [type === 'movie' ? 'moviePlayers' : type === 'tv' ? 'tvPlayers' : 'animePlayers']: newList,
    };
    await saveAdminSettings(updated);
    onUpdateSettings(updated);
    showToast(`✓ ${type.toUpperCase()} players saved!`);
  };

  const handleAddPlayer = async (type: 'movie' | 'tv' | 'anime') => {
    if (type === 'movie') {
      if (!newMovieUrl) return;
      const list = [
        ...moviePlayers,
        { label: newMovieLabel || `Player ${moviePlayers.length + 1}`, url: newMovieUrl },
      ];
      setMoviePlayers(list);
      setNewMovieUrl('');
      setNewMovieLabel('');
      setShowAddMovie(false);
      await handleSavePlayers('movie', list);
    } else if (type === 'tv') {
      if (!newTvUrl) return;
      const list = [
        ...tvPlayers,
        { label: newTvLabel || `Player ${tvPlayers.length + 1}`, url: newTvUrl },
      ];
      setTvPlayers(list);
      setNewTvUrl('');
      setNewTvLabel('');
      setShowAddTv(false);
      await handleSavePlayers('tv', list);
    } else {
      if (!newAnimeUrl) return;
      const list = [
        ...animePlayers,
        { label: newAnimeLabel || `Player ${animePlayers.length + 1}`, url: newAnimeUrl },
      ];
      setAnimePlayers(list);
      setNewAnimeUrl('');
      setNewAnimeLabel('');
      setShowAddAnime(false);
      await handleSavePlayers('anime', list);
    }
  };

  const handleDeletePlayer = async (type: 'movie' | 'tv' | 'anime', index: number) => {
    if (type === 'movie') {
      const list = moviePlayers.filter((_, i) => i !== index);
      setMoviePlayers(list);
      await handleSavePlayers('movie', list);
    } else if (type === 'tv') {
      const list = tvPlayers.filter((_, i) => i !== index);
      setTvPlayers(list);
      await handleSavePlayers('tv', list);
    } else {
      const list = animePlayers.filter((_, i) => i !== index);
      setAnimePlayers(list);
      await handleSavePlayers('anime', list);
    }
  };

  const handleToggleGlobalDrag = async () => {
    const next = !isDragGloballyOn;
    setIsDragGloballyOn(next);
    await toggleGlobalDrag(next);
    showToast(`Global drag: ${next ? 'ON' : 'OFF'}`);
  };

  return (
    <div className="fixed inset-0 z-[12000] bg-black/85 backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-hidden">
      <div className="w-full max-w-3xl h-full md:h-[90vh] bg-[#0b0f1c] border border-white/10 md:rounded-2xl flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-transparent border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              🛡️
            </div>
            <div>
              <div className="text-base font-extrabold text-[#f1f5f9]">Admin Control Panel</div>
              <div className="text-[11px] text-gray-400">
                Manage live streams, custom players, and settings
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Admin Profile Readonly Card */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
            <img
              src={`/${ADMIN_CONFIG.profile?.imageUrl || 'logo-icon.png'}`}
              alt=""
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/40"
            />
            <div>
              <div className="text-sm font-bold text-white">
                {ADMIN_CONFIG.profile?.name || 'Administrator'}
              </div>
              <div className="text-xs text-gray-400">{ADMIN_CONFIG.profile?.about}</div>
              <div className="text-[10px] text-gray-500 mt-1">
                Admin profile is controlled by <code>admin-config.js</code>.
              </div>
            </div>
          </div>

          {/* Section: Live TV URLs */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
              📡 Live TV Streams
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                  IPTV M3U Playlist URL
                </label>
                <input
                  type="text"
                  value={iptvUrl}
                  onChange={(e) => setIptvUrl(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                  FIFA / Sports Portal URL (# = default internal player)
                </label>
                <input
                  type="text"
                  value={fifaUrl}
                  onChange={(e) => setFifaUrl(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                  External Movies Portal URL
                </label>
                <input
                  type="text"
                  value={moviesUrl}
                  onChange={(e) => setMoviesUrl(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <button
                onClick={handleSaveLiveTvUrls}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Save Live TV URLs
              </button>
            </div>
          </div>

          {/* Section: Movie Players */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                🎬 Movie Player Servers
              </div>
              <button
                onClick={() => setShowAddMovie(!showAddMovie)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                {showAddMovie ? 'Cancel' : '+ Add Server'}
              </button>
            </div>

            {showAddMovie && (
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                <input
                  type="text"
                  placeholder="Player URL (use {id} for movie ID)"
                  value={newMovieUrl}
                  onChange={(e) => setNewMovieUrl(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label e.g. Server 6"
                    value={newMovieLabel}
                    onChange={(e) => setNewMovieLabel(e.target.value)}
                    className="w-32 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                  <button
                    onClick={() => handleAddPlayer('movie')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    Confirm Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {moviePlayers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.025] border border-white/5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={p.label}
                      onChange={(e) => {
                        const copy = [...moviePlayers];
                        copy[idx].label = e.target.value;
                        setMoviePlayers(copy);
                      }}
                      className="w-28 bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => handleSavePlayers('movie', moviePlayers)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDeletePlayer('movie', idx)}
                      className="px-2 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded text-xs font-bold ml-auto"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={p.url}
                    onChange={(e) => {
                      const copy = [...moviePlayers];
                      copy[idx].url = e.target.value;
                      setMoviePlayers(copy);
                    }}
                    className="w-full bg-white/[0.04] border border-white/10 rounded px-2.5 py-1.5 text-xs text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: TV Players */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                📺 TV Show Player Servers
              </div>
              <button
                onClick={() => setShowAddTv(!showAddTv)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                {showAddTv ? 'Cancel' : '+ Add Server'}
              </button>
            </div>

            {showAddTv && (
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                <input
                  type="text"
                  placeholder="Player URL (use {id}, {s}, {e})"
                  value={newTvUrl}
                  onChange={(e) => setNewTvUrl(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={newTvLabel}
                    onChange={(e) => setNewTvLabel(e.target.value)}
                    className="w-32 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                  <button
                    onClick={() => handleAddPlayer('tv')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    Confirm Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {tvPlayers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.025] border border-white/5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={p.label}
                      onChange={(e) => {
                        const copy = [...tvPlayers];
                        copy[idx].label = e.target.value;
                        setTvPlayers(copy);
                      }}
                      className="w-28 bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => handleSavePlayers('tv', tvPlayers)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDeletePlayer('tv', idx)}
                      className="px-2 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded text-xs font-bold ml-auto"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={p.url}
                    onChange={(e) => {
                      const copy = [...tvPlayers];
                      copy[idx].url = e.target.value;
                      setTvPlayers(copy);
                    }}
                    className="w-full bg-white/[0.04] border border-white/10 rounded px-2.5 py-1.5 text-xs text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Anime Players */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                🎌 Anime Player Servers
              </div>
              <button
                onClick={() => setShowAddAnime(!showAddAnime)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                {showAddAnime ? 'Cancel' : '+ Add Server'}
              </button>
            </div>

            {showAddAnime && (
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                <input
                  type="text"
                  placeholder="Player URL (use {id}, {e})"
                  value={newAnimeUrl}
                  onChange={(e) => setNewAnimeUrl(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={newAnimeLabel}
                    onChange={(e) => setNewAnimeLabel(e.target.value)}
                    className="w-32 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                  <button
                    onClick={() => handleAddPlayer('anime')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    Confirm Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {animePlayers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.025] border border-white/5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={p.label}
                      onChange={(e) => {
                        const copy = [...animePlayers];
                        copy[idx].label = e.target.value;
                        setAnimePlayers(copy);
                      }}
                      className="w-28 bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => handleSavePlayers('anime', animePlayers)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDeletePlayer('anime', idx)}
                      className="px-2 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded text-xs font-bold ml-auto"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={p.url}
                    onChange={(e) => {
                      const copy = [...animePlayers];
                      copy[idx].url = e.target.value;
                      setAnimePlayers(copy);
                    }}
                    className="w-full bg-white/[0.04] border border-white/10 rounded px-2.5 py-1.5 text-xs text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Global Drag & Drop setting */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <div className="text-xs font-bold text-white">Global Nav Buttons Drag &amp; Drop</div>
              <div className="text-[10px] text-gray-400">
                Allow all site visitors to drag and reposition navigation buttons
              </div>
            </div>
            <button
              onClick={handleToggleGlobalDrag}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                isDragGloballyOn ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {isDragGloballyOn ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Sign Out */}
          <button
            onClick={async () => {
              await auth.signOut();
              onClose();
            }}
            className="w-full py-2.5 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            Sign Out as Administrator
          </button>
        </div>

        {/* Toast status */}
        {toastMsg && (
          <div className="px-6 py-2 bg-indigo-600 text-center text-xs font-bold text-white animate-in slide-in-from-bottom">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};
