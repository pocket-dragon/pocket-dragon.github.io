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

// A URL is "content-hashed" (self-versioning) when its filename ends in a Vite
// build hash: a dash followed by 8 base64url chars right before the extension,
// e.g. index-AbCd1234.js or promo-trickerion-EqB_91UC.jpg. Such a URL is safe to
// precache with revision:null because any byte change also changes the URL.
//
// This is intentionally a duplicate of vite.config.ts's `dontCacheBustURLsMatching`
// regex, NOT a shared import: the two must express the same notion of "hashed", but
// keeping this an independent copy lets it act as an oracle — if the config's
// definition regresses (e.g. reverts to the /^assets\// default), this check still
// fires on the now-unhashed URLs it wrongly pins with revision:null. Keep the two
// regexes in sync by hand; the neighboring test fixtures pin the behavior.
const HASHED_URL = /-[A-Za-z0-9_-]{8}\.[^./]+$/;

export interface PrecacheEntry {
  url: string;
  // The Workbox revision: an md5 string, or null meaning "the URL self-versions".
  // undefined when an entry had no revision field at all (shouldn't happen).
  revision: string | null | undefined;
}

// Extracts the {url, revision} entries from a workbox precacheAndRoute([...]) call.
// Handles both the minified real sw.js ({url:"…",revision:null}, unquoted keys)
// and quoted/reordered test fixtures ({"revision":null,"url":"…"}). Returns [] if
// no precache array is present (callers already diagnose that separately).
export function parsePrecacheEntries(swSource: string): PrecacheEntry[] {
  // Precache entries contain no ']' of their own, so stop at the first one.
  const manifest = swSource.match(/precacheAndRoute\(\s*(\[[^\]]*\])/)?.[1];
  if (!manifest) return [];
  const entries: PrecacheEntry[] = [];
  for (const object of manifest.match(/\{[^{}]*\}/g) ?? []) {
    const url = object.match(/["']?url["']?\s*:\s*["']([^"']+)["']/)?.[1];
    if (!url) continue;
    const revisionMatch = object.match(/["']?revision["']?\s*:\s*(?:null|["']([^"']*)["'])/);
    const revision = revisionMatch ? (revisionMatch[1] ?? null) : undefined;
    entries.push({ url, revision });
  }
  return entries;
}

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
    // Return early: every later check would fail against an empty file and
    // only add noise to an already-clear diagnosis.
    return { ok: false, errors };
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

  // Issue #115: an unhashed URL precached with revision:null can never be
  // refreshed — Workbox treats null as "this URL self-versions". Only genuinely
  // content-hashed URLs may carry revision:null; anything else needs a revision.
  for (const { url, revision } of parsePrecacheEntries(swSource)) {
    if (revision === null && !HASHED_URL.test(url)) {
      errors.push(
        `dist/sw.js precache entry ${url} has revision:null but its URL is not content-hashed — installed clients would never fetch a changed version; scope workbox dontCacheBustURLsMatching to hashed filenames`,
      );
    }
  }

  return { ok: errors.length === 0, errors };
}
