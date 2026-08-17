/*
 * GoToCinema advertising and direct-link settings.
 *
 * Change only status: "on" or status: "off" below.
 * For each ad, use duration: "unlimited" to always run, or duration: "#"
 * to follow the shared timer. This export is currently in unlimited test
 * mode so every configured ad can be checked on every device.
 * The website does not need to be edited when changing these settings.
 */
(function (window, document) {
  'use strict';

  window.GTC_AD_CONFIG = {
    adsTimer: {
      name: 'Ads Timer',
      status: 'on',
      activeMinutes: 10,
      repeatEveryHours: 12
    },

    directLink: {
      name: 'Direct link',
      status: 'on',
      duration: 'unlimited',
      url: 'https://www.effectivecpmnetwork.com/mt31bk6kgi?key=84312ad83e3a46232ecefedfb95bd705'
    },

    nativeBanner: {
      name: 'Native Banner',
      status: 'on',
      duration: 'unlimited',
      scriptSrc: 'https://pl30885733.effectivecpmnetwork.com/b3775426ad737420670c584a89ecce53/invoke.js',
      containerId: 'container-b3775426ad737420670c584a89ecce53'
    },

    popunder: {
      name: 'Popunder',
      status: 'on',
      duration: '#',
      scriptSrc: 'https://pl30885732.effectivecpmnetwork.com/25/67/6c/25676c4aa2ea8cc3aad3ebbe747b7fea.js'
    },

    socialBar: {
      name: 'Social Bar',
      status: 'on',
      duration: '#',
      scriptSrc: 'https://pl30885734.effectivecpmnetwork.com/49/e6/2a/49e62aa249254fb00f321008acda713e.js'
    },

    banner728x90: {
      name: 'Banner 728x90',
      status: 'on',
      duration: 'unlimited',
      key: '3c9dc0777afb301a335c35f834cc22a1',
      scriptSrc: 'https://www.highperformanceformat.com/3c9dc0777afb301a335c35f834cc22a1/invoke.js'
    }
  };

  var TIMER_STORAGE_KEY = 'gtc_ads_timer_started_at_v1';
  var timerStart = null;
  var lastTimerActive = null;

  function toPositiveNumber(value, fallback) {
    var number = Number(value);
    return isFinite(number) && number > 0 ? number : fallback;
  }

  function timerConfig() {
    return window.GTC_AD_CONFIG.adsTimer || {};
  }

  function getTimerStart() {
    if (timerStart) return timerStart;
    try {
      timerStart = Number(window.localStorage.getItem(TIMER_STORAGE_KEY)) || 0;
    } catch (error) {
      timerStart = 0;
    }
    if (!timerStart) {
      timerStart = Date.now();
      try {
        window.localStorage.setItem(TIMER_STORAGE_KEY, String(timerStart));
      } catch (error) {}
    }
    return timerStart;
  }

  function getTimerState() {
    var config = timerConfig();
    var activeMinutes = toPositiveNumber(config.activeMinutes, 10);
    var repeatEveryHours = toPositiveNumber(config.repeatEveryHours, 12);
    var activeMs = activeMinutes * 60 * 1000;
    var repeatMs = Math.max(activeMs, repeatEveryHours * 60 * 60 * 1000);
    var elapsed = (Date.now() - getTimerStart()) % repeatMs;
    if (elapsed < 0) elapsed += repeatMs;
    var remainingMs = Math.max(0, activeMs - elapsed);
    return {
      active: String(config.status).toLowerCase() !== 'off' && elapsed < activeMs,
      remainingMs: remainingMs,
      activeMinutes: activeMinutes,
      repeatEveryHours: repeatEveryHours
    };
  }

  function hasTimedAds() {
    return ['nativeBanner', 'popunder', 'socialBar', 'banner728x90'].some(function (name) {
      var item = window.GTC_AD_CONFIG[name];
      return item && String(item.status).toLowerCase() === 'on' && item.duration !== 'unlimited';
    });
  }

  function updateTimerUI() {
    var badge = document.getElementById('ads-timer');
    if (!badge) return;
    var state = getTimerState();
    var shouldShow = hasTimedAds() && String(timerConfig().status).toLowerCase() !== 'off' && state.active;
    badge.style.display = shouldShow ? 'inline-flex' : 'none';
    if (!shouldShow) return;
    var totalSeconds = Math.max(0, Math.ceil(state.remainingMs / 1000));
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    badge.textContent = 'ADS ' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    badge.title = 'Timed ads remaining';
  }

  function isOn(name) {
    var item = window.GTC_AD_CONFIG[name];
    if (!item || String(item.status).toLowerCase() !== 'on') return false;
    return String(item.duration).toLowerCase() === 'unlimited' || getTimerState().active;
  }

  function loadScript(src, attributes) {
    if (!src) return null;
    var existing = document.querySelector('script[data-gtc-ad-src="' + src + '"]');
    if (existing) return existing;
    var script = document.createElement('script');
    script.src = src;
    script.dataset.gtcAdSrc = src;
    Object.keys(attributes || {}).forEach(function (key) {
      if (key === 'async' || key === 'defer') script[key] = !!attributes[key];
      else script.setAttribute(key, attributes[key]);
    });
    document.head.appendChild(script);
    return script;
  }

  function loadGlobalAds() {
    var popunder = window.GTC_AD_CONFIG.popunder;
    var socialBar = window.GTC_AD_CONFIG.socialBar;
    if (isOn('popunder')) {
      var popunderScript = loadScript(popunder.scriptSrc);
      if (popunderScript) popunderScript.dataset.gtcAdGlobal = 'true';
    }
    if (isOn('socialBar')) {
      var socialBarScript = loadScript(socialBar.scriptSrc);
      if (socialBarScript) socialBarScript.dataset.gtcAdGlobal = 'true';
    }
  }

  function removeGlobalAds() {
    document.querySelectorAll('script[data-gtc-ad-global]').forEach(function (script) {
      script.remove();
    });
  }

  function renderNativeBanner() {
    var slot = document.getElementById('gtc-native-ad-slot');
    var config = window.GTC_AD_CONFIG.nativeBanner;
    if (!slot) return;
    slot.innerHTML = '';
    slot.style.display = isOn('nativeBanner') ? 'flex' : 'none';
    if (!isOn('nativeBanner')) return;

    var script = document.createElement('script');
    script.src = config.scriptSrc;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.dataset.gtcDetailAd = 'nativeBanner';
    slot.appendChild(script);
    var container = document.createElement('div');
    container.id = config.containerId;
    container.className = 'gtc-native-ad-container';
    slot.appendChild(container);
  }

  function render728x90Banner() {
    var slot = document.getElementById('gtc-728-ad-slot');
    var config = window.GTC_AD_CONFIG.banner728x90;
    if (!slot) return;
    slot.innerHTML = '';
    slot.style.display = isOn('banner728x90') ? 'flex' : 'none';
    if (!isOn('banner728x90')) return;

    window.atOptions = {
      key: config.key,
      format: 'iframe',
      height: 90,
      width: 728,
      params: {}
    };
    var script = document.createElement('script');
    script.src = config.scriptSrc;
    script.async = true;
    script.dataset.gtcDetailAd = 'banner728x90';
    slot.appendChild(script);
  }

  window.GTC_ADS = {
    isOn: isOn,
    getConfig: function (name) { return window.GTC_AD_CONFIG[name]; },
    getTimerState: getTimerState,
    renderDetailAds: function () {
      render728x90Banner();
      renderNativeBanner();
    }
  };

  function syncAdsState() {
    var state = getTimerState();
    updateTimerUI();
    var shouldLoadGlobalAds = isOn('popunder') || isOn('socialBar');
    if (lastTimerActive !== state.active || syncAdsState.lastGlobalAds !== shouldLoadGlobalAds) {
      lastTimerActive = state.active;
      syncAdsState.lastGlobalAds = shouldLoadGlobalAds;
      if (shouldLoadGlobalAds) loadGlobalAds();
      else removeGlobalAds();
      if (document.getElementById('detail-view')) window.GTC_ADS.renderDetailAds();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncAdsState();
    setInterval(syncAdsState, 1000);
  });
})(window, document);