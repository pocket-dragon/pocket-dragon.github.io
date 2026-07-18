/// <reference types="vite-plugin-pwa/react" />
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Offline single-file build (issue #9): everything — JS, CSS, sounds, images,
// fonts — inlined into one index.html that works when opened via file://.
// External module scripts are CORS-blocked on file:// in Chrome/Firefox;
// inline scripts are exempt, which is the whole trick.
//
// No VitePWA: service workers can't register on file://, and the offline copy
// needs no precache — it IS the cache. publicDir is disabled so the icon files
// aren't copied next to the artifact; the head links to them are stripped and
// replaced with one inlined favicon below.
//
// vite-plugin-singlefile's recommended-config mode raises assetsInlineLimit to
// 100 MB, so every imported asset (PR 2 made all media imports) becomes a data
// URI — no custom inlining code.

// No service worker on file:// — vite-plugin-pwa (and its virtual module) is
// absent from this build, so provide `virtual:pwa-register/react` as an inline
// no-op. `needRefresh` never flips, so useAppUpdate reports no update and the
// reload button can never appear offline.
//
// Typed against the real hook so drift from its signature (e.g. a newly-added
// field) surfaces as a type error on this const. Note this is a dev-time /
// editor guard only: no CI step type-checks this file (`npm run build` runs
// plain `tsc`, whose program is just src/; tsconfig.node.json references it but
// nothing builds that reference). The offline E2E remains the CI backstop
// against stub drift.
//
// Kept inline as a local const (serialized via toString below) rather than an
// exported src/ stub reached via resolve.alias, so there's no standalone export
// that Fallow flags as a never-imported dead export.
const stubUseRegisterSW: typeof import('virtual:pwa-register/react').useRegisterSW = () => ({
  needRefresh: [false, () => {}],
  offlineReady: [false, () => {}],
  updateServiceWorker: () => Promise.resolve(),
});

function stubPwaRegister(): Plugin {
  const id = 'virtual:pwa-register/react';
  const resolvedId = '\0' + id;
  return {
    name: 'offline-stub-pwa-register',
    resolveId(source) {
      if (source === id) return resolvedId;
    },
    load(thisId) {
      if (thisId === resolvedId) {
        return `export const useRegisterSW = ${stubUseRegisterSW.toString()};`;
      }
    },
  };
}

function inlineFavicon(): Plugin {
  return {
    name: 'offline-inline-favicon',
    transformIndexHtml(html) {
      const favicon = readFileSync('public/assets/icon/favicon-32x32.png').toString('base64');
      const result = html
        .replace(/^\s*<link rel="(?:icon|apple-touch-icon)"[^>]*>\r?\n/gm, '')
        .replace(
          '</title>',
          `</title>\n    <link rel="icon" type="image/png" href="data:image/png;base64,${favicon}" />`,
        );
      if (/assets\/icon\//.test(result)) {
        throw new Error(
          'offline-inline-favicon: an icon <link> survived the strip — index.html markup changed shape; update the regex in vite.offline.config.ts',
        );
      }
      return result;
    },
  };
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), viteSingleFile(), inlineFavicon(), stubPwaRegister()],
  build: {
    target: 'es2017',
    outDir: 'dist-offline',
  },
});
