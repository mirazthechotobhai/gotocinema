# Go To Cinema (React Application)

A modern, fast React streaming entertainment portal for movies, TV shows, anime, and live TV channels. Rewritten as a modern React SPA using Vite, TypeScript, and Tailwind CSS.

## Features

- **Movies, TV Shows & Anime**: Browse top trending, popular, and latest titles powered by TMDB and AniList APIs.
- **Top Of The Week Carousel**: Continuous horizontal marquee carousel with touch/mouse drag scrolling and hover pause.
- **Live TV & FIFA World Cup**: Built-in Hls.js IPTV streaming player with channel searching, category filtering, auto-retry on errors, and prev/next channel controls.
- **Advanced Discover & Filter**: Filter by content type, searchable languages, genres, sorting, and release year.
- **Real-Time Search Suggestions**: Fast debounced multi-search with thumbnail previews for both actors/people and media.
- **Voice Search**: Built-in speech recognition support with visual indicator.
- **Streaming Players & Custom Sources**:
  - Multiple configurable streaming server options per title.
  - Custom Player URL support with auto-conversion for YouTube links, Google Drive, Archive.org, and embed URLs.
  - TV Season & Episode controls with previous/next episode navigation.
  - YouTube trailer playback.
- **Cast & Filmography (Person View)**: View detailed profiles, biographies, and full works for cast members.
- **Deeplinking**: Shareable URL hashes (`#/:type/:slug/:id`) that open the detail view directly on page load.
- **Firebase Authentication & Admin Panel**:
  - Member login and registration with avatar upload via ImgBB.
  - Administrator dashboard to manage IPTV playlists, custom stream server templates (`{id}`, `{s}`, `{e}`), and global drag settings.
  - Media custom player and download URL overrides saved directly to Firestore.

## Quick Start

```bash
# Install dependencies
npm install

# Start local dev server (port 3000)
npm run dev

# Build for production
npm run build
```

## Configuration Files

The application retains support for the external config files:
- `ads-config.js`: Advertising, timed ads duration, direct links, and banner configuration.
- `website-config.js`: Site title, branding text, and logo settings.
- `website-colors.js`: Primary accent theme colors.
- `api-config.js`: TMDB, AniList, Firebase, and ImgBB API credentials.
- `admin-config.js`: Administrator email access and admin profile info.
- `social-media-config.js`: Header social links (Facebook, YouTube, Telegram, Instagram).
