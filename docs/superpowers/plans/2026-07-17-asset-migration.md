# Asset Migration (PR 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all media assets (sounds, promo images, fonts) from `public/assets/` to `src/assets/` as Vite-imported modules, with zero user-visible change — so PR 3's offline build can inline them via `assetsInlineLimit`.

**Architecture:** `public/` files are copied verbatim and can never be processed by Vite; imported assets get hashed URLs Vite controls. Icons stay in `public/assets/icon/` (the PWA manifest and `index.html` `<head>` need them at fixed paths). The workbox precache globs move from directory-based patterns (`assets/sound/**`) to flat hashed-output patterns (`assets/*.{ogg,wav}`), since Vite emits imported assets as `dist/assets/<name>-<hash>.<ext>`.

**Tech Stack:** Vite 8 asset imports, vite-plugin-pwa/workbox globPatterns, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-16-downloadable-offline-build-design.md` (PR 2 section).

## Global Constraints

- Work happens in `/Users/bot/src/pocket-dragon/upstream` on branch `refactor/asset-imports`.
- Local npm commands must run under Node 22: prefix with `fnm exec --using=22` (plain `npx`/`npm` may resolve to Node 24 — it prunes `@emnapi` from the lockfile and breaks CI `npm ci`).
- Commit messages: conventional commits, American English, no AI attribution lines. This PR must contain NO `feat`/`fix`/`perf` commits — `refactor`/`chore`/`test` only, so merging deploys but cuts no release (prod-neutral change; correct per spec).
- Zero user-visible change: same audio, same images, same font, same PWA precache behavior (`.mp3` stays OUT of the precache — GitHub Pages serves audio with HTTP 206, which Firefox rejects in `Cache.put()`).
- All 21 migrated files are ≥8.3 KB, above Vite's default 4096-byte `assetsInlineLimit`, so none becomes a data URI in the prod build. Do not change `assetsInlineLimit` in this PR.
- Never squash-merge; this repo merges PRs with rebase-and-merge. Fixups (if any) get autosquashed before merge.

## Asset inventory (verified 2026-07-17)

- **Migrate — sounds (9):** `public/assets/sound/cling_2{,-2x,-3x}.{mp3,ogg,wav}` → referenced only in `src/App.tsx:329-341`.
- **Migrate — promos (10):** `public/assets/promo-{anachrony,trickerion,petrichor,daysOfIre,nightsOfFire,redacted,microfilms,diceSettlers,kitchenRush,tashKalar}.jpg` → referenced only in `src/rules/game-rules.ts:226-235`.
- **Migrate — fonts (2):** `public/assets/font/cartoons_123-webfont.{woff,woff2}` → referenced only in `src/styles/global.css:6-7`.
- **Delete — orphans (9):** `public/assets/sound/beep-hightone{,-2x,-3x}.{mp3,ogg,wav}` — referenced nowhere in source (the `beep1x/2x/3x` sound effects play the `cling_2` files). Deleting; git history preserves them.
- **Keep in `public/` — icons (28):** everything under `public/assets/icon/` (used by `index.html` `<head>` links and the PWA manifest at fixed unhashed paths).
- No test hardcodes any of these paths (`tests/pwa-build.test.ts` pins only entry JS/CSS; e2e specs reference none).
- `src/vite-env.d.ts` already references `vite/client`, which declares modules for `.mp3/.ogg/.wav/.jpg/.woff/.woff2` — imports type-check without new declarations.

---

### Task 1: Branch setup

**Files:** none (branch operation only)

**Interfaces:**
- Produces: branch `refactor/asset-imports` off current `origin/main`, which Tasks 2–4 commit to.

- [ ] **Step 1: Create the branch**

```bash
cd /Users/bot/src/pocket-dragon/upstream
git fetch origin && git checkout -b refactor/asset-imports origin/main
```

- [ ] **Step 2: Verify state**

Run: `git status --short --branch && npm run build > /dev/null 2>&1 && fnm exec --using=22 npx vitest run --reporter=basic 2>&1 | tail -3`
Expected: clean tree on `refactor/asset-imports`; build succeeds; all unit/component tests pass BEFORE any change (baseline).

### Task 2: Delete the unused beep-hightone sounds

**Files:**
- Delete: `public/assets/sound/beep-hightone.mp3`, `.ogg`, `.wav`, and the `-2x`/`-3x` variants of each (9 files)

**Interfaces:**
- Consumes: nothing — these files are referenced nowhere (verified: `grep -rn "beep-hightone" src/ e2e/ tests/ index.html vite.config.ts` is empty; the reducer's `beep1x/2x/3x` effect names map to `cling_2*` audio elements in `App.tsx:328-342`).
- Produces: a smaller `public/assets/sound/` so Task 3's `git mv` sweep is exactly the 9 used files.

- [ ] **Step 1: Confirm they are orphans**

Run: `grep -rn "beep-hightone" src/ e2e/ tests/ index.html vite.config.ts || echo ORPHANS_CONFIRMED`
Expected: `ORPHANS_CONFIRMED` (no matches).

- [ ] **Step 2: Delete and commit**

```bash
git rm public/assets/sound/beep-hightone*.{mp3,ogg,wav}
git commit -m "chore: remove unused beep-hightone sound files

