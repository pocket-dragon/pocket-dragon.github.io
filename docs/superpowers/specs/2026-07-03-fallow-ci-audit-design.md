# Add a Fallow static-analysis check to CI

**Date:** 2026-07-03
**Status:** Approved (design)
**Scope:** `upstream` repo only. Fork sync is a separate, unrelated task.

## Goal

Add [`fallow-rs/fallow`](https://github.com/fallow-rs/fallow) — a Rust static-analysis
tool for TS/JS — as a pull-request check. Fallow's `audit` command detects dead code,
duplication, complexity hotspots, circular dependencies, and dependency-hygiene issues,
and returns a pass/warn/fail verdict. The intent is for this verdict to **eventually gate
merges** (including Dependabot PRs), but not yet — see Rollout.

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
      - uses: fallow-rs/fallow@e36026dfc0f00bfdf8dab889efc58ab86e5ec466 # v2.104.0
        with:
          command: audit
          auto-changed-since: false     # full-repo scan (not just PR-changed files)
          comment: true                 # sticky PR summary comment
          # fail-on-issues defaults to true → the job goes red when issues are found
```

### Decisions

- **Blocking, but not required (yet).** `fail-on-issues` defaults to `true`, so an
  issues/fail verdict turns the check red. The job is deliberately **not** added as a
  required status check. We open this PR, read the verdict on the current code, then
  decide whether to make it required (a branch-protection change, no code change).
- **Full-repo scan** (`auto-changed-since: false`). The action defaults to auto-scoping
  to PR-changed files; since this first PR only touches `ci.yml`, that would show almost
  nothing. Full scan surfaces the true current-code verdict. Revisit changed-file scoping
  once baseline issues are triaged.
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

1. Open this PR; CI runs the new `fallow` job (non-required).
2. Review the audit verdict/comment on the current codebase.
3. Decide: make it a required check now, triage baseline issues first, or switch to
   changed-file scoping. That decision is out of scope for this PR.

## Out of scope

- Making the check required (branch protection).
- Adding a merge queue. The job's `merge_group` guard skips fallow with a green
  result, so if a queue is ever added *and* fallow (or commitlint/autosquash) is
  made a required check, that pairing must be revisited to decide whether these
  should gate the queue rather than pass it vacuously.
- Syncing the fork's default branch with upstream (separate task).
- SARIF / Code Scanning integration.
