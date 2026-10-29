import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function copyStaticPlugin() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const filesToCopy = [
        'ads-config.js',
        'website-config.js',
        'api-config.js',
        'admin-config.js',
        'social-media-config.js',
        'website-colors.js',
        'site.webmanifest',
        'sitemap.xml',
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png',
        'apple-touch-icon.png',
        'logo-icon.png'
      ];
      const dirsToCopy = [
        'js',
        'css',
        'images',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'i.postimg.cc'
      ];
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) return;

      for (const file of filesToCopy) {
        const src = path.resolve(__dirname, file);
        const dest = path.resolve(distDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }

      for (const dir of dirsToCopy) {
        const src = path.resolve(__dirname, dir);
        const dest = path.resolve(distDir, dir);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true });
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [copyStaticPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