The beep1x/2x/3x sound effects play the cling_2 audio elements; the
beep-hightone files have no references in source, tests, or config.
Git history preserves them if ever needed again."
```

Expected: 9 deletions staged and committed.

- [ ] **Step 3: Verify nothing broke**

Run: `fnm exec --using=22 npx vitest run --reporter=basic 2>&1 | tail -3`
Expected: all tests still pass.

### Task 3: Migrate sounds, promos, and fonts to Vite imports

One commit — the moves, the code changes, and the glob update are one atomic refactor (splitting them would leave intermediate commits with a broken build).

**Files:**
- Move: `public/assets/sound/cling_2*.{mp3,ogg,wav}` (9) → `src/assets/sound/`
- Move: `public/assets/promo-*.jpg` (10) → `src/assets/`
- Move: `public/assets/font/cartoons_123-webfont.{woff,woff2}` (2) → `src/assets/font/`
- Modify: `src/App.tsx:329-341` (sound `<source>` elements), `src/rules/game-rules.ts:226-235` (promo `imageUrl`s), `src/styles/global.css:6-7` (`@font-face` URLs), `vite.config.ts` (workbox `globPatterns`)
- Test: `tests/pwa-build.test.ts` (new precache-layout regression test)

**Interfaces:**
- Consumes: the inventory above; `src/vite-env.d.ts` (already provides asset-module types).
- Produces: imported-URL constants used only within their own files; `dist/assets/<name>-<hash>.<ext>` output layout that PR 3's `assetsInlineLimit: Infinity` build will inline.

- [ ] **Step 1: Write the failing regression test**

Append inside the existing `describe('real production build', ...)` block in `tests/pwa-build.test.ts`:

```ts
  test('precaches hashed media assets and still excludes mp3', () => {
    const swPath = join('dist', 'sw.js');
    if (!existsSync(swPath)) {
      throw new Error('dist/sw.js not found — run `npm run build` before `npm run test:pwa`');
    }
    const swSource = readFileSync(swPath, 'utf8');

    // Imported media emit as dist/assets/<name>-<hash>.<ext> (no subdirectory).
    expect(swSource).toMatch(/assets\/cling_2[\w.-]*\.ogg/);
    expect(swSource).toMatch(/assets\/cling_2[\w.-]*\.wav/);
    expect(swSource).toMatch(/assets\/cartoons_123-webfont[\w.-]*\.woff2/);
    expect(swSource).toMatch(/assets\/promo-[\w.-]*\.jpg/);
    // GitHub Pages serves audio with HTTP 206, which Firefox rejects in
    // Cache.put() — mp3 must never enter the precache.
    expect(swSource).not.toMatch(/\.mp3/);
  });
