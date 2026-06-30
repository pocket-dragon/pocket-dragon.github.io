// Build-time validation that vite-plugin-pwa produced a usable service worker.
// Pure over already-read inputs so it can be unit-tested without a real build;
// the integration test feeds it the contents of the real dist/ directory.

export interface PwaBuildInput {
  // Contents of dist/sw.js, or null when the file is absent.
  swSource: string | null;
  // Basenames of the files in dist/assets (e.g. "index-AbCd1234.js").
  assetFilenames: string[];
}

export interface PwaBuildReport {
  ok: boolean;
  errors: string[];
}

// Vite emits the app entry as assets/index-<hash>.js and its stylesheet as
// assets/index-<hash>.css.
const ENTRY_CHUNK = /^index-[\w-]+\.js$/;
const ENTRY_STYLE = /^index-[\w-]+\.css$/;

// The entry assets the service worker must precache for offline use. The JS
// entry chunk is intrinsic to any Vite build, but "always ships an entry
// stylesheet" is an app-specific assumption: this app statically imports global
// CSS (src/main.tsx), so Vite's defaults always emit a hashed index-*.css. A
// future build that stops shipping entry CSS (e.g. cssCodeSplit:false, which
// renames it to style-<hash>.css) would need this list updated.
const ENTRY_ASSETS: ReadonlyArray<{ pattern: RegExp; label: string; example: string }> = [
  { pattern: ENTRY_CHUNK, label: 'entry chunk', example: 'assets/index-*.js' },
  { pattern: ENTRY_STYLE, label: 'entry stylesheet', example: 'assets/index-*.css' },
];

// An injected precache manifest with no entries — workbox emitted
// precacheAndRoute([]) — means nothing would be cached for offline use.
const EMPTY_PRECACHE = /precacheAndRoute\(\s*\[\s*\]/;

// Returns the first asset matching `pattern`. A normal Vite build emits exactly
// one hashed entry chunk / stylesheet, so first-match is sufficient; if a build
// ever emitted several we'd only assert that one of them is referenced.
export function findEntry(filenames: string[], pattern: RegExp): string | undefined {
  return filenames.find((name) => pattern.test(name));
}

export function inspectPwaBuild(input: PwaBuildInput): PwaBuildReport {
  const { swSource, assetFilenames } = input;
  const errors: string[] = [];

  if (swSource === null) {
    errors.push('dist/sw.js is missing — the PWA service worker was not generated');
    return { ok: false, errors };
  }

  if (swSource.trim().length === 0) {
    errors.push('dist/sw.js is empty');
  }

  if (swSource.includes('self.__WB_MANIFEST')) {
    errors.push(
      'dist/sw.js still contains the un-injected self.__WB_MANIFEST token — precache injection failed',
    );
  }

  if (EMPTY_PRECACHE.test(swSource)) {
    errors.push('dist/sw.js precache list is empty — nothing would be cached for offline use');
  }

  for (const { pattern, label, example } of ENTRY_ASSETS) {
    const asset = findEntry(assetFilenames, pattern);
    if (!asset) {
      errors.push(`no hashed ${label} (${example}) found in the build`);
    } else if (!swSource.includes(asset)) {
      errors.push(
        `dist/sw.js does not reference the ${label} ${asset} — the precache list looks wrong`,
      );
    }
  }

  return { ok: errors.length === 0, errors };
}
