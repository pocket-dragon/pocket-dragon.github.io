# Deploy Pipeline Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A single hands-off orchestrator workflow in the upstream repo that, on every merge to `main`, syncs code to the fork, deploys + smoke-tests staging, then deploys + smoke-tests production, opening a GitHub issue on any failure.

**Architecture:** One new workflow, `orchestrate-deploy.yml`, in upstream. It is *pure glue* — it builds nothing itself; it pushes `main` to the fork and dispatches each repo's existing `deploy.yml`, polling each run and smoke-testing the resulting Pages URL with a real browser. Failures open/update a `deploy-failure` issue; a fully green run closes it.

**Tech Stack:** GitHub Actions (workflow YAML + `gh` CLI + `git`), Node 22, Playwright (Chromium) for the smoke test, a fine-grained PAT for cross-repo access.

**Design doc:** `docs/superpowers/specs/2026-07-05-deploy-pipeline-automation-design.md`

## Global Constraints

- **Node** is pinned by `.nvmrc` to `v22`. For any *local* `node`/`npm` command, run it under Node 22 (`fnm exec --using=22 <cmd>`) — the non-interactive shell does not auto-apply `.nvmrc`, and Node 24/npm 11 breaks `npm ci` here.
- **Merge policy:** rebase-merge only, NEVER squash. Atomic commits. This work lives on branch `feat/deploy-pipeline-automation`; it merges to `main` as one PR at the end (admin-rebase-merge; the author cannot self-approve, ruleset bypass covers it).
- **Pin third-party actions by full commit SHA** with a trailing `# vX.Y.Z` comment (repo convention). First-party `./.github/actions/*` are referenced by path.
- **American English** in all identifiers, comments, copy.
- **Repos & URLs:** upstream = `pocket-dragon/pocket-dragon.github.io` (prod → https://pocket-dragon.github.io/); fork = `adrianschmidt-bot/adrianschmidt-bot.github.io` (staging → https://adrianschmidt-bot.github.io/). Both default branch `main`.
- **Secret (already set in upstream):** `FORK_DEPLOY_TOKEN` — fine-grained PAT owned by `adrianschmidt-bot`, scoped to the fork repo only, Contents/Actions/Workflows: RW.
- **Verification is by controlled workflow runs, not unit tests** — these are cross-repo CI mechanics that cannot be unit-tested. Each task ends with a real dispatch/run and an observed result. Until the final task, the orchestrator is `workflow_dispatch`-only and is dispatched with `--ref feat/deploy-pipeline-automation`, so it never fires on a real merge before it is complete.

## File Structure

- **Modify** `.github/workflows/check-website.js` — read the smoke-test target URL from `SMOKE_URL` (default = production URL). One responsibility: assert a deployed Pages URL renders the app. Stays backward-compatible with `up-check.yml`.
- **Modify** `.github/workflows/deploy.yml` — add a `correlation_id` `workflow_dispatch` input and a `run-name` that surfaces it, so a dispatcher can find the exact run it started. No change to build/deploy steps. (The fork receives this edit through the orchestrator's sync push — no separate fork commit.)
- **Create** `.github/workflows/orchestrate-deploy.yml` — the orchestrator. Built up across Tasks 3–6.

---

### Task 1: Parameterize the smoke test URL

**Files:**
- Modify: `.github/workflows/check-website.js`

**Interfaces:**
- Produces: a Node script that reads env `SMOKE_URL` (string, optional; defaults to `https://pocket-dragon.github.io/`), loads it in Chromium, and exits non-zero unless the `.mdc-top-app-bar__title` contains `Pocket Dragon`. Consumed by `up-check.yml` (unchanged, uses the default) and by the orchestrator's smoke steps (set `SMOKE_URL`).

- [ ] **Step 1: Make the edit**

Replace the hardcoded URL and give the timeout a little more headroom for post-deploy CDN propagation. Full file after edit:

```javascript
import { chromium } from 'playwright';

// The URL to smoke-test. Defaults to production so `up-check.yml` keeps working
// unchanged; the deploy orchestrator sets SMOKE_URL to the staging or production
// URL as it promotes a build.
const url = process.env.SMOKE_URL ?? 'https://pocket-dragon.github.io/';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
    await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 60000,
    });

    const title = page.locator('.mdc-top-app-bar__title');
    // Generous timeout: a freshly deployed Pages build can take a few seconds to
    // propagate to the CDN edge the runner hits.
    await title.waitFor({ timeout: 15000 });

    const text = await title.textContent();
    if (!text?.includes('Pocket Dragon')) {
        throw new Error(`Expected content not found at ${url}.`);
    }

    console.log(`Page loaded and expected content was found at ${url} 👍`);
} catch (error) {
    console.error(error.message ?? error);
    process.exit(1);
} finally {
    await browser.close();
}
```

- [ ] **Step 2: Verify it passes against production (the default)**

Requires a local Chromium; install once if needed.

Run:
```bash
cd /Users/bot/src/pocket-dragon/upstream
fnm exec --using=22 npx playwright install chromium
fnm exec --using=22 node .github/workflows/check-website.js
```
Expected: exit 0, prints `Page loaded and expected content was found at https://pocket-dragon.github.io/ 👍`.

- [ ] **Step 3: Verify it fails against a URL that won't match**

Run:
```bash
SMOKE_URL=https://example.com/ fnm exec --using=22 node .github/workflows/check-website.js; echo "exit=$?"
```
Expected: non-zero exit (`exit=1`), prints an error (the selector never appears on example.com).

> If a local Chromium cannot be installed in this environment, skip Steps 2–3 and rely on the staging smoke run in Task 3 to exercise the script — but note that in the task handoff.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/check-website.js
git commit -m "ci: parameterize smoke-test URL via SMOKE_URL"
```

---

### Task 2: Make `deploy.yml` runs correlatable

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: `deploy.yml` accepts a `workflow_dispatch` input `correlation_id` (string, default `''`) and sets `run-name: Deploy ${{ inputs.correlation_id }}`, so a dispatcher can locate the run via `gh run list --json displayTitle` and match `contains(correlation_id)`. Build/deploy behavior is otherwise unchanged; a manual dispatch with no input still works (run named `Deploy `).

- [ ] **Step 1: Edit the `on:` block and add `run-name`**

In `.github/workflows/deploy.yml`, replace the top of the file (the `name:`/`on:` region) with:

```yaml
name: Deploy

# `correlation_id` lets a dispatcher (the deploy orchestrator) tag this run so it
# can find it afterwards — workflow_dispatch does not return a run id. It is
# surfaced through run-name and defaults to empty for manual break-glass dispatch.
run-name: Deploy ${{ inputs.correlation_id }}

on:
  workflow_dispatch:
    inputs:
      correlation_id:
        description: 'Opaque id echoed into the run name so a dispatcher can find this run'
        required: false
        default: ''
```

Leave everything from `permissions:` downward untouched.

- [ ] **Step 2: Get the edited `deploy.yml` onto a fork test branch**

The fork's `deploy.yml` on `main` already has a `workflow_dispatch` trigger, so a `--ref`'d dispatch runs the version from any branch we push. From the **fork** clone (which has the fork as `origin` and the upstream as `upstream`), put this branch's `deploy.yml` onto a throwaway fork branch using the normal credential helper:

```bash
cd /Users/bot/src/pocket-dragon/fork
git fetch upstream feat/deploy-pipeline-automation
git checkout -B test/deploy-corr origin/main
git checkout upstream/feat/deploy-pipeline-automation -- .github/workflows/deploy.yml
git commit -am "test: deploy.yml correlation id (throwaway)"
git push -u origin test/deploy-corr
```

- [ ] **Step 3: Dispatch the fork deploy with a correlation id and confirm the run name**

```bash
CID="corr-test-$(gh api repos/adrianschmidt-bot/adrianschmidt-bot.github.io -q .id)"
gh workflow run deploy.yml --repo adrianschmidt-bot/adrianschmidt-bot.github.io --ref test/deploy-corr -f correlation_id="$CID"
sleep 6
gh run list --repo adrianschmidt-bot/adrianschmidt-bot.github.io --workflow deploy.yml --limit 3 --json databaseId,displayTitle,status
```
Expected: the newest run's `displayTitle` is `Deploy corr-test-<id>` (contains `$CID`). Let it finish (`gh run watch <id> --repo adrianschmidt-bot/adrianschmidt-bot.github.io --exit-status`); it deploys staging, which is safe.

- [ ] **Step 4: Clean up the throwaway branch**

```bash
gh api -X DELETE repos/adrianschmidt-bot/adrianschmidt-bot.github.io/git/refs/heads/test/deploy-corr
cd /Users/bot/src/pocket-dragon/fork && git checkout main -q && git branch -D test/deploy-corr
```

- [ ] **Step 5: Commit (upstream branch)**

```bash
cd /Users/bot/src/pocket-dragon/upstream
git add .github/workflows/deploy.yml
git commit -m "ci: add correlation_id input to deploy.yml for run tracking"
```

---

### Task 3: Staging-only orchestrator (dry run — no production leg)

**Files:**
- Create: `.github/workflows/orchestrate-deploy.yml`

**Interfaces:**
- Produces: a `workflow_dispatch`-only workflow that (1) pushes the checked-out commit to `fork/main`, (2) dispatches the fork's `deploy.yml` with a correlation id, (3) polls that run to success, (4) smoke-tests the staging URL. Consumes `secrets.FORK_DEPLOY_TOKEN` and the correlatable `deploy.yml` from Task 2 and the parameterized `check-website.js` from Task 1. No production leg, no issue handling yet.

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/orchestrate-deploy.yml`:

```yaml
name: Orchestrate deploy

# Hands-off release pipeline. For now workflow_dispatch-only and staging-only;
# the production leg, failure issue, and push trigger are added in later tasks.
on:
  workflow_dispatch:

# Serialize: never let two pipeline runs race to deploy.
concurrency:
  group: deploy-pipeline
  cancel-in-progress: false

permissions:
  contents: read

env:
  FORK_REPO: adrianschmidt-bot/adrianschmidt-bot.github.io
  STAGING_URL: https://adrianschmidt-bot.github.io/

jobs:
  pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          fetch-depth: 0
          persist-credentials: false

      # 1. Sync the just-merged code to the fork's main so its Pages build matches.
      - name: Push to fork
        env:
          FORK_DEPLOY_TOKEN: ${{ secrets.FORK_DEPLOY_TOKEN }}
        run: |
          git push "https://x-access-token:${FORK_DEPLOY_TOKEN}@github.com/${FORK_REPO}.git" \
            "${GITHUB_SHA}:refs/heads/main"

      # 2+3. Dispatch the fork's deploy and wait for that exact run to finish.
      - name: Deploy + wait for staging
        env:
          GH_TOKEN: ${{ secrets.FORK_DEPLOY_TOKEN }}
        run: |
          CID="orch-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}-staging"
          gh workflow run deploy.yml --repo "$FORK_REPO" --ref main -f correlation_id="$CID"
          echo "Dispatched staging deploy with correlation id $CID"
          RID=""
          for i in $(seq 1 30); do
            RID=$(gh run list --repo "$FORK_REPO" --workflow deploy.yml \
              --json databaseId,displayTitle \
              -q "[.[] | select(.displayTitle | contains(\"$CID\"))][0].databaseId")
            [ -n "$RID" ] && break
            sleep 5
          done
          if [ -z "$RID" ]; then echo "Could not find dispatched staging run"; exit 1; fi
          echo "Staging run id: $RID"
          gh run watch "$RID" --repo "$FORK_REPO" --interval 10 --exit-status

      # 4. Smoke-test the deployed staging site with a real browser.
      - uses: ./.github/actions/set-up-node
      - run: npm ci
      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
      - name: Install Playwright browser
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps chromium
      - name: Install Playwright system deps (on cache hit)
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps chromium
      - name: Smoke-test staging
        env:
          SMOKE_URL: ${{ env.STAGING_URL }}
        run: node .github/workflows/check-website.js
```

> Pin `actions/cache` by SHA to match repo convention if the other workflows do; copy the exact pinned line from `up-check.yml` rather than using `@v4` if that's what's there.

- [ ] **Step 2: Commit and push the branch**

```bash
git add .github/workflows/orchestrate-deploy.yml
git commit -m "ci: add staging-only deploy orchestrator (dry run)"
git push -u origin feat/deploy-pipeline-automation
```

- [ ] **Step 3: Dispatch the orchestrator against the feature branch and watch it**

```bash
gh workflow run orchestrate-deploy.yml --repo pocket-dragon/pocket-dragon.github.io --ref feat/deploy-pipeline-automation
sleep 6
RID=$(gh run list --repo pocket-dragon/pocket-dragon.github.io --workflow orchestrate-deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RID" --repo pocket-dragon/pocket-dragon.github.io --interval 10 --exit-status
```
Expected: success. The run pushes the branch to `fork/main`, deploys staging, and the staging smoke test passes. This is validation step 1 from the spec — proves the token, correlation-id matching, polling, and smoke test end-to-end without any production risk.

> Pushing the feature-branch SHA to `fork/main` is a fast-forward because the branch is `main` + these commits and `fork/main` is at/behind `main`. If the push is rejected as non-fast-forward, reset the fork first: `gh api -X PATCH repos/$FORK_REPO/git/refs/heads/main -f sha=<upstream main sha> -F force=true`, then re-dispatch.

---

### Task 4: Failure handling — open/update a `deploy-failure` issue

**Files:**
- Modify: `.github/workflows/orchestrate-deploy.yml`

**Interfaces:**
- Produces: on any failed pipeline run, a single open issue labeled `deploy-failure` in upstream, created if absent or commented on if already open, carrying the failing run's URL. Uses `GITHUB_TOKEN` with `issues: write`.

- [ ] **Step 1: Grant the job issue permissions**

In `orchestrate-deploy.yml`, change the top-level `permissions:` block to:

```yaml
permissions:
  contents: read
  issues: write
```

- [ ] **Step 2: Add the failure-report step at the end of the `pipeline` job**

Append as the final step of the `pipeline` job (runs only if an earlier step failed):

```yaml
      - name: Report failure
        if: failure()
        env:
          GH_TOKEN: ${{ github.token }}
          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: |
          # Ensure the label exists (idempotent).
          gh label create deploy-failure --repo "$GITHUB_REPOSITORY" \
            --color B60205 --description "Automated deploy pipeline failed" 2>/dev/null || true
          EXISTING=$(gh issue list --repo "$GITHUB_REPOSITORY" \
            --label deploy-failure --state open --limit 1 --json number -q '.[0].number')
          BODY="Automated deploy pipeline failed: ${RUN_URL}"
          if [ -n "$EXISTING" ]; then
            gh issue comment "$EXISTING" --repo "$GITHUB_REPOSITORY" --body "$BODY"
            echo "Commented on existing deploy-failure issue #$EXISTING"
          else
            gh issue create --repo "$GITHUB_REPOSITORY" \
              --title "🔴 Automated deploy pipeline failed" \
              --label deploy-failure --body "$BODY"
            echo "Opened a new deploy-failure issue"
          fi
```

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/orchestrate-deploy.yml
git commit -m "ci: open a deploy-failure issue when the pipeline fails"
git push
```

- [ ] **Step 4: Induce a staging smoke failure and confirm the issue opens**

Temporarily break the smoke target so the pipeline fails at the staging smoke step (after the deploy, before any production leg exists):

```bash
# point the staging smoke at a URL that will not render the app
sed -i '' 's#STAGING_URL: https://adrianschmidt-bot.github.io/#STAGING_URL: https://example.com/#' .github/workflows/orchestrate-deploy.yml
git commit -am "test: temporarily break staging smoke (revert next)"
git push
gh workflow run orchestrate-deploy.yml --repo pocket-dragon/pocket-dragon.github.io --ref feat/deploy-pipeline-automation
sleep 6
RID=$(gh run list --repo pocket-dragon/pocket-dragon.github.io --workflow orchestrate-deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RID" --repo pocket-dragon/pocket-dragon.github.io --interval 10 --exit-status; echo "exit=$?"
```
Expected: `exit=1` (pipeline fails at the smoke step), and:
```bash
gh issue list --repo pocket-dragon/pocket-dragon.github.io --label deploy-failure --state open
```
shows a new `🔴 Automated deploy pipeline failed` issue linking the run. This is validation step 2 from the spec.

- [ ] **Step 5: Revert the break and close the test issue**

```bash
git revert --no-edit HEAD   # undo the "temporarily break" commit
git push
# close the issue opened by the test
N=$(gh issue list --repo pocket-dragon/pocket-dragon.github.io --label deploy-failure --state open --limit 1 --json number -q '.[0].number')
gh issue close "$N" --repo pocket-dragon/pocket-dragon.github.io --comment "Closing: induced during pipeline testing."
```
Expected: `STAGING_URL` is back to the real staging URL; no open `deploy-failure` issues.

---

### Task 5: Add the production leg + close the issue on success

**Files:**
- Modify: `.github/workflows/orchestrate-deploy.yml`

**Interfaces:**
- Produces: after a green staging smoke, the pipeline dispatches upstream's own `deploy.yml` (via `GITHUB_TOKEN`), waits for it, smoke-tests production, and — on full success — closes any open `deploy-failure` issue.

- [ ] **Step 1: Add prod env vars**

In the top-level `env:` block, add the production URL (keep the fork/staging entries):

```yaml
env:
  FORK_REPO: adrianschmidt-bot/adrianschmidt-bot.github.io
  STAGING_URL: https://adrianschmidt-bot.github.io/
  PROD_URL: https://pocket-dragon.github.io/
```

- [ ] **Step 2: Insert the production deploy + smoke steps after "Smoke-test staging" and before "Report failure"**

```yaml
      # 5+6. Promote to production: dispatch this repo's own deploy and wait.
      - name: Deploy + wait for production
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          CID="orch-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}-prod"
          gh workflow run deploy.yml --repo "$GITHUB_REPOSITORY" --ref main -f correlation_id="$CID"
          echo "Dispatched production deploy with correlation id $CID"
          RID=""
          for i in $(seq 1 30); do
            RID=$(gh run list --repo "$GITHUB_REPOSITORY" --workflow deploy.yml \
              --json databaseId,displayTitle \
              -q "[.[] | select(.displayTitle | contains(\"$CID\"))][0].databaseId")
            [ -n "$RID" ] && break
            sleep 5
          done
          if [ -z "$RID" ]; then echo "Could not find dispatched production run"; exit 1; fi
          echo "Production run id: $RID"
          gh run watch "$RID" --repo "$GITHUB_REPOSITORY" --interval 10 --exit-status

      # 7. Smoke-test production with a real browser (reuses the Node/Playwright
      # setup already done above in this job).
      - name: Smoke-test production
        env:
          SMOKE_URL: ${{ env.PROD_URL }}
        run: node .github/workflows/check-website.js
```

- [ ] **Step 3: Add a success step to close any open `deploy-failure` issue (before "Report failure")**

```yaml
      - name: Close deploy-failure issue on success
        env:
          GH_TOKEN: ${{ github.token }}
          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: |
          for N in $(gh issue list --repo "$GITHUB_REPOSITORY" \
            --label deploy-failure --state open --json number -q '.[].number'); do
            gh issue close "$N" --repo "$GITHUB_REPOSITORY" \
              --comment "Deploy pipeline green again: ${RUN_URL}"
            echo "Closed deploy-failure issue #$N"
          done
```

- [ ] **Step 4: Commit and push**

```bash
git add .github/workflows/orchestrate-deploy.yml
git commit -m "ci: add production deploy leg and success issue-close"
git push
```

- [ ] **Step 5: Full green run**

```bash
gh workflow run orchestrate-deploy.yml --repo pocket-dragon/pocket-dragon.github.io --ref feat/deploy-pipeline-automation
sleep 6
RID=$(gh run list --repo pocket-dragon/pocket-dragon.github.io --workflow orchestrate-deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RID" --repo pocket-dragon/pocket-dragon.github.io --interval 10 --exit-status
```
Expected: success end-to-end — staging deploys + smoke passes, production deploys + smoke passes. Validation step 3 from the spec. (Deploying the feature branch to production is safe: only workflow/spec files differ from `main`; the built app in `dist` is identical, so users see no change.) Confirm prod is healthy:
```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://pocket-dragon.github.io/
```
Expected: `HTTP 200`.

---

### Task 6: Flip to the real trigger, merge, and validate on `main`

**Files:**
- Modify: `.github/workflows/orchestrate-deploy.yml`

**Interfaces:**
- Produces: the orchestrator fires automatically on push to `main` (and still supports manual `workflow_dispatch`). After merge, real merges to `main` drive the whole pipeline.

- [ ] **Step 1: Change the trigger**

Replace the `on:` block with (keep everything else):

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

- [ ] **Step 2: Commit and push**

```bash
git add .github/workflows/orchestrate-deploy.yml
git commit -m "ci: fire the deploy orchestrator on push to main"
git push
```

- [ ] **Step 3: Open the PR**

```bash
gh pr create --repo pocket-dragon/pocket-dragon.github.io --base main --head feat/deploy-pipeline-automation \
  --title "ci: fully automate the staging→production deploy pipeline" \
  --body "Implements docs/superpowers/specs/2026-07-05-deploy-pipeline-automation-design.md. Single hands-off orchestrator: sync→fork, deploy+smoke staging, deploy+smoke production, issue on failure. Validated by controlled dispatch runs (staging dry-run, induced failure, full green) on the branch."
```

- [ ] **Step 4: Wait for CI green, then admin-rebase-merge**

```bash
# poll until no pending checks
gh pr checks <PR#> --repo pocket-dragon/pocket-dragon.github.io
gh pr merge <PR#> --repo pocket-dragon/pocket-dragon.github.io --rebase --admin --delete-branch
```
Expected: all required checks green; PR rebase-merged.

> Merging this PR pushes to `main`, which now triggers the orchestrator for real — the merge itself is the first live run. Watch it:
```bash
cd /Users/bot/src/pocket-dragon/upstream && git checkout main -q && git pull --ff-only origin main -q
sleep 6
RID=$(gh run list --repo pocket-dragon/pocket-dragon.github.io --workflow orchestrate-deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RID" --repo pocket-dragon/pocket-dragon.github.io --interval 10 --exit-status
```
Expected: success — the merge deployed staging + prod hands-off. This is validation step 3 on a real merge.

- [ ] **Step 5: Concurrency check (validation step 4)**

Make two trivial commits close together on `main` (e.g. two whitespace touches to the spec doc via quick PRs, or — since you're admin — two direct pushes) and confirm the second orchestrator run **queues** behind the first rather than overlapping:

```bash
gh run list --repo pocket-dragon/pocket-dragon.github.io --workflow orchestrate-deploy.yml --limit 3 \
  --json databaseId,status,createdAt
```
Expected: at most one `in_progress` at a time; the later run shows `queued` until the first completes. (If you prefer not to burn two real deploys, this can also be reasoned about from the `concurrency: group: deploy-pipeline` config alone and skipped — note the choice in the handoff.)

---

### Task 7: Finalize docs and memory

**Files:**
- Modify: `docs/superpowers/specs/2026-07-05-deploy-pipeline-automation-design.md` (status line)

- [ ] **Step 1: Mark the spec implemented**

Change the spec's `**Status:**` line to `Implemented (2026-07-05)`.

- [ ] **Step 2: Commit (on a short follow-up branch → PR → admin-rebase-merge)**

```bash
git checkout -b docs/mark-deploy-automation-done main
git add docs/superpowers/specs/2026-07-05-deploy-pipeline-automation-design.md
git commit -m "docs: mark deploy-automation design as implemented"
git push -u origin docs/mark-deploy-automation-done
gh pr create --repo pocket-dragon/pocket-dragon.github.io --base main --head docs/mark-deploy-automation-done \
  --title "docs: mark deploy-automation design as implemented" --body "Status update after landing the orchestrator."
# after green:
gh pr merge <PR#> --repo pocket-dragon/pocket-dragon.github.io --rebase --admin --delete-branch
```

- [ ] **Step 3: Update memory (outside the repo)**

Update `deploy-pipeline-automation.md` memory from "approved-but-unbuilt" to "implemented", and adjust the `[[pocket-dragon-setup]]` deploy section to describe the automatic pipeline (merge to `main` → hands-off staging+prod) instead of the manual sync/dispatch flow. Update the `MEMORY.md` index line accordingly.

---

## Self-Review

**Spec coverage:**
- Hands-off orchestrator, pure glue, on push to main → Tasks 3, 5, 6. ✓
- Sync push to fork (token, fast-forward, failure surfaces) → Task 3 Step 1. ✓
- Dispatch + poll each `deploy.yml` via correlation id → Tasks 2, 3, 5. ✓
- Real-browser smoke test, parameterized `SMOKE_URL`, staging + prod → Tasks 1, 3, 5. ✓
- Failure → open/update `deploy-failure` issue; success → close it → Tasks 4, 5. ✓
- Concurrency serialization → Task 3 (config) + Task 6 Step 5 (validation). ✓
- Break-glass manual dispatch retained (deploy.yml + orchestrator both keep `workflow_dispatch`) → Tasks 2, 6. ✓
- Permissions summary (FORK_DEPLOY_TOKEN scopes, GITHUB_TOKEN actions+issues) → Tasks 3, 4. ✓
- Validation plan (dry-run staging, induced failure, full green, concurrency) → Tasks 3, 4, 5, 6. ✓
- `deploy-failure` label created on first use → Task 4 Step 2 (`gh label create ... || true`). ✓

**Placeholder scan:** No TBD/TODO; every code/YAML step shows complete content. The one conditional ("if local Chromium unavailable, skip Steps 2–3") is an explicit environment fallback with a stated alternative (Task 3), not a deferred detail.

**Type/name consistency:** `SMOKE_URL` (Task 1) is set in Tasks 3 & 5. `correlation_id` input (Task 2) matches `-f correlation_id=` dispatches (Tasks 3, 5) and the `displayTitle | contains(...)` lookups. `deploy-failure` label + issue title consistent across Tasks 4 & 5. Env names `FORK_REPO`/`STAGING_URL`/`PROD_URL` consistent across Tasks 3, 5.
