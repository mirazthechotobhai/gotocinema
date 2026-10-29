import React, { useState, useEffect, useCallback } from 'react';
import { ContentType, MediaItem, AdminSettings, FilterParams } from './types';
import {
  fetchMediaPage,
  fetchTrendingAll,
  searchMulti,
  tmdb,
  fetchAniListById
} from './services/api';
import {
  auth,
  loadAdminSettings,
  subscribeDragSetting
} from './services/firebase';
import { ADMIN_CONFIG } from './config';

import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { AdvFilterBar } from './components/AdvFilterBar';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { MediaGrid } from './components/MediaGrid';
import { DetailModal } from './components/DetailModal';
import { PersonModal } from './components/PersonModal';
import { LiveTvSection } from './components/LiveTvSection';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { AurlModal } from './components/AurlModal';
import { FloatingButtons } from './components/FloatingButtons';

export const App: React.FC = () => {
  // Tabs & Navigation
  const [currentTab, setCurrentTab] = useState<ContentType>(() => {
    const saved = localStorage.getItem('pm_tab');
    if (saved === 'tv' || saved === 'anime' || saved === 'livetv') return saved;
    return 'movie';
  });

  // Media & Cache
  const [trendingItems, setTrendingItems] = useState<MediaItem[]>([]);
  const [cache, setCache] = useState<Record<string, { items: MediaItem[]; lastPage: number }>>({});
  const [gridItems, setGridItems] = useState<MediaItem[]>([]);
  const [peopleResults, setPeopleResults] = useState<any[]>([]);
  const [gridTitle, setGridTitle] = useState('Movies');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Discover & Filter
  const [isAdvFilterOpen, setIsAdvFilterOpen] = useState(false);
  const [activeDiscover, setActiveDiscover] = useState<{
    endpoint: string;
    params: Record<string, any>;
    contentType: 'movie' | 'tv' | 'anime';
    page: number;
  } | null>(null);

  // Modals & Selected Media
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [aurlType, setAurlType] = useState<'player' | 'download' | null>(null);
  const [isDetailTransitioning, setIsDetailTransitioning] = useState(false);

  // Admin & User Settings
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    iptv: 'https://iptv-org.github.io/iptv/index.m3u',
    fifa: '#',
    movies: 'https://kwvdnm.movielinkbd.li/',
    moviePlayers: [],
    tvPlayers: [],
    animePlayers: [],
    ltOrder: ['fifa', 'livetv', 'movies'],
  });

  // Initial setup: Firebase auth listener, admin settings, drag setting
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      const adminEmails = (ADMIN_CONFIG.adminEmails || []).map((e: string) =>
        String(e).trim().toLowerCase()
      );
      const userEmail = String(user?.email || '').trim().toLowerCase();
      setIsAdmin(!!(user && adminEmails.includes(userEmail)));
    });

    loadAdminSettings().then(setAdminSettings);

    const unsubDrag = subscribeDragSetting(() => {});

    // Fetch trending for topbar & featured carousel
    fetchTrendingAll().then(setTrendingItems);

    return () => {
      unsubAuth();
      unsubDrag();
    };
  }, []);

  // Deeplink hash support (#/type/slug/id)
  useEffect(() => {
    const handleHash = async () => {
      const hash = window.location.hash;
      if (!hash || !hash.startsWith('#/')) return;
      const parts = hash.slice(2).split('/');
      if (parts.length < 3) return;
      const type = parts[0] as 'movie' | 'tv' | 'anime';
      const id = parseInt(parts[parts.length - 1]);
      if (!id || (type !== 'movie' && type !== 'tv' && type !== 'anime')) return;

      try {
        if (type === 'anime') {
          const item = await fetchAniListById(id);
          if (item) setSelectedMedia(item);
        } else {
          const d = await tmdb(`/${type}/${id}`);
          if (d && d.id) {
            setSelectedMedia({ ...d, contentType: type });
          }
        }
      } catch (err) {
        console.warn('Deeplink load failed:', err);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Load items for current active tab
  const loadTabItems = useCallback(
    async (type: 'movie' | 'tv' | 'anime', reset = false) => {
      if (reset) {
        setActiveDiscover(null);
        setPeopleResults([]);
        const titles = { movie: 'Movies', tv: 'TV Shows', anime: 'Anime' };
        setGridTitle(titles[type] || 'Movies');
      }

      const cached = cache[type];
      if (!reset && cached && cached.items.length >= 20) {
        setGridItems(cached.items);
        setCurrentPage(cached.lastPage);
        return;
      }

      setIsLoading(true);
      try {
        const [p1, p2, p3] = await Promise.all([
          fetchMediaPage(type, 1),
          fetchMediaPage(type, 2),
          fetchMediaPage(type, 3),
        ]);
        const combined = [...p1, ...p2, ...p3];
        const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());

        setCache((prev) => ({
          ...prev,
          [type]: { items: unique, lastPage: 3 },
        }));
        setGridItems(unique);
        setCurrentPage(3);
        setHasMore(true);
      } catch (err) {
        console.warn('Load tab items error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [cache]
  );

  // Tab change handler
  const handleSelectTab = (tab: ContentType) => {
    setCurrentTab(tab);
    if (tab !== 'livetv') {
      localStorage.setItem('pm_tab', tab);
      loadTabItems(tab, true);
    }
  };

  // Initial load
  useEffect(() => {
    if (currentTab !== 'livetv') {
      loadTabItems(currentTab, true);
    }
  }, [currentTab]);

  // Infinite scroll loader
  const handleLoadMore = async () => {
    if (isLoading) return;

    if (activeDiscover) {
      setIsLoading(true);
      const nextPage = activeDiscover.page + 1;
      try {
        const res = await tmdb(activeDiscover.endpoint, {
          ...activeDiscover.params,
          page: nextPage,
        });
        const newResults = (res.results || []).map((r: any) => ({
          ...r,
          contentType: activeDiscover.contentType,
        }));
        if (newResults.length) {
          const merged = Array.from(
            new Map([...gridItems, ...newResults].map((i) => [i.id, i])).values()
          );
          setGridItems(merged);
          setActiveDiscover({ ...activeDiscover, page: nextPage });
        } else {
          setHasMore(false);
        }
      } catch {
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (currentTab === 'livetv') return;

    setIsLoading(true);
    const nextPage = currentPage + 1;
    try {
      const more = await fetchMediaPage(currentTab, nextPage);
      if (more.length) {
        const merged = Array.from(
          new Map([...gridItems, ...more].map((i) => [i.id, i])).values()
        );
        setGridItems(merged);
        setCurrentPage(nextPage);
        setCache((prev) => ({
          ...prev,
          [currentTab]: { items: merged, lastPage: nextPage },
        }));
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    setGridTitle(`Results: "${q}"`);
    setActiveDiscover(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const { people, media } = await searchMulti(q);
      setPeopleResults(people);
      setGridItems(media);
      setHasMore(false);
    } catch (err) {
      console.warn('Search error:', err);
      setGridItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Discover / Advanced Filter handler
  const handleDiscover = async (params: FilterParams) => {
    setIsLoading(true);
    setIsAdvFilterOpen(false);
    setPeopleResults([]);

    const queryParams: Record<string, any> = { sort_by: params.sort || 'popularity.desc' };
    if (params.genre) queryParams.with_genres = params.genre;
    if (params.language) queryParams.with_original_language = params.language;

    if (params.year) {
      if (params.type === 'movie') queryParams.primary_release_year = params.year;
      else queryParams.first_air_date_year = params.year;
    }

    if (params.type === 'anime') {
      queryParams.with_genres = params.genre || '16';
      queryParams.with_origin_country = 'JP';
      delete queryParams.with_original_language;
    }

    const endpoint = params.type === 'movie' ? '/discover/movie' : '/discover/tv';
    const ct = params.type;

    setActiveDiscover({
      endpoint,
      params: queryParams,
      contentType: ct,
      page: 1,
    });

    const labelParts: string[] = [];
    if (params.year) labelParts.push(params.year);
    const typeNames = { movie: 'Movies', tv: 'TV Shows', anime: 'Anime' };
    setGridTitle(`${labelParts.length ? `${labelParts.join(' · ')} ` : ''}${typeNames[params.type] || 'Results'}`);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const data = await tmdb(endpoint, { ...queryParams, page: 1 });
      const results = (data.results || []).map((r: any) => ({ ...r, contentType: ct }));
      setGridItems(results);
      setHasMore(results.length >= 20);
    } catch (err) {
      console.warn('Discover error:', err);
      setGridItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cinematic detail transition
  const openDetailWithTransition = (item: MediaItem) => {
    setIsDetailTransitioning(true);
    setTimeout(() => {
      setSelectedMedia(item);
      setIsDetailTransitioning(false);
    }, 180);
  };

  return (
    <div className="min-h-screen bg-[#262626] text-white flex flex-col font-['Poppins',sans-serif]">
      {/* Top Bar */}
      <TopBar trendingItems={trendingItems} />

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onSearch={handleSearch}
        onSelectMedia={openDetailWithTransition}
        onSelectPerson={setSelectedPersonId}
        isAdvFilterOpen={isAdvFilterOpen}
        onToggleAdvFilter={() => setIsAdvFilterOpen(!isAdvFilterOpen)}
      />

      {/* Advanced Filter Bar */}
      <AdvFilterBar isOpen={isAdvFilterOpen} onDiscover={handleDiscover} />

      {/* Main Body */}
      {currentTab === 'livetv' ? (
        <LiveTvSection adminSettings={adminSettings} />
      ) : (
        <main className="flex-1 pb-16">
          {/* Top of the Week horizontal carousel */}
          <FeaturedCarousel
            items={trendingItems}
            onSelectItem={openDetailWithTransition}
          />

          {/* Media Grid */}
          <MediaGrid
            title={gridTitle}
            items={gridItems}
            people={peopleResults}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onSelectItem={openDetailWithTransition}
            onSelectPerson={setSelectedPersonId}
          />
        </main>
      )}

      {/* Floating Buttons: Account/Admin & Scroll to Top */}
      <FloatingButtons
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Detail Modal */}
      {selectedMedia && (
        <DetailModal
          item={selectedMedia}
          adminSettings={adminSettings}
          isAdmin={isAdmin}
          onClose={() => setSelectedMedia(null)}
          onSelectPerson={setSelectedPersonId}
          onOpenAurl={(type) => setAurlType(type)}
        />
      )}

      {/* Person Modal */}
      {selectedPersonId && (
        <PersonModal
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
          onSelectMedia={openDetailWithTransition}
        />
      )}

      {/* Auth / Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        isAdmin={isAdmin}
        onClose={() => setIsAuthOpen(false)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        settings={adminSettings}
        onClose={() => setIsAdminOpen(false)}
        onUpdateSettings={setAdminSettings}
      />

      {/* Aurl Modal */}
      {aurlType && selectedMedia && (
        <AurlModal
          type={aurlType}
          item={selectedMedia}
          onClose={() => setAurlType(null)}
          onSuccess={() => {}}
        />
      )}

      {/* Cinematic Transition Overlay */}
      {isDetailTransitioning && (
        <div className="fixed inset-0 z-[9998] bg-black/85 backdrop-blur-xl flex items-center justify-center transition-all">
          <div className="w-12 h-12 rounded-full border-3 border-white/20 border-t-red-600 animate-spin" />
        </div>
      )}
    </div>
  );
};
