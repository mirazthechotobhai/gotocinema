export type ContentType = 'movie' | 'tv' | 'anime' | 'livetv';

export interface MediaItem {
  id: number;
  idMal?: number | null;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  contentType: 'movie' | 'tv' | 'anime';
  media_type?: string;
  _tmdbId?: number;
  _anilistCast?: CastMember[];
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  _aniprofile?: string | null;
}

export interface PersonDetails {
  id: number;
  name: string;
  profile_path?: string | null;
  known_for_department?: string;
  biography?: string;
}

export interface SeasonInfo {
  season_number: number;
  episode_count: number;
}

export interface MediaDetail {
  id?: number;
  title?: string;
  name?: string;
  overview?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  runtime?: number;
  number_of_seasons?: number;
  genres?: { id?: number; name: string }[];
  seasons?: SeasonInfo[];
  external_ids?: { imdb_id?: string };
  imdb_id?: string;
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
  _anilistCast?: CastMember[];
}

export interface IPTVChannel {
  id: number;
  name: string;
  logo: string;
  group: string;
  country: string;
  tvgId: string;
  url: string;
}

export interface ServerPlayer {
  label: string;
  url: string;
}

export interface AdminSettings {
  iptv: string;
  fifa: string;
  movies: string;
  moviePlayers: ServerPlayer[];
  tvPlayers: ServerPlayer[];
  animePlayers: ServerPlayer[];
  ltOrder: string[];
}

export interface UserProfile {
  uid?: string;
  displayName?: string;
  photoUrl?: string;
  bio?: string;
}

export interface FilterParams {
  type: 'movie' | 'tv' | 'anime';
  language?: string;
  genre?: string;
  sort?: string;
  year?: string;
}
