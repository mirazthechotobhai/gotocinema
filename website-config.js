/*
 * GoToCinema website name and logo settings.
 *
 * Edit only the values below, then upload this file with index.html.
 * No index.html edit is needed.
 */
(function (window, document) {
  'use strict';

  window.GTC_WEBSITE_CONFIG = {
    siteName: 'GoToCinema',
    pageTitle: 'Go To Cinema - Watch Movies, TV Shows & Anime',
    logoText: 'GOTO CINEMA',
    logoImagePosition: 2,
    logoImageUrl: 'logo-icon.png',
    logoImageAlt: 'GoToCinema logo'
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderBrand(element) {
    var config = window.GTC_WEBSITE_CONFIG;
    var text = String(config.logoText || config.siteName || '').trim();
    var imageUrl = String(config.logoImageUrl || '').trim();
    var imagePosition = Number.parseInt(config.logoImagePosition, 10);
    var showImage = imageUrl && imageUrl !== '#' && imagePosition > 0;
    var words = text ? text.split(/\s+/) : [];
    var characterPosition = 0;
    var imageAlt = escapeHtml(config.logoImageAlt || config.siteName || 'Website logo');

    element.innerHTML = words.map(function (word, wordIndex) {
      var wordClass = wordIndex === words.length - 1
        ? 'gtc-config-logo-word gtc-config-logo-word--thin'
        : 'gtc-config-logo-word gtc-config-logo-word--bold';
      var wordMarkup = Array.from(word).map(function (character) {
        characterPosition += 1;
        if (showImage && characterPosition === imagePosition) {
          return '<img class="gtc-config-logo-img" src="' + escapeHtml(imageUrl) + '" alt="' + imageAlt + '">';
        }
        return escapeHtml(character);
      }).join('');
      return '<span class="' + wordClass + '">' + wordMarkup + '</span>';
    }).join(' ');
  }

  function applyWebsiteConfig() {
    var config = window.GTC_WEBSITE_CONFIG;
    if (config.pageTitle) document.title = config.pageTitle;
    document.querySelectorAll('[data-gtc-brand]').forEach(renderBrand);
    document.querySelectorAll('[data-gtc-brand-name]').forEach(function (element) {
      element.textContent = config.siteName || config.logoText || '';
    });
  }

  window.GTC_WEBSITE_CONFIG.apply = applyWebsiteConfig;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyWebsiteConfig, { once: true });
  } else {
    applyWebsiteConfig();
  }
})(window, document);