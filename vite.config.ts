/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // All static assets are covered by workbox.globPatterns below.
      // Don't use includeAssets — it creates duplicate precache entries
      // with conflicting revision strategies.
      manifest: {
        name: 'Pocket Dragon',
        short_name: 'Pocket Dragon',
        description: 'The companion app for the boardgame Pocket Dragon',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'assets/icon/android-icon-36x36.png',
            sizes: '36x36',
            type: 'image/png',
            density: '0.75',
          },
          {
            src: 'assets/icon/android-icon-48x48.png',
            sizes: '48x48',
            type: 'image/png',
            density: '1.0',
          },
          {
            src: 'assets/icon/android-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            density: '1.5',
          },
          {
            src: 'assets/icon/android-icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            density: '2.0',
          },
          {
            src: 'assets/icon/android-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            density: '3.0',
          },
          {
            src: 'assets/icon/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            density: '4.0',
          },
          {
            src: 'assets/icon/android-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'assets/icon/android-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        // Exclude android-icon-*.png and manifest.webmanifest from glob —
        // VitePWA injects these from the manifest config with revision hashes.
        // Including them in both creates conflicting entries that cause Workbox
        // to throw "add-to-cache-list-conflicting-entries" and abort precaching.
        globPatterns: [
          'assets/*.{woff,woff2}',
          // Note: .mp3 excluded from precache — GitHub Pages returns HTTP 206
          // (Partial Content) for audio files, which Firefox rejects in Cache.put().
          // MP3s will be fetched from the network on each use.
          // This catch-all also precaches any future .ogg/.wav import, so a large
          // audio asset added later will silently grow the precache — watch for it.
          'assets/*.{ogg,wav}',
          'assets/icon/apple-*',
          'assets/icon/ms-*',
          'assets/icon/favicon*',
          'assets/icon/icon-source.png',
          'assets/promo-*.jpg',
          'assets/*.{js,css}',
          '*.{js,css,html,ico}',
        ],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [],
      },
    }),
  ],
  build: {
    target: 'es2017',
  },

  server: {
    port: 5173,
  },
  test: {
    projects: [
      {
        // inherit the root plugins (react, VitePWA) and coverage
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          include: ['src/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/logic/**/*.ts'],
      reporter: ['text', 'html'],
    },
  },
});
