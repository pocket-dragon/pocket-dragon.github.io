# Per-PR preview deploy for manual testing

**Date:** 2026-07-19
**Status:** Designed — not yet implemented
**Scope:** `upstream` repo (one new workflow + one new secret), plus a **new GitHub
org** `pocket-dragon-pr-preview` owning a Pages repo used purely as a static host.
The `fork` (staging) and `upstream` (production) deploy paths are unchanged.

## Goal

Give a **deployed, real-URL preview of a PR's build** so the app can be tested by
hand in a browser before the PR is merged — on GitHub Pages, so the environment
matches production as closely as possible.

Explicitly **manual testing only**: no automated tests run against the preview, and
the preview never gates merge. The existing safety net is untouched — `ci.yml`
(runner-built bundle: unit / e2e / visual / offline / fallow / commitlint) still
gates PRs, and `orchestrate-deploy.yml` still smoke-tests the real staging deploy
after merge, before promoting to production.

## Background: environments today

- **One Pages site per repo.** Two repos already use theirs:
  - `upstream` = `pocket-dragon/pocket-dragon.github.io` → **production**
    (https://pocket-dragon.github.io/), Actions-source Pages via `deploy.yml`.
  - `fork` = `adrianschmidt-bot/adrianschmidt-bot.github.io` → **staging**
    (https://adrianschmidt-bot.github.io/), Actions-source Pages, deployed
    post-merge by `orchestrate-deploy.yml`.
- Both real Pages URLs are therefore already taken, and both serve at the **root**
  of a user/org `*.github.io` site. Production's build uses Vite's **default
  absolute base `/`** (no `base` set in `vite.config.ts`): assets at `/assets/...`,
  service-worker scope `/`, manifest `start_url: '/'`.
- PRs on `upstream` come from **branches in the same repo** (human work) or from
  **Dependabot**. There are effectively no external-fork PRs.

To get a **third** root-served Pages URL, a third `*.github.io` repo is needed —
and since `adrianschmidt-bot` already spends its user-site on staging, that means a
**new org** whose `<org>.github.io` repo serves at root.

## Design

### Chosen approach: dumb static host in a new org, pushed from a PR workflow

- **New org `pocket-dragon-pr-preview`**, owning repo
  **`pocket-dragon-pr-preview.github.io`** → preview URL
  **https://pocket-dragon-pr-preview.github.io/** (root).
- That repo holds **no application source**. It is a **branch-source** Pages host:
  a workflow in `upstream` builds the PR and publishes the built `dist/` to the
  repo's Pages branch (`gh-pages`, root). Pushing that branch triggers GitHub's own
  `pages-build-deployment` on the preview repo — no build logic lives there.
- Because the site serves at **root**, the ordinary `npm run build` (absolute base
  `/`) is deployed **unchanged**. Base path, SW scope `/`, and `start_url: '/'` are
  **identical to production**. The only difference from prod is the hostname — and a
  distinct origin means the preview's service worker and caches are cleanly
  isolated from staging and prod, so testing it can't poison the real installs.

### The preview workflow (`.github/workflows/preview-deploy.yml`, in `upstream`)

```
push to a human PR branch
        │
        ▼
preview-deploy.yml   (on: pull_request [opened, synchronize, reopened])
        │
  guard: skip if actor == 'dependabot[bot]'
  guard: skip if head.repo.full_name != github.repository   (fork PRs — no secrets)
        │
  1. checkout PR head
  2. set-up-node → npm ci
  3. npm run build            (absolute base '/', VITE_APP_VERSION = preview id)
  4. publish dist/ → pocket-dragon-pr-preview.github.io  gh-pages root
     using PREVIEW_DEPLOY_TOKEN
        │
        ▼
   https://pocket-dragon-pr-preview.github.io/   (live after Pages build, ~1 min)
```

- **Trigger:** `pull_request`, types `opened, synchronize, reopened`. Auto-deploys
  on **every push** to an eligible PR — no comment, no label, no manual step
  (decision: convenience over collision-proofing; see "Single root site" below).
- **Guards / why secrets are safe:** the two `if` guards mean the job only ever runs
  for **our own human branches**. `pull_request` from a **same-repo** branch **does**
  expose secrets (only fork-originated PRs have them withheld), so `PREVIEW_DEPLOY_TOKEN`
  is available without resorting to `pull_request_target` and its untrusted-checkout
  hazards. Dependabot is skipped by actor; fork PRs by head-repo check.
- **Build identifier:** set `VITE_APP_VERSION` to a preview marker (e.g.
  `pr<number>-<short-sha>`) so the in-app build indicator makes clear you're looking
  at a preview build, not staging or prod.
- **Publish step:** publish `dist/` to the preview repo's `gh-pages` branch with a
  pinned publish action (e.g. `peaceiris/actions-gh-pages`) authenticated by
  `PREVIEW_DEPLOY_TOKEN`; a hand-rolled `git` force-push of the built tree using the
  token (mirroring the `git push https://x-access-token:…` style in
  `orchestrate-deploy.yml`) is an acceptable alternative. Each deploy **replaces**
  the whole site (single-PR root model), so a force-push / clean publish is correct.
- **Concurrency:** `concurrency: { group: preview-${{ github.event.pull_request.number }},
  cancel-in-progress: true }` so rapid pushes to one PR don't stack builds.
- **Not a required check.** The deploy is informational; a failed or absent preview
  never blocks merge, matching "manual testing only."

### Token

`PREVIEW_DEPLOY_TOKEN` — a **fine-grained PAT**, resource owner
`pocket-dragon-pr-preview`, repo access limited to
`pocket-dragon-pr-preview.github.io`, permission **Contents: read/write** (enough to
push the `gh-pages` branch; branch-source Pages needs no Pages-API permission).
Stored as an **Actions secret in the `upstream` repo**. The org must have
fine-grained PAT access enabled.

## Out of scope (explicitly deferred)

- **Automated tests against the preview** and **merge-queue-gated real-deploy
  testing.** Considered and deferred; a future project could add a `merge_group`
  check that deploys the merge candidate and runs e2e against the live URL (`ci.yml`
  already no-ops the right jobs on `merge_group`). Not now.
- **Subpaths / multiple concurrent previews.** Not needed — Dependabot is excluded
  and there is a single human developer, so parallel previews are a deliberate,
  self-aware exception rather than the norm.
- **Dependabot previews.** Skipped by design (dependency bumps don't need a manual
  look, and Dependabot's restricted secret access would complicate the deploy).
- **Cleanup / idle redeploy.** None. A single root site has nothing per-PR to tear
  down, and redeploying `main` on close is pure work for no value.

## Single root site: the one accepted trade-off

There is **one** preview URL shared across all open PRs. If two human PRs are pushed
in parallel, the **last deploy wins** and the site silently reflects whichever PR
built most recently. This is accepted knowingly: with one human developer and one
coding agent, parallel PRs only happen when deliberately created, and in that case
the developer is aware the root preview is contended. Documented here so the
behavior is never a surprise.

Secondary note: there is a short delay (~1 min) between the workflow's branch push
and the preview being live, because GitHub's `pages-build-deployment` runs after the
push.

## Manual setup (human-only, one time)

1. Create org **`pocket-dragon-pr-preview`** (personal account; contact email is
   your own — it need not match `pocket-dragon`, and the personal-vs-business choice
   is non-functional).
2. Create repo **`pocket-dragon-pr-preview.github.io`** in that org (can be empty;
   the workflow creates/updates the `gh-pages` branch).
3. Set the repo's **Pages source** to branch **`gh-pages`**, root.
4. Enable **fine-grained PAT access** for the org, create the scoped
   `PREVIEW_DEPLOY_TOKEN` (Contents: RW on that repo), and add it as an Actions
   secret in the `upstream` repo.
5. (Optional) Accept the bot's org invite so `gh`-based config help is possible
   later — not required for the deploy itself.

## Alternatives considered

- **Reuse the fork's Pages** for previews — impossible without giving up staging
  (one Pages site per repo).
- **A project repo under `adrianschmidt-bot`** (e.g. `…/previews`) — serves at a
  **subpath** `…github.io/previews/…`, breaking root/base-path parity with prod. The
  new-org root site exists specifically to avoid that.
- **Subpaths (`/pr-<n>/`) with per-PR `--base` rebuilds** — the standard way to run
  many concurrent previews, but introduces a base-path difference from prod and is
  unnecessary here (Dependabot excluded, single developer).
- **Third-party host (Cloudflare Pages / Netlify)** — native per-PR preview URLs and
  far less workflow code, rejected to avoid an external dependency and any hosting
  environment drift from GitHub Pages.
- **Per-PR automated tests as a required check** — closest to the original ask, but
  needs Dependabot token/security handling and re-runs the suite against a remote URL
  on every push; deferred with merge-queue testing above.
