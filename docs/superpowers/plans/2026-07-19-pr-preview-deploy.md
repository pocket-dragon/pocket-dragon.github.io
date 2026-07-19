# Per-PR Preview Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a workflow that deploys each human PR's build to the PR-preview Pages host (`pocket-dragon-pr-preview.github.io`) so it can be tested by hand in a real browser before merge.

**Architecture:** A single new `pull_request` workflow in the `upstream` repo builds the PR head with the normal (absolute-base) Vite build and publishes `dist/` to the `gh-pages` branch of the external preview repo using the `PREVIEW_DEPLOY_KEY` SSH deploy key. It is manual-testing only: it runs no automated tests and is not a required check. Dependabot and fork PRs are skipped so the job only runs for our own same-repo human branches (which have secret access).

**Tech Stack:** GitHub Actions, `peaceiris/actions-gh-pages@v4.1.0` (SSH deploy-key publish to an external repo), the repo's existing `./.github/actions/set-up-node` composite (Node v22 from `.nvmrc`), Vite build.

## Global Constraints

- **Pin every third-party action by full commit SHA with a `# vX.Y.Z` comment** — repo convention.
- **American English** in all identifiers, comments, and copy.
- **Conventional Commits** for messages; **rebase-and-merge**, never squash; atomic commits.
- **Node v22** via `.nvmrc` (already handled by `set-up-node`).
- **`persist-credentials: false`** on `actions/checkout` (artipacked guard) — this job never pushes via git credentials; the deploy key handles publishing.
- Preview URL: **https://pocket-dragon-pr-preview.github.io/**. Publish branch: **`gh-pages`**, root.
- Publish credential: secret **`PREVIEW_DEPLOY_KEY`** (already provisioned in `upstream`).
- Pinned publish action SHA: `peaceiris/actions-gh-pages@84c30a85c19949d7eee79c4ff27748b70285e453 # v4.1.0`.

## Testing approach (read first)

A GitHub Actions workflow has no local unit-test harness. It is validated in two stages:
1. **Static:** `actionlint` (installed, v1.7.12) parses and type-checks the workflow YAML — this is the "does it fail" / "does it pass" cycle for Task 1.
2. **Live:** the workflow runs on its *own* PR (a new `pull_request` workflow added in a PR runs on that PR, because `pull_request` uses the workflow file from the PR head). Task 2 opens the PR, watches the run, and curls the preview URL to confirm the real app replaced the placeholder. This is the acceptance test.

## File structure

- **Create** `.github/workflows/preview-deploy.yml` — the entire feature. One workflow, one job, self-contained. No app code changes (the preview reuses the ordinary `npm run build`).

There is no source in the preview repo and no shared code to factor out, so the feature is a single focused file.

---

### Task 1: Add and statically validate the `preview-deploy` workflow

**Files:**
- Create: `.github/workflows/preview-deploy.yml`

**Interfaces:**
- Consumes: repo secret `PREVIEW_DEPLOY_KEY` (SSH private key, provisioned); the composite action `./.github/actions/set-up-node`; the `npm run build` script (produces `dist/` with absolute base `/`).
- Produces: on each push to an eligible PR, a force-updated `gh-pages` branch on `pocket-dragon-pr-preview/pocket-dragon-pr-preview.github.io` containing the built site.

- [ ] **Step 1: Write the workflow file**

Create `.github/workflows/preview-deploy.yml` with exactly this content:

