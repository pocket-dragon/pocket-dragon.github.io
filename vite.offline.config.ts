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
  plugins: [react(), viteSingleFile(), inlineFavicon()],
  build: {
    target: 'es2017',
    outDir: 'dist-offline',
  },
});