```

- [ ] **Step 2: Run it to confirm it fails against the current layout**

Run: `npm run build > /dev/null 2>&1 && fnm exec --using=22 npm run test:pwa 2>&1 | tail -5`
Expected: FAIL — the new test's `assets\/cling_2...` patterns don't match the current `assets/sound/cling_2.ogg` precache URLs (subdirectory in the path). The pre-existing tests still pass.

- [ ] **Step 3: Move the files**

```bash
mkdir -p src/assets/sound src/assets/font
git mv public/assets/sound/cling_2*.{mp3,ogg,wav} src/assets/sound/
git mv public/assets/promo-*.jpg src/assets/
git mv public/assets/font/cartoons_123-webfont.woff public/assets/font/cartoons_123-webfont.woff2 src/assets/font/
rmdir public/assets/sound public/assets/font
```

Expected: `public/assets/` now contains only `icon/`.

- [ ] **Step 4: Import the sounds in App.tsx**

Add after the existing imports at the top of `src/App.tsx`:

```tsx
import beep1xMp3 from './assets/sound/cling_2.mp3';
import beep1xOgg from './assets/sound/cling_2.ogg';
import beep1xWav from './assets/sound/cling_2.wav';
import beep2xMp3 from './assets/sound/cling_2-2x.mp3';
import beep2xOgg from './assets/sound/cling_2-2x.ogg';
import beep2xWav from './assets/sound/cling_2-2x.wav';
import beep3xMp3 from './assets/sound/cling_2-3x.mp3';
import beep3xOgg from './assets/sound/cling_2-3x.ogg';
import beep3xWav from './assets/sound/cling_2-3x.wav';
```

(Names follow the `beep1x/2x/3x` effect vocabulary used by `timerBeepRef`/`timerBeep2xRef`/`timerBeep3xRef` and the reducer's `SoundEffect` type.)

Replace the nine `<source>` elements at lines 329–341:

```tsx
        <audio ref={timerBeepRef} preload="auto">
          <source src={beep1xMp3} type="audio/mpeg" />
          <source src={beep1xOgg} type="audio/ogg" />
          <source src={beep1xWav} type="audio/wav" />
        </audio>
        <audio ref={timerBeep2xRef} preload="auto">
          <source src={beep2xMp3} type="audio/mpeg" />
          <source src={beep2xOgg} type="audio/ogg" />
          <source src={beep2xWav} type="audio/wav" />
        </audio>
        <audio ref={timerBeep3xRef} preload="auto">
          <source src={beep3xMp3} type="audio/mpeg" />
          <source src={beep3xOgg} type="audio/ogg" />
          <source src={beep3xWav} type="audio/wav" />
        </audio>
```

- [ ] **Step 5: Import the promo images in game-rules.ts**

Add at the top of `src/rules/game-rules.ts` (after the existing content imports):

```ts
import promoAnachrony from '../assets/promo-anachrony.jpg';
import promoTrickerion from '../assets/promo-trickerion.jpg';
import promoPetrichor from '../assets/promo-petrichor.jpg';
import promoDaysOfIre from '../assets/promo-daysOfIre.jpg';
import promoNightsOfFire from '../assets/promo-nightsOfFire.jpg';
import promoRedacted from '../assets/promo-redacted.jpg';
import promoMicrofilms from '../assets/promo-microfilms.jpg';
import promoDiceSettlers from '../assets/promo-diceSettlers.jpg';
import promoKitchenRush from '../assets/promo-kitchenRush.jpg';
import promoTashKalar from '../assets/promo-tashKalar.jpg';
```

Replace the string literals at lines 226–235 with the imported names, e.g.:

```ts
  { title: 'Anachrony', imageUrl: promoAnachrony, content: anachrony },
  { title: 'Trickerion', imageUrl: promoTrickerion, content: trickerion },
  { title: 'Petrichor', imageUrl: promoPetrichor, content: petrichor },
  { title: 'Days of Ire', imageUrl: promoDaysOfIre, content: daysOfIre },
  { title: 'Nights of Fire', imageUrl: promoNightsOfFire, content: nightsOfFire },
  { title: '[redacted]', imageUrl: promoRedacted, content: redacted },
  { title: 'Microfilms', imageUrl: promoMicrofilms, content: microfilms },
  { title: 'Dice Settlers', imageUrl: promoDiceSettlers, content: diceSettlers },
  { title: 'Kitchen Rush', imageUrl: promoKitchenRush, content: kitchenRush },
  { title: 'Tash-Kalar', imageUrl: promoTashKalar, content: tashKalar },
