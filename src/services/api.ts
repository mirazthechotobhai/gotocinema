import {
  TMDB_BASE_URL,
  TMDB_KEY,
  ANILIST_URL,
  ANILIST_DEFAULT_ID,
  IMG_BASE,
  PLACEHOLDER_POSTER,
  PLACEHOLDER_AVATAR
} from '../config';
import { MediaItem, MediaDetail, PersonDetails, ContentType } from '../types';

export function getTitle(item?: MediaItem | null): string {
  if (!item) return 'Unknown';
  return item.title || item.name || 'Unknown';
}

export function getYear(item?: MediaItem | null): string {
  if (!item) return '';
  const d = item.release_date || item.first_air_date || '';
  return d ? d.slice(0, 4) : '';
}

export function typeBg(t: ContentType | string): string {
  if (t === 'tv') return '#1d4ed8';
  if (t === 'anime') return '#7c3aed';
  return '#b91c1c';
}

export function typeLabel(t: ContentType | string): string {
  if (t === 'tv') return 'TV';
  if (t === 'anime') return 'ANIME';
  return 'MOVIE';
}

export function imgUrl(path?: string | null, size = 'w342'): string {
  if (!path) return PLACEHOLDER_POSTER;
  if (path.startsWith('http')) return path;
  return `${IMG_BASE}/${size}${path}`;
}

export function avatarUrl(path?: string | null, size = 'w185'): string {
  if (!path) return PLACEHOLDER_AVATAR;
  if (path.startsWith('http')) return path;
  return `${IMG_BASE}/${size}${path}`;
}

export async function tmdb(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

const ANILIST_QUERY = `
  query($page: Int, $perPage: Int, $sort: [MediaSort]) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage }
      media(type: ANIME, sort: $sort, isAdult: false) {
        id
        idMal
        title { romaji english }
        coverImage { large extraLarge }
        averageScore
        startDate { year month day }
        format
        description(asHtml: false)
        episodes
      }
    }
  }
`;

const ANILIST_ID_QUERY = `
  query($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title { romaji english }
      coverImage { large extraLarge }
      averageScore
      startDate { year month day }
      format
      description(asHtml: false)
      episodes
    }
  }
`;

function anilistToItem(m: any): MediaItem {
  const isMovie = m.format === 'MOVIE';
  const title = m.title?.english || m.title?.romaji || 'Unknown';
  const sd = m.startDate || {};
  const date = sd.year ? `${sd.year}-${String(sd.month || 1).padStart(2, '0')}-${String(sd.day || 1).padStart(2, '0')}` : '';
  const score = m.averageScore ? +(m.averageScore / 10).toFixed(1) : 0;
  const desc = (m.description || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, '');
  const poster = m.coverImage?.extraLarge || m.coverImage?.large || null;

  if (isMovie) {
    return {
      id: m.id,
      idMal: m.idMal || null,
      title,
      release_date: date,
      vote_average: score,
      poster_path: poster,
      overview: desc,
      contentType: 'movie',
    };
  }

  return {
    id: m.id,
    idMal: m.idMal || null,
    name: title,
    first_air_date: date,
    vote_average: score,
    poster_path: poster,
    overview: desc,
    contentType: 'anime',
  };
}

export async function fetchAniList(variables: Record<string, any>): Promise<MediaItem[]> {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: ANILIST_QUERY, variables }),
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const data = await res.json();
  const list = data?.data?.Page?.media || [];
  return list.map(anilistToItem);
}

export async function fetchAniListById(id: number): Promise<MediaItem | null> {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: ANILIST_ID_QUERY, variables: { id } }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const m = data?.data?.Media;
  return m ? anilistToItem(m) : null;
}

export async function fetchMediaPage(type: 'movie' | 'tv' | 'anime', page: number): Promise<MediaItem[]> {
  if (type === 'movie') {
    const data = await tmdb('/movie/popular', { page });
    return (data.results || []).map((r: any) => ({ ...r, contentType: 'movie' }));
  }
  if (type === 'tv') {
    const data = await tmdb('/tv/popular', { page });
    return (data.results || []).map((r: any) => ({ ...r, contentType: 'tv' }));
  }

  // Anime
  const sortMap: Record<number, string[]> = {
    1: ['TRENDING_DESC'],
    2: ['START_DATE_DESC'],
    3: ['POPULARITY_DESC'],
  };
  const alSort = sortMap[page] || ['POPULARITY_DESC'];
  const alPage = page > 3 ? page - 2 : 1;
  const items = await fetchAniList({ page: alPage, perPage: 30, sort: alSort });

  if (page === 1 && ANILIST_DEFAULT_ID) {
    try {
      const feat = await fetchAniListById(ANILIST_DEFAULT_ID);
      if (feat) {
        return [feat, ...items.filter(i => i.id !== feat.id)];
      }
    } catch (e) {
      // Ignore fallback
    }
  }
  return items;
}