```yaml
name: Preview deploy

# Deploy each human PR's build to the PR-preview Pages host so it can be tested
# by hand in a real browser before merge. Manual testing only: this runs no
# automated tests and is not a required check, so a failed or absent preview
# never blocks merge. Design:
# docs/superpowers/specs/2026-07-19-pr-preview-deploy-design.md
on:
  pull_request:
    types: [opened, synchronize, reopened]

# Only the checkout needs a token; the publish step pushes with the
# PREVIEW_DEPLOY_KEY SSH deploy key, not GITHUB_TOKEN.
permissions:
  contents: read

# One preview build per PR at a time; a newer push cancels an in-flight build.
concurrency:
  group: preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  preview:
    # Skip Dependabot (dependency bumps don't need a manual look, and Dependabot's
    # restricted secret access can't reach PREVIEW_DEPLOY_KEY) and fork PRs (a
    # pull_request from a fork gets no secrets, so the deploy key would be absent).
    # Both guards mean this only runs for our own same-repo human branches, which
    # DO get secret access on pull_request. The repository guard keeps this dormant
    # on the fork (orchestrate-deploy.yml mirrors this file there), matching the
    # same guard on orchestrate-deploy.yml, so a PR opened on the fork — which has
    # no PREVIEW_DEPLOY_KEY — is skipped rather than failing red at the publish step.
    if: >-
      github.repository == 'pocket-dragon/pocket-dragon.github.io' &&
      github.actor != 'dependabot[bot]' &&
      github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    # A non-required preview job runs on every PR push; cap it so a hung npm ci
    # or build can't tie up a runner for the 6h default.
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0
        with:
          # Build the PR's actual head commit, not the pull_request merge ref.
          ref: ${{ github.event.pull_request.head.sha }}
          # This job never pushes via git credentials (the deploy key handles the
          # publish), so keep the token out of .git/config (artipacked guard).
          persist-credentials: false
      - uses: ./.github/actions/set-up-node
      # Short head SHA for a compact in-app build marker (e.g. pr42-49a8b60).
      - name: Compute short SHA
        id: vars
        run: echo "sha_short=$(git rev-parse --short HEAD)" >> "$GITHUB_OUTPUT"
      - name: Build with a preview build marker
        run: |
          echo "Building $VITE_APP_VERSION"
          npm ci
          npm run build
        env:
          # Distinguishes preview builds from staging/prod in the in-app indicator.
          VITE_APP_VERSION: "pr${{ github.event.pull_request.number }}-${{ steps.vars.outputs.sha_short }}"
      - name: Publish dist/ to the preview Pages host
        uses: peaceiris/actions-gh-pages@84c30a85c19949d7eee79c4ff27748b70285e453 # v4.1.0
        with:
          # SSH deploy key: write-enabled on the preview repo only, private half in
          # this repo's Actions secrets. Credential-model rationale in the design spec
          # ("Credential: SSH deploy key (not a PAT)").
          deploy_key: ${{ secrets.PREVIEW_DEPLOY_KEY }}
          external_repository: pocket-dragon-pr-preview/pocket-dragon-pr-preview.github.io
          publish_branch: gh-pages
          publish_dir: ./dist
          # Throwaway host: keep gh-pages a single commit and force-replace it each
          # deploy, so the branch never accumulates history.
          force_orphan: true
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
          commit_message: "deploy: PR #${{ github.event.pull_request.number }} (${{ steps.vars.outputs.sha_short }})"
      # Surface where to look and which build marker to expect on the workflow run
      # summary (via the PR's Checks tab).
      # Only runs if the publish above succeeded, so it doubles as a success signal.
      - name: Summarize the preview URL and build marker
        run: |
          echo "Preview: https://pocket-dragon-pr-preview.github.io/  (pr${{ github.event.pull_request.number }}-${{ steps.vars.outputs.sha_short }})" >> "$GITHUB_STEP_SUMMARY"
```

- [ ] **Step 2: Statically validate — run actionlint and expect a clean pass**

Run: `cd /Users/bot/src/pocket-dragon/upstream && actionlint .github/workflows/preview-deploy.yml`
Expected: no output and exit code 0 (actionlint prints nothing on success). If it reports errors, fix the YAML and re-run until clean.

- [ ] **Step 3: Sanity-check the guard and key references by eye**

Confirm in the file: the `if:` names both `dependabot[bot]` and `head.repo.full_name == github.repository`; the publish step uses `secrets.PREVIEW_DEPLOY_KEY` and `external_repository: pocket-dragon-pr-preview/pocket-dragon-pr-preview.github.io`; the action is pinned to `84c30a85c19949d7eee79c4ff27748b70285e453 # v4.1.0`. (No command; a deliberate read-back before commit.)

- [ ] **Step 4: Commit**

```bash
cd /Users/bot/src/pocket-dragon/upstream
git add .github/workflows/preview-deploy.yml
git commit -m "$(cat <<'EOF'
ci: deploy each human PR to the preview Pages host

Add preview-deploy.yml: on pull_request (opened/synchronize/reopened) for
our own same-repo human branches, build the PR head and publish dist/ to
the gh-pages branch of pocket-dragon-pr-preview.github.io via the
PREVIEW_DEPLOY_KEY SSH deploy key. Skips Dependabot and fork PRs. Manual
testing only; not a required check.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01E1LQAHffS8r4gZsVdXw2Uj
EOF
)"
```

---

### Task 2: Live validation via this feature's own PR

**Files:** none (operational verification).

