# Fully automate the staging → production deploy pipeline

**Date:** 2026-07-05
**Status:** Implemented (2026-07-05, PR #102)
**Scope:** `upstream` repo (new orchestrator workflow + small `deploy.yml` edit) and
`fork` repo (same small `deploy.yml` edit, arrives via the normal sync).

## Goal

Replace the two manual steps in the current release flow — syncing `upstream/main`
to the fork and hand-dispatching each Pages deploy — with a single **hands-off**
pipeline. When a PR merges to `upstream/main`, the app should reach staging, get
smoke-tested there, and (only if green) reach production automatically, with **no
human click**. A human is involved only when something fails.

This fits the app's maintenance-mode reality: no feature development, the goal is
just keeping it alive and reachable for people who own the physical game. Full
automation is preferred over preserving a manual "confirm in staging" gate, because
the checks that gate justified (PR CI + a real-browser smoke test of the deployed
artifact) can run automatically.

## Background: the pipeline today

- **Two repos, both default branch `main`** (renamed from `dev` 2026-07-05):
  - `upstream` = `pocket-dragon/pocket-dragon.github.io` → **production** Pages
    (https://pocket-dragon.github.io/).
  - `fork` = `adrianschmidt-bot/adrianschmidt-bot.github.io` → **staging** Pages
    (https://adrianschmidt-bot.github.io/). GitHub Pages is one site per repo, so
    the fork is the only way to get a second real Pages URL to test against.
- **Both repos deploy via `deploy.yml`** — identical, `workflow_dispatch`-only,
  `build_type=workflow` (Actions-native, no publish branch). It runs `npm ci`,
  `npm run build` with `VITE_APP_VERSION=b${{ github.run_number }}`, then
  `upload-pages-artifact` + `deploy-pages`.
- **Manual flow today:** merge PR → locally fast-forward `fork/main` from
  `upstream/main` and push → dispatch fork `deploy.yml` (staging) → eyeball →
  dispatch upstream `deploy.yml` (production).

## Design

### Chosen approach: single orchestrator in upstream, pure glue

One new workflow, `.github/workflows/orchestrate-deploy.yml`, lives in **upstream**
and contains the entire pipeline top-to-bottom. It **builds nothing itself** — it
only pushes code and dispatches the existing `deploy.yml` in each repo, then waits
and smoke-tests. This keeps `deploy.yml` as the single source of build/deploy truth
in each repo, and makes the whole pipeline one readable file in the production repo
(the property that matters most in maintenance mode).

Two alternatives were rejected: **event-chaining** across both repos via
`repository_dispatch` callbacks (logic split across two repos and two files, awkward
to trace) and **fork-driven orchestration** (inverts ownership — staging repo
controlling production). See "Alternatives considered".

### Flow

```
merge to upstream/main
        │
        ▼
orchestrate-deploy.yml   (on: push → main;  also workflow_dispatch for manual re-run)
        │
  1. push upstream/main → fork/main             [FORK_DEPLOY_TOKEN]
  2. dispatch fork deploy.yml (correlation id)  [FORK_DEPLOY_TOKEN]   → staging Pages
  3. poll the fork run to completion            [FORK_DEPLOY_TOKEN]
  4. smoke-test STAGING url (real browser)
  5. dispatch upstream deploy.yml (corr. id)    [GITHUB_TOKEN]        → production Pages
  6. poll the upstream run to completion        [GITHUB_TOKEN]
  7. smoke-test PRODUCTION url (real browser)
        │
   any step fails ──► open-or-update issue labeled `deploy-failure`, then fail
   all green ───────► close any open `deploy-failure` issue
```

### Component details

**1. Trigger.** `on: push: branches: [main]` (every merge, since the repo uses
rebase-merge) plus `workflow_dispatch:` so the whole chain can be re-run by hand.
A `concurrency: { group: deploy-pipeline, cancel-in-progress: false }` block
serializes runs so two merges in quick succession never produce two overlapping
production deploys; the second waits for the first.

**2. Sync push to the fork.** The orchestrator checks out `upstream/main` and pushes
it to `fork/main` using `FORK_DEPLOY_TOKEN`:

```
git push https://x-access-token:${FORK_DEPLOY_TOKEN}@github.com/adrianschmidt-bot/adrianschmidt-bot.github.io.git HEAD:main
```

This is always a fast-forward in normal operation (the fork's `main` only ever
receives pushes from this orchestrator). A non-fast-forward push failure (someone
committed to `fork/main` by hand) surfaces as a pipeline failure → issue, rather
than being force-resolved. The token needs **Contents: write** (the push),
**Actions: write** (dispatch + read runs), and **Workflows: write** — the pushed
tree includes `.github/workflows/`, and a fine-grained PAT cannot push commits that
touch workflow files without it. It is scoped to the fork repo only.

**3–6. Dispatch + poll each deploy.** `deploy.yml` gains a `workflow_dispatch` input
`correlation_id` and a `run-name` that surfaces it, so the orchestrator can find the
exact run it started (dispatch does not return a run ID). The staging deploy is
dispatched in the fork with `FORK_DEPLOY_TOKEN`; the production deploy is dispatched
in upstream with the default `GITHUB_TOKEN` (same-repo dispatch needs only the
built-in `actions: write`). Each dispatch is followed by a poll loop that resolves
the correlated run and waits for `completed`, failing the pipeline on a non-`success`
conclusion.

**4 & 7. Smoke test — real browser, not curl.** The app is a client-rendered PWA:
`curl` of `index.html` does not contain the runtime-rendered title. So the smoke
test reuses the Playwright setup already proven in `up-check.yml` (cache browsers,
`npx playwright install`, run a Node script) and runs a **parameterized**
`check-website.js` against the target URL. The script currently hardcodes the
production URL; it will read the URL from an env var (`SMOKE_URL`), defaulting to the
production URL so the existing `up-check.yml` usage is unchanged. It waits for
`.mdc-top-app-bar__title` to contain "Pocket Dragon", with a generous timeout to
absorb Pages CDN propagation lag after a fresh deploy.

**Staging build-version note.** `VITE_APP_VERSION` is `b${{ github.run_number }}`,
and `run_number` is per-repo, so staging and production show different build badges
for the same commit. That is existing, acceptable behavior; the smoke test asserts
content, not a specific build number.

**Failure handling → GitHub issue.** A final job (`if: failure()`) uses `gh` to
open-or-update a single issue in upstream labeled `deploy-failure`: if an open one
exists it adds a comment (run URL + which stage failed), otherwise it creates one.
On a fully successful run, a closing step comments and closes any open
`deploy-failure` issue. This keeps failures tracked and visible without email or
healthchecks.io noise (healthchecks.io stays wired to `up-check.yml` only). The job
needs `issues: write`.

**Break-glass.** The manual `deploy.yml` dispatch in either repo remains valid for
deploying by hand, and the orchestrator's own `workflow_dispatch` re-runs the whole
chain. The old local "fast-forward fork and push" step is simply retired.

### Permissions summary

| Token | Used for | Scopes |
|-------|----------|--------|
| `FORK_DEPLOY_TOKEN` (fine-grained PAT, fork repo only) | push to `fork/main`, dispatch + poll fork `deploy.yml` | Contents: RW, Actions: RW, Workflows: RW |
| `GITHUB_TOKEN` (built-in) | dispatch + poll upstream `deploy.yml`, open/close issue | `actions: write`, `issues: write` (set in the workflow) |

### Files changed

- **New** `upstream/.github/workflows/orchestrate-deploy.yml` — the orchestrator.
- **Edit** `.github/workflows/deploy.yml` (both repos, via sync) — add the
  `correlation_id` `workflow_dispatch` input and a `run-name`. No change to the build
  or deploy steps.
- **Edit** `.github/workflows/check-website.js` — read the target URL from `SMOKE_URL`
  (default = production URL). Backward-compatible with `up-check.yml`.
- **One-time manual setup (done):** `FORK_DEPLOY_TOKEN` secret added to upstream.
- **One-time manual setup (pending):** create the `deploy-failure` label in upstream
  (or let the issue-creation step create it on first use).

## Testing / validation

Because this is CI wiring, validation is by controlled runs rather than unit tests:

1. **Dry-run the pieces in isolation first** — a throwaway branch/workflow that only
   does the fork push + fork dispatch + poll + staging smoke test (stops before
   production), to prove the token, correlation-id matching, and smoke test work
   without risking a bad production deploy.
2. **Induce a staging smoke-test failure** (temporarily point `SMOKE_URL` at a URL
   that will not match) to confirm the pipeline stops before production and opens the
   `deploy-failure` issue.
3. **Full green run** on a trivial no-op commit to `main`; confirm staging then
   production both deploy, both smoke tests pass, the issue (if any) closes, and the
   production site serves the new build.
4. **Concurrency check** — push two commits close together; confirm the second run
   queues behind the first rather than overlapping.

## Risks & mitigations

- **Token expiry.** When `FORK_DEPLOY_TOKEN` lapses, steps 1–3 fail and the pipeline
  opens an issue — a loud, visible failure, not a silent one. GitHub also emails the
  owner before expiry.
- **Pages propagation lag.** A deploy run finishing does not guarantee the CDN has
  the new asset instantly; the smoke test's wait/timeout absorbs a few seconds. If
  flakiness appears, add a short retry loop around the smoke test.
- **Dispatch/run correlation race.** Mitigated by the `correlation_id` input + the
  `concurrency` group (runs never overlap), so "the run carrying my id" is
  unambiguous.
- **Accidental fork-side commits.** A non-fast-forward push fails loudly rather than
  being force-overwritten; resolution is manual and intentional.
- **A push to `fork/main` triggering fork workflows.** Checked: the fork's `ci.yml`
  is `pull_request`-only, `deploy.yml`/`visual-baselines.yml` are dispatch-only, and
  `up-check.yml` is schedule-only — so the sync push triggers nothing on the fork.
  Only the explicit `deploy.yml` dispatch deploys staging.

## Alternatives considered

- **Event-chained across repos** (`repository_dispatch` upstream→fork→upstream). More
  "event-driven", but the logic lives in two repos and two files, needs auth in both
  directions, and is hard to trace when it breaks. Rejected for maintenance-mode
  legibility.
- **Fork-driven** (mirror upstream→fork automatically, fork orchestrates prod).
  Inverts ownership — the staging repo would control production — and still needs a
  cross-repo token. Rejected.
- **Keep a human gate** (auto-staging, one-click or manual prod). Viable, but the
  automated PR CI + deployed-artifact smoke test cover what the human eyeball
  covered, and hands-off was the explicit goal.
- **Orchestrator inlines the build/deploy** instead of dispatching `deploy.yml`.
  Rejected: duplicates the build steps into a third place and lets them drift from
  the two `deploy.yml` files.
