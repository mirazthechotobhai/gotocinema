/*
 * GoToCinema administrator settings.
 *
 * Admin login access and the admin profile are controlled here. Admin name,
 * profile image, and about text are not loaded from Firebase.
 */
(function (window) {
  'use strict';

  window.GTC_ADMIN_CONFIG = {
    adminEmails: [
      'rizviyankhan@gmail.com'
    ],
    profile: {
      name: 'GoToCinema Admin',
      imageUrl: 'logo-icon.png',
      about: 'GoToCinema administrator'
    }
  };
})(window);