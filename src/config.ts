// Global config bridge for GoToCinema
declare global {
  interface Window {
    GTC_API_CONFIG?: any;
    GTC_WEBSITE_CONFIG?: any;
    GTC_ADMIN_CONFIG?: any;
    GTC_SOCIAL_MEDIA_CONFIG?: any;
    GTC_AD_CONFIG?: any;
    GTC_WEBSITE_COLORS?: any;
    GTC_ADS?: any;
    atOptions?: any;
  }
}

export const API_CONFIG = window.GTC_API_CONFIG || {
  firebase: {
    apiKey: 'AIzaSyBcR8zJrTkstjda22JEdVTaJ3FROmREdLA',
    authDomain: 'cinemabazar-600b0.firebaseapp.com',
    projectId: 'cinemabazar-600b0',
    storageBucket: 'cinemabazar-600b0.firebasestorage.app',
    messagingSenderId: '62690080088',
    appId: '1:62690080088:web:f4e7042fb4ad8248cce12d',
  },
  tmdb: {
    apiKey: '9d0f10dd934f1c2a6e91954041550593',
    apiBaseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
  },
  anilist: {
    apiUrl: 'https://graphql.anilist.co',
    animeId: 47880,
  },
  imgbb: {
    apiKey: '9cf974acba9d5d5d715bf14db07d697a',
    uploadUrl: 'https://api.imgbb.com/1/upload',
  },
};

export const WEBSITE_CONFIG = window.GTC_WEBSITE_CONFIG || {
  siteName: 'GoToCinema',
  pageTitle: 'Go To Cinema - Watch Movies, TV Shows & Anime',
  logoText: 'GOTO CINEMA',
  logoImagePosition: 2,
  logoImageUrl: 'logo-icon.png',
  logoImageAlt: 'GoToCinema logo',
};

export const ADMIN_CONFIG = window.GTC_ADMIN_CONFIG || {
  adminEmails: ['rizviyankhan@gmail.com'],
  profile: {
    name: 'GoToCinema Admin',
    imageUrl: 'logo-icon.png',
    about: 'GoToCinema administrator',
  },
};

export const SOCIAL_CONFIG = window.GTC_SOCIAL_MEDIA_CONFIG || {
  facebook: 'https://www.facebook.com/rizviyankhan.2025',
  youtube: 'https://www.youtube.com/',
  telegram: 'https://web.telegram.org/',
  instagram: 'https://www.instagram.com/',
};

export const TMDB_KEY = API_CONFIG.tmdb?.apiKey || '9d0f10dd934f1c2a6e91954041550593';
export const TMDB_BASE_URL = API_CONFIG.tmdb?.apiBaseUrl || 'https://api.themoviedb.org/3';
export const ANILIST_URL = API_CONFIG.anilist?.apiUrl || 'https://graphql.anilist.co';
export const ANILIST_DEFAULT_ID = Number(API_CONFIG.anilist?.animeId || 47880);
export const IMG_BASE = API_CONFIG.tmdb?.imageBaseUrl || 'https://image.tmdb.org/t/p';

export const PLACEHOLDER_POSTER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect width="200" height="300" fill="%231a1a2e"/%3E%3Ctext x="100" y="155" text-anchor="middle" fill="%23666" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

export const PLACEHOLDER_AVATAR =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="185" height="278"%3E%3Crect width="185" height="278" fill="%231e293b"/%3E%3Ccircle cx="92" cy="90" r="38" fill="%23334155"/%3E%3Cellipse cx="92" cy="210" rx="60" ry="50" fill="%23334155"/%3E%3C/svg%3E';

export const DEFAULT_MOVIE_PLAYERS = [
  { label: 'Player 1', url: 'https://cinemaos.in/movie/watch/{id}' },
  { label: 'Player 2', url: 'https://cinemaos.tech/player/{id}' },
  { label: 'Player 3', url: 'https://peachify.top/embed/movie/{id}' },
  { label: 'Player 4', url: 'https://boredflix.cc/movie/{id}' },
  { label: 'Player 5', url: 'https://vidbinge.to/movie/{id}' },
];

export const DEFAULT_TV_PLAYERS = [
  { label: 'Player 1', url: 'https://cinemaos.in/tv/watch/{id}?s={s}&e={e}' },
  { label: 'Player 2', url: 'https://cinemaos.tech/player/{id}/{s}/{e}' },
  { label: 'Player 3', url: 'https://embed.streammafia.to/embed/tv/{id}/{s}/{e}' },
  { label: 'Player 4', url: 'https://vembed.click/play/{id}?s={s}&e={e}' },
  { label: 'Player 5', url: 'https://multiembed.mov/?video_id={id}&s={s}&e={e}' },
];

export const DEFAULT_ANIME_PLAYERS = [
  { label: 'Player 1', url: 'https://cinemaos.live/animeplayer/watch/{id}/{e}' },
];

