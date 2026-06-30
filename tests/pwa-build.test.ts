import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
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

  test('rejects an empty service worker', () => {
    const report = inspectPwaBuild({ swSource: '   ', assetFilenames: validAssets });
    expect(report.ok).toBe(false);
    expect(report.errors.join(' ')).toContain('empty');
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
});