export async function fetchTrendingAll(): Promise<MediaItem[]> {
  try {
    const data = await tmdb('/trending/all/day');
    return (data.results || []).map((r: any) => ({
      ...r,
      contentType: r.media_type === 'tv' ? 'tv' : 'movie',
    }));
  } catch (err) {
    console.warn('Trending fetch error:', err);
    return [];
  }
}

export async function searchMulti(query: string) {
  const data = await tmdb('/search/multi', { query, page: 1 });
  const results = data.results || [];
  const people = results.filter((r: any) => r.media_type === 'person');
  const media = results
    .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r: any) => ({ ...r, contentType: r.media_type }));
  return { people, media };
}

export async function fetchMediaDetail(item: MediaItem): Promise<MediaDetail> {
  const isAnimeMovie = item.contentType === 'anime' && !!(item.title && !item.name);
  if (item.contentType === 'anime' && !isAnimeMovie) {
    const query = `
      query($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english }
          coverImage { extraLarge large }
          episodes
          averageScore
          description(asHtml: false)
          startDate { year }
          genres
          studios { nodes { name } }
          trailer { id site }
          characters(role: MAIN, sort: ID, page: 1, perPage: 12) {
            edges {
              node {
                id
                name { full }
                image { large }
              }
              role
            }
          }
        }
      }
    `;
    const res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id: item.id } }),
    });
    const d = await res.json();
    const media = d?.data?.Media;
    if (media) {
      const tKey = media.trailer?.site === 'youtube' ? media.trailer.id : null;
      const epCount = media.episodes || 0;
      return {
        genres: (media.genres || []).map((g: string) => ({ name: g })),
        seasons: epCount ? [{ season_number: 1, episode_count: epCount }] : [],
        overview: (media.description || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ''),
        runtime: 24,
        videos: { results: tKey ? [{ key: tKey, site: 'YouTube', type: 'Trailer' }] : [] },
        _anilistCast: (media.characters?.edges || []).map((e: any) => ({
          id: e.node.id,
          name: e.node.name?.full || '',
          character: 'Main Character',
          _aniprofile: e.node.image?.large,
        })),
      };
    }
    return {};
  }

  if (item.contentType === 'movie' && item.idMal != null) {
    const qTitle = item.title || '';
    const sr = await tmdb('/search/movie', { query: qTitle, page: 1 }).catch(() => ({ results: [] }));
    const match = sr.results && sr.results[0];
    if (match) {
      item._tmdbId = match.id;
      return await tmdb(`/movie/${match.id}`, { append_to_response: 'external_ids,videos' });
    }
    return {};
  }

  const endpoint = item.contentType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
  return await tmdb(endpoint, { append_to_response: 'external_ids,videos' });
}

export async function fetchCast(item: MediaItem) {
  const credId = item._tmdbId || item.id;
  const endpoint = item.contentType === 'tv' ? `/tv/${credId}/credits` : `/movie/${credId}/credits`;
  const data = await tmdb(endpoint);
  return (data.cast || []).slice(0, 24);
}

export async function fetchPerson(id: number): Promise<{ details: PersonDetails; works: MediaItem[] }> {
  const [person, credits] = await Promise.all([
    tmdb(`/person/${id}`),
    tmdb(`/person/${id}/combined_credits`),
  ]);

  const works = (credits.cast || [])
    .filter((w: any) => (w.media_type === 'movie' || w.media_type === 'tv') && w.poster_path)
    .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
    .map((w: any) => ({
      ...w,
      contentType: w.media_type as 'movie' | 'tv',
    }));

  return {
    details: {
      id: person.id,
      name: person.name,
      profile_path: person.profile_path,
      known_for_department: person.known_for_department,
      biography: person.biography,
    },
    works,
  };
}
