# Add a Fallow static-analysis check to CI

**Date:** 2026-07-03
**Status:** Approved (design)
**Scope:** `upstream` repo only. Fork sync is a separate, unrelated task.

## Goal

Add [`fallow-rs/fallow`](https://github.com/fallow-rs/fallow) — a Rust static-analysis
tool for TS/JS — as a pull-request check. Fallow detects dead code, duplication,
complexity hotspots, circular dependencies, and dependency-hygiene issues. We use its
`audit` command, which returns a pass/warn/fail verdict **on the code a PR changes**
(comparing HEAD against the PR's base branch). The intent is for this verdict to
**eventually gate merges** (including Dependabot PRs), but not yet — see Rollout.

> **Note on scope.** `audit` is a *changed-code* gate, not a whole-repo scanner — even
> with `--gate all` it only analyzes files the PR touches ("Audit scope: N changed
> files"). A one-time whole-repo scan of the current code was run during design to see
> where things stand; its baseline is recorded in the appendix. A recurring whole-repo
> check would be a *different* command (`command: ''`, which runs all analyses base-free)
> — deliberately not adopted here.

## Design

A new `fallow` job in `.github/workflows/ci.yml`, on the existing `pull_request → dev`
trigger, alongside `build` / `visual` / `commitlint` / `autosquash`.

```yaml
  fallow:
    name: Fallow audit
    permissions:
      contents: read
      pull-requests: write        # post the summary comment
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          persist-credentials: false   # matches the artipacked guard on the other jobs
          fetch-depth: 0               # audit needs base-branch history (see below)
      - uses: fallow-rs/fallow@e36026dfc0f00bfdf8dab889efc58ab86e5ec466 # v2.104.0
        with:
          command: audit
          comment: true                 # sticky PR summary comment
          # gate defaults to new-only → fails only on issues the PR introduces
          # fail-on-issues defaults to true → the job goes red on an issues verdict
          # auto-changed-since defaults to true → feeds audit the PR base as its ref
```

### Decisions

- **Blocking, but not required (yet).** `fail-on-issues` defaults to `true`, so an
  issues/fail verdict turns the check red. The job is deliberately **not** added as a
  required status check. We open this PR, read the verdict on the current code, then
  decide whether to make it required (a branch-protection change, no code change).
- **`audit` is inherently a changed-code command.** It always compares HEAD against the
  PR's base branch and returns a verdict plus an attribution split (issues the PR
  *introduced* vs *pre-existing*). It therefore **requires base-branch history** — a
  shallow checkout makes it fail with "could not detect base branch". Hence
  `fetch-depth: 0`, and `auto-changed-since` left at its default (`true`) so the action
  feeds audit the PR base (`PR_BASE_SHA`) as the comparison ref.
- **Gate on introduced issues (`gate: new-only`, the default).** This fails a PR only on
  issues it *introduces*, ignoring pre-existing debt in files it happens to touch — the
  right semantics for gating PRs and Dependabot bumps without punishing them for old
  findings. (`gate: all` would count pre-existing issues in changed files too; we don't
  want that here. Neither gate mode turns `audit` into a whole-repo scan.)
- **Runs on all PRs, including Dependabot.** Unlike `commitlint`/`autosquash`, this job
  does *not* skip Dependabot — gating Dependabot PRs is a primary reason for adding it.
  It's harmless noise until the check is made required.
- **No build/node step.** Fallow is a self-contained binary doing static analysis; it
  doesn't need `npm ci`. Just checkout + the action.
- **No SARIF for v1.** Keeps it simple. `sarif: true` + `security-events: write` can be
  added later to populate the Code Scanning tab.
- **Pinned by SHA** (`e36026d…` = `v2.104.0`) with a version comment, matching this
  repo's convention that every action is SHA-pinned.

## Rollout

1. Open this PR; the new `fallow` job runs (non-required). Because this PR changes no
   TS/JS, the changed-code audit passes with no findings — expected.
2. Once merged, the gate is live on future PRs: it fails only on issues a PR introduces.
3. Decide separately whether to make it a required check (branch protection). Until then
   it can't block merges — including Dependabot's.

## Out of scope

- Making the check required (branch protection).
- Adding a merge queue. The job's `merge_group` guard skips fallow with a green
  result, so if a queue is ever added *and* fallow (or commitlint/autosquash) is
  made a required check, that pairing must be revisited to decide whether these
  should gate the queue rather than pass it vacuously.
- Syncing the fork's default branch with upstream (separate task).
- SARIF / Code Scanning integration.
- Cleaning up the pre-existing findings in the baseline below (tracked separately).

## Appendix: whole-repo baseline (2026-07-03)

One-time full scan of the current code via the base-free command (`npx fallow` — runs all
analyses over the whole repo), recorded so we know where we stand even though the CI gate
only looks at changed code. Not blocking anything; some entries are likely noise.

Vital signs: `total_loc=4223`, `maintainability_avg=92.4`, `dead_export_pct=18.3`,
`circular_dep_count=0`, `unused_dep_count=0`, duplication clone groups = 0.

**Dead code (16):**
- Unused files: `src/components/app-home/app-home.scss`, `src/test/setup.ts`
  (the latter is the vitest setup file — referenced by config, not imported; likely a
  false positive).
- Unused exports: `src/logic/gameState.ts:POINTS_PER_TEN_SECONDS`; and in
  `src/rules/game-rules.ts`: `anachrony`, `trickerion`, `petrichor`, `daysOfIre`,
  `nightsOfFire`, `redacted`, `microfilms`, `diceSettlers`, `kitchenRush`, `tashKalar`.
- Unresolved import: `src/components/app-home/app-home.scss:1` → `../../variables`
  (sass import fallow can't resolve; likely a false positive).
- Unlisted deps: `@material/dialog`, `@material/icon-button`.

**Health (2 high-complexity functions):**
- `src/logic/gameReducer.ts:38 gameReducer` — cyclomatic 24, cognitive 28.
- `src/App.tsx:28 App` — cyclomatic 9, cognitive 27.
