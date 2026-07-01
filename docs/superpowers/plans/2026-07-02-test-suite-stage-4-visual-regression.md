# Test Suite Stage 4: Dockerized Visual-Regression Tests — Implementation Plan

> **For agentic workers:** implements stage 4 of the
> [trustworthy-tests → auto-merge program](../specs/2026-06-30-trustworthy-tests-auto-merge-design.md).
> Tracks [issue #84](https://github.com/pocket-dragon/pocket-dragon.github.io/issues/84).

**Goal:** Catch behavior-invisible layout/style regressions — the
`Lundalogik/lime-elements#4147` pattern, where a major dependency bump quietly
shifts rendering while every functional test stays green. Screenshot the key app
states and compare against committed baselines.

**Architecture:** A **separate** Playwright config
(`playwright.visual.config.ts`) drives a small spec (`e2e/visual/visual.spec.ts`)
that captures the key states — initial screen, mid-game, game-over dialog, and
the rules modal (top, scrolled to the promo list, and with a promo section
expanded to reveal its image) — against baselines committed under
`e2e/visual/visual.spec.ts-snapshots/`.
Baselines are pixel-pinned to the `mcr.microsoft.com/playwright:v1.59.1-jammy`
Docker image so a developer's Mac and CI render identical pixels. Everything is
gated on `PLAYWRIGHT_VISUAL=1` **and** Linux: outside the pinned image every spec
skips (and the config doesn't even boot the preview server), so
`npm run test:visual` on a plain host is a green no-op, never a font-mismatch red.

## Global constraints

- **No new dependencies.** Reuses the existing `@playwright/test`, the
  `e2e/fixtures` selectors + `clock` helper, and the `vite preview` foundation
  from stage 1. This program exists to vet Dependabot majors on green — every
  devDep is another surface the suite must be trusted to vet.
- **Determinism is the whole game.** Any per-run variation (real-time countdown,
  RNG clue regeneration, unsettled fonts) would make a baseline flake. The specs
  freeze the clock (`page.clock.install`), keep the mid-game advance below the
  15 s clue-regen floor, and wait on `document.fonts.ready` before every capture.
  The build-version `b<n>` span doesn't render in a `preview` build (no
  `VITE_APP_VERSION`), and the rules version is a static string — no masking
  needed.
- **Isolated from the e2e suite.** The default `playwright.config.ts`
  (`testDir: ./e2e/tests`) never picks up `e2e/visual/`, so `npm run test:e2e`
  is unaffected.

## Tasks

- [x] **`playwright.visual.config.ts`** — separate config: `testDir ./e2e/visual`,
  single Desktop-Chrome project (fixed 1280×720), `retries: 0`, `workers: 1`.
  `expect.toHaveScreenshot`: `animations: 'disabled'`, `caret: 'hide'`,
  `maxDiffPixelRatio: 0.01`. The `vite preview` webServer is defined **only**
  inside the pinned image (gated on `PLAYWRIGHT_VISUAL=1` + Linux) so on-host
  runs don't waste a build before skipping.
- [x] **`e2e/visual/visual.spec.ts`** — thirteen captures with a describe-level
  `test.skip` guard on the same gate. Deterministic state setup via the shared
  `clock` fixture and `selectors`; the frozen clock means no ticks fire, so
  timers hold and the RNG-driven clue regeneration never runs. Coverage:
  - initial screen; mid-game (easy, in progress); started on medium and hard
    (per-level goal counts and initial timers, running controls);
  - paused (timers held, controls re-enabled); one clue left (general enabled,
    specific disabled — the affordance boundary);
  - game-over dialog (loss) — surface only, because running the feed timer to 0
    accumulates an RNG-driven clue count that would flake a full-page shot;
  - won on easy/medium/hard — **full page**: the win is immediate (log the
    successes back-to-back, clock frozen, no ticks), so clues stay at 3 and the
    whole board is deterministic. This verifies the dialog's positioning over the
    board (the loss can't, but shares the same `.mdc-dialog` layout). The won
    dialog also shows the points block (a loss hides it), so each level differs:
    base points 1/3/8, time points 30/36/42;
  - the rules modal ×3: top, scrolled to the promo list, and one promo
    `<details>` expanded (waiting on the image bytes) to verify the collapsible
    reveals its image and content.
- [x] **Scripts** — `test:visual` (compare; the inner Playwright command, run by
  CI and auto-skipping on a host) and `test:visual:update` (regenerate baselines
  inside the Docker image; needs Docker), mirroring the lime-elements workflow.
- [x] **CI job** — a dedicated `visual` job in `ci.yml` running inside
  `mcr.microsoft.com/playwright:v1.59.1-jammy` (`PLAYWRIGHT_VISUAL=1`): `npm ci`
  → `npm run build` → `npm run test:visual`, uploading the report + any
  first-run baselines on failure.
- [x] **Baseline regeneration without local Docker** — the team has no container
  runtime, so `.github/workflows/visual-baselines.yml` (`workflow_dispatch`)
  regenerates baselines in the pinned image and commits them back to the branch.
  This is the Docker-less equivalent of `test:visual:update` and how the initial
  baselines are seeded.

## Seeding the initial baselines

No baselines exist on first push, so the `visual` CI job fails once (Playwright
writes the missing PNGs and reports failure) and uploads them as the
`visual-regression-baselines` artifact. Commit those PNGs to the branch (or, once
this file is on `dev`, run the `Visual regression baselines` workflow) and the
re-run compares green.

## Out of scope

Broadening visual coverage to every screen — stage 4 establishes the pattern on
the key states; widening it is follow-up, per the design's non-goals.
