/*
 * GoToCinema public API settings.
 *
 * These values are intentionally kept in a separate file so the static site
 * can be moved to GitHub Pages without editing index.html. Do not put private
 * server-only secrets in this browser-visible file.
 */
(function (window) {
  'use strict';

  window.GTC_API_CONFIG = {
    firebase: {
      apiKey: 'AIzaSyBcR8zJrTkstjda22JEdVTaJ3FROmREdLA',
      authDomain: 'cinemabazar-600b0.firebaseapp.com',
      projectId: 'cinemabazar-600b0',
      storageBucket: 'cinemabazar-600b0.firebasestorage.app',
      messagingSenderId: '62690080088',
      appId: '1:62690080088:web:f4e7042fb4ad8248cce12d'
    },
    tmdb: {
      apiKey: '9d0f10dd934f1c2a6e91954041550593',
      apiBaseUrl: 'https://api.themoviedb.org/3',
      imageBaseUrl: 'https://image.tmdb.org/t/p'
    },
    anilist: {
      apiUrl: 'https://graphql.anilist.co',
      // Change this AniList media ID to choose the featured anime.
      animeId: 47880
    },
    imgbb: {
      apiKey: '9cf974acba9d5d5d715bf14db07d697a',
      uploadUrl: 'https://api.imgbb.com/1/upload'
    }
  };
})(window);