**Interfaces:**
- Consumes: the committed workflow from Task 1; the provisioned preview host (Pages live at the URL, currently serving the placeholder).
- Produces: proof the workflow deploys a real build — the preview URL serves the app, not the placeholder.

- [ ] **Step 1: Push the branch and open the PR**

```bash
cd /Users/bot/src/pocket-dragon/upstream
git push -u origin feat/pr-preview-deploy
gh pr create --repo pocket-dragon/pocket-dragon.github.io --base main \
  --title "ci: per-PR preview deploy for manual testing" \
  --body "Deploys each human PR's build to https://pocket-dragon-pr-preview.github.io/ for manual browser testing before merge. Design + plan under docs/superpowers/. Manual-testing only; not a required check."
```

- [ ] **Step 2: Watch the preview-deploy run to completion**

```bash
# Give GitHub a moment to register the run, then find and watch it.
gh run list --repo pocket-dragon/pocket-dragon.github.io \
  --workflow preview-deploy.yml --branch feat/pr-preview-deploy \
  --json databaseId,status -q '.[0].databaseId'
# Watch that run id:
gh run watch <run-id> --repo pocket-dragon/pocket-dragon.github.io --exit-status
```
Expected: the run succeeds. If the publish step fails with an SSH/permission error, the deploy key is the suspect — see "First-run risk" below.

- [ ] **Step 3: Confirm the preview host now serves the real app, not the placeholder**

The Pages build lags the workflow's `gh-pages` push by ~1 min, so poll:

```bash
for i in $(seq 1 24); do
  body=$(curl -s https://pocket-dragon-pr-preview.github.io/)
  if printf '%s' "$body" | grep -q 'id="root"' && ! printf '%s' "$body" | grep -q 'PR preview host'; then
    echo "PREVIEW OK: real app is served"; break
  fi
  echo "waiting for Pages build ($i)…"; sleep 5
done
curl -s -o /dev/null -w 'HTTP %{http_code}\n' https://pocket-dragon-pr-preview.github.io/
```
Expected: `PREVIEW OK: real app is served` and `HTTP 200`. The served HTML contains `<div id="root">` and `/assets/...` references (the built app) and no longer contains the placeholder string `PR preview host`.

- [ ] **Step 4: Manual browser check (human)**

Open https://pocket-dragon-pr-preview.github.io/ in a browser. Confirm the app loads and works, and that the in-app build indicator shows the preview marker `pr<number>-<short-sha>` (distinct from staging/prod's `b<run_number>`). This is the whole point of the feature — the deployed preview being hand-testable.

- [ ] **Step 5: No commit**

Task 2 changes no files. The PR opened in Step 1 is the real feature PR and stays open for review/merge.

---

## First-run risk (deploy-key push)

The deploy key's public half is registered (write) on the preview repo and its private half is in `PREVIEW_DEPLOY_KEY`, but an actual SSH push over it is first exercised only here (the private key was deleted locally after provisioning, so it couldn't be tested earlier). If Step 2 fails on the publish step:
- Confirm the secret exists: `gh secret list --repo pocket-dragon/pocket-dragon.github.io | grep PREVIEW_DEPLOY_KEY`.
- Confirm the deploy key is present and write-enabled: `gh api repos/pocket-dragon-pr-preview/pocket-dragon-pr-preview.github.io/keys -q '.[] | {title,read_only,verified}'` (expect `read_only: false`, `verified: true`).
- If the key pair is suspect, regenerate: `ssh-keygen -t ed25519 -f key -N ""`, replace the deploy key (delete old id `157713812`, add the new public half), and `gh secret set PREVIEW_DEPLOY_KEY < key`, then delete the local private half.

## Self-review notes

- **Spec coverage:** trigger + types (Task 1 file); Dependabot/fork guards (Step 1 `if`, Step 3 check); root/absolute-base build (reuses `npm run build`, no base override — matches spec); deploy-key publish to `gh-pages` (publish step); build marker (`VITE_APP_VERSION`); not-a-required-check (documented, nothing marks it required); single-root last-write-wins (inherent, no per-PR path); infra already provisioned (Task 2 relies on it). Out-of-scope items (tests-against-preview, merge queue, subpaths, Dependabot previews, cleanup) are absent by design.
- **Placeholders:** none — full workflow YAML and exact commands given.
- **Type/name consistency:** `PREVIEW_DEPLOY_KEY`, `gh-pages`, `pocket-dragon-pr-preview/pocket-dragon-pr-preview.github.io`, and the v4.1.0 SHA are identical across spec, Task 1, and Task 2.
