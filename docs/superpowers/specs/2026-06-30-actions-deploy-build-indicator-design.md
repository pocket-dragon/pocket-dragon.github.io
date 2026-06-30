# Design: GitHub Actions deploy + build-number indicator

Date: 2026-06-30
Status: Approved (pending written-spec review)

## Goal

Two linked changes for the Pocket Dragon companion app:

1. **Migrate deployment from a local script to a GitHub Actions workflow** — for reproducible builds in a clean CI environment and to remove the manual local deploy step. Wanted for its own sake, not only for the indicator below.
2. **Add a build-number indicator** in a low-contrast corner of the app, so it's possible to confirm the latest build has actually loaded past the service-worker cache (the PWA makes this otherwise hard to tell). Mirrors the approach used in the `adrianschmidt/puzzle` app.

## Current state (what we're replacing)

- Deploy is manual: `npm run publishApp` builds locally and force-pushes `dist/` to the deploy branch (`main` upstream / `master` fork) via a git worktree (`setupPublishBranch`).
- GitHub Pages is **legacy/branch-based**: upstream serves from `main`, the fork serves from `master` (the master→main rename was applied upstream but not in the fork — a source of the naming mismatch).
- The fork (`adrianschmidt-bot/adrianschmidt-bot.github.io`) is a **staging area**: its GitHub Pages previews a build before the same goes to production via upstream (`pocket-dragon/pocket-dragon.github.io`).
- `semantic-release` (branch `release`, `@semantic-release/github` only) creates GitHub releases/tags; it is **decoupled** from deployment and stays that way.
- App is React + Vite + `vite-plugin-pwa`. Default branch is `dev`. Node is pinned to v22 (`.nvmrc`). Pages are served at domain root in both repos (user/org pages → `base: '/'`).

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Deploy trigger | **`workflow_dispatch` only** (both repos) | Preserves deliberate, batched releases; `dev` collects Dependabot merges so auto-deploy would ship every merge to production. Same file behaves correctly in both repos: dispatch in fork → staging Pages; dispatch in upstream → production Pages. |
| Publish mechanism | **Actions-native Pages** (`upload-pages-artifact` + `deploy-pages`) | No deploy branch at all → eliminates the `main`/`master` divergence, the `--force-with-lease` push, and the worktree dance. |
| Indicator value | **`b<run_number>`** (e.g. `b42`) | `github.run_number` increments on every workflow run, so it changes on every deploy — even a redeploy of identical code — which is the real cache-bust signal. `b` prefix reads as "build", less cryptic than `#`. |
| Pre-deploy tests | **Build-only** (no test step) | CI already gates everything merged to `dev`; a deploy of `dev` is already-tested code. |
| Per-repo counters | Accepted | `run_number` is per-repo, so staging and production have independent counters (e.g. staging `b7`, prod `b42`). Useful for telling them apart; the URL domain already distinguishes them. |

## Changes

### 1. `.github/workflows/deploy.yml` (new)

- Trigger: `workflow_dispatch`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- `environment: github-pages` with the deployment URL output; a `concurrency` group to prevent overlapping deploys.
- Steps: checkout → setup Node from `.nvmrc` (`node-version-file`) → `npm ci` → `npm run build` with env `VITE_APP_VERSION: "b${{ github.run_number }}"` → `actions/upload-pages-artifact` (path `dist`) → `actions/deploy-pages`.
- Committed to `dev`, so it propagates to the fork on the next sync. Identical in both repos.

### 2. App source (3 small edits)

- `src/vite-env.d.ts` — declare `ImportMetaEnv.VITE_APP_VERSION?: string` (typed access).
- `src/logic/buildVersion.ts` — a `getBuildVersion()` helper that reads `import.meta.env.VITE_APP_VERSION`, returns the **trimmed** value when it is a non-empty string, and `undefined` otherwise (unset/whitespace-only). This keeps the unset/dev guard in one tested place.
- `src/App.tsx` — call `getBuildVersion()` and render `<span className="app-version" aria-hidden="true">{buildVersion}</span>` **only when it returns a value** (absent in `npm run dev` and any non-deploy build). `aria-hidden` keeps the decorative badge out of the accessibility tree.
- `src/App.css` — `.app-version`: `position: fixed`, bottom-left, small font, `pointer-events: none`, `user-select: none`, **very low contrast** (bottom-left so it clears the bottom-right sound-toggle button on mobile).

The indicator's render is presentational, but the unset/trim guard lives in `getBuildVersion()` and is covered by `src/logic/buildVersion.test.ts`; existing unit + e2e suites stay green.

### 3. `package.json`

- Remove the obsolete `publishApp` and `setupPublishBranch` scripts.

### 4. Pages settings (one-time, per repo)

- Flip Pages source from *legacy/branch* to *GitHub Actions* (`build_type: workflow`). Fork: done via API by me. Upstream: done via API, but **confirmed with the user immediately before flipping** (production repo).
- Vestigial `main`/`master` deploy branches are **left in place** (harmless fallback), prunable later.

## Rollout order (safe sequence)

1. Land the source + workflow on `dev` via a normal PR → CI → merge (the established flow).
2. Sync the fork; flip the **fork's** Pages to Actions; run the workflow there; verify `https://adrianschmidt-bot.github.io/` shows the app + `b<n>`; tune contrast.
3. On approval, flip **upstream's** Pages and run the production deploy.

This migration is independent of the pending Vite-8 (#75) / workbox (#69) dependency PRs and is sequenced **first**, so the subsequent Vite-8 staging deploy uses the new workflow and the `b<n>` indicator — giving the "did the new build load?" confirmation directly.

## Risks / notes

- One-time Pages-settings flip per repo; reversible by switching the source back to a branch.
- First Actions deploy must be verified on the fork before upstream — covered by the rollout order.
- `base: '/'` remains correct (both are root-served user/org Pages sites).
- No change to `semantic-release`, `ci.yml`, or `up-check.yml`.
