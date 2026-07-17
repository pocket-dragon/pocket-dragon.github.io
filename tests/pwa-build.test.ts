import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assert, describe, expect, test } from 'vitest';
import { findEntry, inspectPwaBuild } from './pwaBuild';

// A minimal stand-in for a real workbox-generated sw.js precache call. It must
// reference both the hashed JS entry chunk and the hashed CSS stylesheet.
const validSw = `precacheAndRoute([{"revision":null,"url":"assets/index-AbCd1234.js"},{"revision":null,"url":"assets/index-ZzZz9999.css"},{"revision":"x","url":"index.html"}]);`;
const validAssets = ['index-AbCd1234.js', 'index-ZzZz9999.css'];

describe('findEntry', () => {
  test('returns the first asset matching the pattern', () => {
    expect(findEntry(validAssets, /^index-[\w-]+\.js$/)).toBe('index-AbCd1234.js');
    expect(findEntry(validAssets, /^index-[\w-]+\.css$/)).toBe('index-ZzZz9999.css');
  });

  test('returns undefined when no asset matches the pattern', () => {
    expect(findEntry(['vendor-1234.js', 'styles.css'], /^index-[\w-]+\.js$/)).toBeUndefined();
  });
});

describe('inspectPwaBuild', () => {
  test('accepts a valid build', () => {
    const report = inspectPwaBuild({ swSource: validSw, assetFilenames: validAssets });
    expect(report).toEqual({ ok: true, errors: [] });
  });

  test('rejects a missing service worker', () => {
    const report = inspectPwaBuild({ swSource: null, assetFilenames: validAssets });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('missing');
  });

  test('rejects an empty service worker with a single focused error', () => {
    const report = inspectPwaBuild({ swSource: '   ', assetFilenames: validAssets });
    expect(report.ok).toBe(false);
    // Only the "empty" error — no spurious follow-on checks against an empty file.
    expect(report.errors).toEqual(['dist/sw.js is empty']);
  });

  test('rejects an un-injected precache manifest', () => {
    const report = inspectPwaBuild({
      swSource: 'precacheAndRoute(self.__WB_MANIFEST);',
      assetFilenames: validAssets,
    });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('__WB_MANIFEST');
  });

  test('rejects an empty precache list', () => {
    const report = inspectPwaBuild({ swSource: 'precacheAndRoute([]);', assetFilenames: validAssets });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('precache list is empty');
  });

  test('rejects an empty precache list written with whitespace and newlines', () => {
    // Pins the EMPTY_PRECACHE `\s*` robustness: minified vs pretty-printed
    // workbox output can put whitespace/newlines between the brackets.
    const report = inspectPwaBuild({
      swSource: 'precacheAndRoute([\n  \n]);',
      assetFilenames: validAssets,
    });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('precache list is empty');
  });

  test('rejects a service worker that does not reference the entry stylesheet', () => {
    const report = inspectPwaBuild({
      swSource: 'precacheAndRoute([{"revision":null,"url":"assets/index-AbCd1234.js"}]);',
      assetFilenames: validAssets,
    });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('index-ZzZz9999.css');
  });

  test('rejects a build with no entry stylesheet at all', () => {
    const report = inspectPwaBuild({ swSource: validSw, assetFilenames: ['index-AbCd1234.js'] });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('entry stylesheet');
  });

  test('rejects a service worker that does not reference the entry chunk', () => {
    const report = inspectPwaBuild({
      swSource: 'precacheAndRoute([{"revision":"x","url":"index.html"}]);',
      assetFilenames: validAssets,
    });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('index-AbCd1234.js');
  });

  test('rejects a build with no entry chunk at all', () => {
    const report = inspectPwaBuild({ swSource: validSw, assetFilenames: ['styles.css'] });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('entry chunk');
  });
});

describe('real production build', () => {
  test('produces a valid PWA service worker', () => {
    const swPath = join('dist', 'sw.js');
    const assetsDir = join('dist', 'assets');

    if (!existsSync(swPath)) {
      throw new Error('dist/sw.js not found — run `npm run build` before `npm run test:pwa`');
    }

    const swSource = readFileSync(swPath, 'utf8');
    const assetFilenames = existsSync(assetsDir) ? readdirSync(assetsDir) : [];

    const report = inspectPwaBuild({ swSource, assetFilenames });
    expect(report.errors).toEqual([]);
  });

  test('precaches the full hashed media inventory and still excludes mp3', () => {
    const swPath = join('dist', 'sw.js');
    if (!existsSync(swPath)) {
      throw new Error('dist/sw.js not found — run `npm run build` before `npm run test:pwa`');
    }
    const swSource = readFileSync(swPath, 'utf8');

    // Scope every assertion to the precacheAndRoute([...]) manifest array rather
    // than the whole sw.js, so a filename mentioned in runtime-caching/config code
    // can neither satisfy nor break these checks.
    const manifest = swSource.match(/precacheAndRoute\(\s*(\[[^\]]*\])/)?.[1];
    // vitest's assert narrows `manifest` from `string | undefined` to `string`,
    // so the array can be used below without a cast.
    assert(manifest, 'precacheAndRoute manifest array not found in sw.js');
    const cache = manifest;

    // Imported media emit as dist/assets/<name>-<hash>.<ext> (no subdirectory).
    // Assert the whole inventory — one-sample checks let a silently-dropped
    // precache entry pass green.

    // Both webfont formats.
    expect(cache).toMatch(/assets\/cartoons_123-webfont[\w.-]*\.woff2/);
    expect(cache).toMatch(/assets\/cartoons_123-webfont[\w.-]*\.woff\b/);

    // All three cling_2 beep variants, in both .ogg and .wav (mp3 excluded).
    // Count instead of name-matching each: cling_2 is a prefix of cling_2-2x /
    // cling_2-3x, so a per-name regex can't tell the base apart from a variant.
    // Exactly three distinct hashed filenames per extension proves none dropped.
    for (const ext of ['ogg', 'wav']) {
      const hits = cache.match(new RegExp(`assets/cling_2[\\w.-]*\\.${ext}`, 'g')) ?? [];
      expect(hits, `expected 3 cling_2 .${ext} precache entries`).toHaveLength(3);
    }

    // Each of the 10 promo images.
    const promos = [
      'anachrony',
      'daysOfIre',
      'diceSettlers',
      'kitchenRush',
      'microfilms',
      'nightsOfFire',
      'petrichor',
      'redacted',
      'tashKalar',
      'trickerion',
    ];
    for (const promo of promos) {
      expect(cache).toMatch(new RegExp(`assets/promo-${promo}-[\\w.-]*\\.jpg`));
    }

    // GitHub Pages serves audio with HTTP 206, which Firefox rejects in
    // Cache.put() — mp3 must never enter the precache.
    expect(cache).not.toMatch(/\.mp3/);
  });
});
