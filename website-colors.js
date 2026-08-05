/*
 * GoToCinema primary website color.
 *
 * Change only primaryColor to any valid CSS color or hex code.
 * This changes the website's main accent without editing index.html.
 */
(function (window, document) {
  'use strict';

  window.GTC_WEBSITE_COLORS = {
    primaryColor: '#16A34A'
  };

  function applyWebsiteColor() {
    var color = String(window.GTC_WEBSITE_COLORS.primaryColor || '').trim();
    if (!color) return;

    var root = document.documentElement;
    [
      '--gtc-primary',
      '--c-grad-m',
      '--c-btn-1'
    ].forEach(function (property) {
      root.style.setProperty(property, color, 'important');
    });

    var styleId = 'gtc-website-primary-color';
    var style = document.getElementById(styleId) || document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '::-webkit-scrollbar-thumb{background:' + color + '!important}',
      '.topbar-wrapper{background:linear-gradient(180deg,#262626,' + color + ',#262626)!important}',
      '#main-header{background:linear-gradient(90deg,#262626,' + color + ',#262626)!important}',
      '#featured-wrapper{background:linear-gradient(180deg,#262626,' + color + ',#262626)!important}',
      '.logo-btn{background:linear-gradient(90deg,#262626,' + color + ',#262626)!important}',
      '.breakhead,.scroll-top-btn,.auth-tab-btn.active{background:' + color + '!important}',
      '.search-btn,#tab-livetv .live-dot{color:' + color + '!important}',
      '.adv-toggle-btn.open{background:' + color + '!important}',
      '#adv-discover,.se-play-btn,.auth-submit,.auth-save-profile-btn{background:linear-gradient(135deg,' + color + ',' + color + ')!important}',
      '.section-heading::after{background:linear-gradient(to right,' + color + ',transparent)!important}',
      '.auth-input:focus,.auth-bio-input:focus{border-color:' + color + '!important}',
      '.loading-spinner{border-top-color:' + color + '!important}'
    ].join('');
    if (!style.parentNode) document.head.appendChild(style);
  }

  window.GTC_WEBSITE_COLORS.apply = applyWebsiteColor;
  // Apply during head parsing so the old CSS fallback never paints on reload.
  applyWebsiteColor();
})(window, document);