```

(Titles and `content` values stay exactly as they are.)

- [ ] **Step 6: Point the @font-face at the moved files**

In `src/styles/global.css` lines 6–7, change to relative URLs (Vite processes relative `url()`s in CSS and rewrites them to the hashed output):

```css
  src: url('../assets/font/cartoons_123-webfont.woff2') format('woff2'),
       url('../assets/font/cartoons_123-webfont.woff') format('woff');
```

- [ ] **Step 7: Update the workbox precache globs**

In `vite.config.ts`, replace the two directory-based media patterns (keep every other line of `globPatterns` unchanged):

```ts
        globPatterns: [
          'assets/*.{woff,woff2}',
          // Note: .mp3 excluded from precache — GitHub Pages returns HTTP 206
          // (Partial Content) for audio files, which Firefox rejects in Cache.put().
          // MP3s will be fetched from the network on each use.
          'assets/*.{ogg,wav}',
          'assets/icon/apple-*',
          'assets/icon/ms-*',
          'assets/icon/favicon*',
          'assets/icon/icon-source.png',
          'assets/promo-*.jpg',
          'assets/*.{js,css}',
          '*.{js,css,html,ico}',
        ],
```

(`assets/promo-*.jpg` needs no change — the hashed `promo-anachrony-<hash>.jpg` still matches. `assets/font/**` and `assets/sound/**` become the flat `assets/*.{...}` patterns because imported assets emit into `dist/assets/` directly.)

- [ ] **Step 8: Build and verify emitted output**

Run: `fnm exec --using=22 npm run build 2>&1 | tail -3 && ls dist/assets/ | grep -cE "\.(mp3|ogg|wav|jpg|woff2?)$" && ls dist/assets/sound dist/assets/font 2>&1 | head -2`
Expected: build succeeds; count is `21` (9 sounds + 10 promos + 2 fonts, all hashed in `dist/assets/`); `dist/assets/sound`/`font` no longer exist.

- [ ] **Step 9: Run the full local suites — regression test now green**

Run: `fnm exec --using=22 npm run test:pwa 2>&1 | tail -3 && fnm exec --using=22 npx vitest run --reporter=basic 2>&1 | tail -3 && fnm exec --using=22 npx tsc --noEmit -p tsconfig.json 2>&1 | tail -2`
Expected: PWA tests pass including the new precache test; all unit/component tests pass; typecheck clean.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor: import media assets through Vite instead of public/

Sounds, promo images, and the webfont move from public/assets/ (copied
verbatim, invisible to Vite) to src/assets/ as imported modules, so
Vite controls their URLs and emits them hashed into dist/assets/.
Workbox precache globs follow the flattened output layout; a new PWA
build test pins the layout and keeps mp3 out of the precache.

Prod-neutral: same files, same precache membership, no asset is small
enough to hit the 4 KB data-URI inline threshold. This unblocks the
offline single-file build (issue #9), which inlines imported assets
via assetsInlineLimit."
```

### Task 4: e2e verification, push, PR

**Files:** none (verification + remote operations)

**Interfaces:**
- Consumes: the committed branch from Tasks 2–3.
- Produces: an open PR; CI (including visual regression) is the final arbiter of prod-neutrality.

- [ ] **Step 1: Run the e2e suite against the real production build**

Run: `fnm exec --using=22 npm run test:e2e 2>&1 | tail -5`
Expected: all specs pass (the suite serves `dist/` via `vite preview`; `sound.spec.ts` and `rules-modal.spec.ts` exercise the migrated audio elements and promo images end-to-end).

- [ ] **Step 2: Push and create the PR**

```bash
git push -u origin refactor/asset-imports
gh pr create --repo pocket-dragon/pocket-dragon.github.io \
  --title "refactor: import media assets through Vite" \
  --body "$(cat <<'EOF'
Part 2 of 3 for #9 (design spec: docs/superpowers/specs/2026-07-16-downloadable-offline-build-design.md).

Prod-neutral refactor: sounds, promo images, and the webfont move from
`public/assets/` to `src/assets/` as Vite imports, so the upcoming
offline single-file build can inline them via `assetsInlineLimit`.
Icons stay in `public/` (manifest + <head> need fixed paths).

- Workbox globs updated for the flattened hashed output; `.mp3` stays
  out of the precache (GH Pages 206 vs Firefox `Cache.put()`). A new
  PWA build test pins the precache layout.
- Also deletes the unreferenced `beep-hightone` sound files (the
  beep1x/2x/3x effects play the cling_2 audio; git history keeps them).
- No feat/fix commits — merging deploys but cuts no release, by design.
- All asset files ≥8.3 KB, so none crosses Vite's 4 KB inline threshold;
  the deployed output is behaviorally identical.

Next: PR 3 adds the offline build + pocket-dragon.html release asset
and the modal download link.
EOF
)"
```

- [ ] **Step 3: Wait for CI, hand off for merge**

Run: `gh pr checks refactor/asset-imports --repo pocket-dragon/pocket-dragon.github.io --watch`
Expected: all checks green — visual regression matters most here (pixel-identical rendering proves the font/promo migration). Then report to Adrian for review/merge (rebase-and-merge). STOP; Task 5 runs after merge.

### Task 5: Post-merge verification

**Files:** none (remote observations)

**Interfaces:**
- Consumes: the merged PR on `main`.
- Produces: verified prod deploy; confirmation that no release was cut.

- [ ] **Step 1: Watch the deploy pipeline**

```bash
RID=$(gh run list --repo pocket-dragon/pocket-dragon.github.io \
  --workflow orchestrate-deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RID" --repo pocket-dragon/pocket-dragon.github.io --interval 30 --exit-status
```

Expected: pipeline green end-to-end. The `release` job runs and reports "no release" (only `refactor`/`chore`/`test` commits) — that is success, not failure.

- [ ] **Step 2: Confirm no release was cut and prod is healthy**

Run: `gh release view --repo pocket-dragon/pocket-dragon.github.io --json tagName -q .tagName && curl -s -o /dev/null -w "%{http_code}" https://pocket-dragon.github.io/`
Expected: still `v3.1.0`; prod returns `200`. Spot-check in a browser that the font renders and a rules promo image loads (hashed URLs in DevTools network tab).

## Self-Review Notes

- Spec coverage: move sounds/promos/fonts to imported modules ✔ (Task 3), icons stay in public ✔ (untouched), workbox globs updated with mp3 still excluded ✔ (Task 3 step 7), verified by existing suites ✔ (Tasks 3–4; plus one new precache regression test, an addition the spec didn't forbid — it pins exactly the invariant the spec demands).
- Orphan deletion (Task 2) is not in the spec; it's a discovered cleanup flagged to Adrian in the PR body.
- Type consistency: import names in Task 3 steps 4–5 match their uses; no cross-task interfaces beyond the branch itself.