export const ALL_LANGUAGES = [
  { v: 'af', l: 'Afrikaans' }, { v: 'sq', l: 'Albanian' }, { v: 'am', l: 'Amharic' }, { v: 'ar', l: 'Arabic' },
  { v: 'hy', l: 'Armenian' }, { v: 'az', l: 'Azerbaijani' }, { v: 'eu', l: 'Basque' }, { v: 'be', l: 'Belarusian' },
  { v: 'bn', l: 'Bengali' }, { v: 'bs', l: 'Bosnian' }, { v: 'bg', l: 'Bulgarian' }, { v: 'my', l: 'Burmese' },
  { v: 'ca', l: 'Catalan' }, { v: 'zh', l: 'Chinese' }, { v: 'hr', l: 'Croatian' }, { v: 'cs', l: 'Czech' },
  { v: 'da', l: 'Danish' }, { v: 'nl', l: 'Dutch' }, { v: 'en', l: 'English' }, { v: 'et', l: 'Estonian' },
  { v: 'fi', l: 'Finnish' }, { v: 'fr', l: 'French' }, { v: 'gl', l: 'Galician' }, { v: 'ka', l: 'Georgian' },
  { v: 'de', l: 'German' }, { v: 'el', l: 'Greek' }, { v: 'gu', l: 'Gujarati' }, { v: 'ha', l: 'Hausa' },
  { v: 'he', l: 'Hebrew' }, { v: 'hi', l: 'Hindi' }, { v: 'hu', l: 'Hungarian' }, { v: 'is', l: 'Icelandic' },
  { v: 'ig', l: 'Igbo' }, { v: 'id', l: 'Indonesian' }, { v: 'it', l: 'Italian' }, { v: 'ja', l: 'Japanese' },
  { v: 'kn', l: 'Kannada' }, { v: 'kk', l: 'Kazakh' }, { v: 'km', l: 'Khmer' }, { v: 'ko', l: 'Korean' },
  { v: 'ky', l: 'Kyrgyz' }, { v: 'lo', l: 'Lao' }, { v: 'lv', l: 'Latvian' }, { v: 'lt', l: 'Lithuanian' },
  { v: 'mk', l: 'Macedonian' }, { v: 'ms', l: 'Malay' }, { v: 'ml', l: 'Malayalam' }, { v: 'mr', l: 'Marathi' },
  { v: 'mn', l: 'Mongolian' }, { v: 'ne', l: 'Nepali' }, { v: 'no', l: 'Norwegian' }, { v: 'fa', l: 'Persian' },
  { v: 'pl', l: 'Polish' }, { v: 'pt', l: 'Portuguese' }, { v: 'pa', l: 'Punjabi' }, { v: 'ro', l: 'Romanian' },
  { v: 'ru', l: 'Russian' }, { v: 'sr', l: 'Serbian' }, { v: 'si', l: 'Sinhala' }, { v: 'sk', l: 'Slovak' },
  { v: 'sl', l: 'Slovenian' }, { v: 'so', l: 'Somali' }, { v: 'es', l: 'Spanish' }, { v: 'sw', l: 'Swahili' },
  { v: 'sv', l: 'Swedish' }, { v: 'tl', l: 'Tagalog' }, { v: 'tg', l: 'Tajik' }, { v: 'ta', l: 'Tamil' },
  { v: 'te', l: 'Telugu' }, { v: 'th', l: 'Thai' }, { v: 'tr', l: 'Turkish' }, { v: 'tk', l: 'Turkmen' },
  { v: 'uk', l: 'Ukrainian' }, { v: 'ur', l: 'Urdu' }, { v: 'uz', l: 'Uzbek' }, { v: 'vi', l: 'Vietnamese' },
  { v: 'cy', l: 'Welsh' }, { v: 'xh', l: 'Xhosa' }, { v: 'yo', l: 'Yoruba' }, { v: 'zu', l: 'Zulu' },
];

export const MOVIE_GENRES = [
  { v: '28', l: 'Action' }, { v: '12', l: 'Adventure' }, { v: '16', l: 'Animation' },
  { v: '35', l: 'Comedy' }, { v: '80', l: 'Crime' }, { v: '99', l: 'Documentary' },
  { v: '18', l: 'Drama' }, { v: '14', l: 'Fantasy' }, { v: '27', l: 'Horror' },
  { v: '10749', l: 'Romance' }, { v: '878', l: 'Sci-Fi' }, { v: '53', l: 'Thriller' }
];

export const TV_GENRES = [
  { v: '10759', l: 'Action & Adventure' }, { v: '16', l: 'Animation' }, { v: '35', l: 'Comedy' },
  { v: '80', l: 'Crime' }, { v: '18', l: 'Drama' }, { v: '14', l: 'Fantasy' },
  { v: '27', l: 'Horror' }, { v: '10749', l: 'Romance' }, { v: '10765', l: 'Sci-Fi & Fantasy' },
  { v: '9648', l: 'Mystery' }
];
