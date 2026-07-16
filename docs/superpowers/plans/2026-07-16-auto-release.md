# Automatic Releases (PR 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every merge to `main` that survives the prod deploy + smoke test automatically cuts a semantic-release tag and GitHub Release.

**Architecture:** `release.config.js` switches its release branch from the stale `release` branch to `main`. A new `release` job is appended to `.github/workflows/orchestrate-deploy.yml`, gated on the existing `pipeline` job succeeding, so a release tag always means "this commit is live in prod". The obsolete `release` branch is deleted after merge.

**Tech Stack:** semantic-release v25 (already a devDependency), GitHub Actions, `gh` CLI.

**Spec:** `docs/superpowers/specs/2026-07-16-downloadable-offline-build-design.md` (PR 1 section).

## Global Constraints

- Work happens in `/Users/bot/src/pocket-dragon/upstream` on branch `ci/auto-release`.
- Local npm commands must run under Node 22: prefix with `fnm exec --using=22` (plain `npx`/`npm` may resolve to Node 24 and behave differently than CI).
- Commit messages: conventional commits, American English, no AI attribution lines.
- This PR must NOT itself trigger a release when merged — all its commits are `ci:`/`docs:` type. That is intentional and correct.
- Never squash-merge; this repo merges PRs with rebase-and-merge.

---

### Task 1: Rename the spec branch to the PR 1 working branch

The approved design spec was committed on branch `docs/offline-build-design` (commit `fc89870`), which per the spec rides along with PR 1. Rename it so the PR branch name matches its content.

**Files:** none (branch operation only)

**Interfaces:**
- Consumes: existing local branch `docs/offline-build-design` with the spec commit on top of `origin/main`.
- Produces: branch `ci/auto-release` that Tasks 2–4 commit to.

- [ ] **Step 1: Rename the branch**

```bash
cd /Users/bot/src/pocket-dragon/upstream
git branch -m docs/offline-build-design ci/auto-release
```

- [ ] **Step 2: Verify state**

Run: `git status --short --branch && git log --oneline -2`
Expected: on branch `ci/auto-release`, clean tree, top commit is `docs: add design spec for downloadable offline build`, its parent is `origin/main`'s head (`c02bb54` at time of writing).

### Task 2: Point semantic-release at `main`

**Files:**
- Modify: `release.config.js`

**Interfaces:**
- Consumes: existing tag `v3.0.0` (semantic-release reads version history from tags, not from the old `release` branch).
- Produces: config that Task 3's workflow job runs via `npx semantic-release`.

- [ ] **Step 1: Replace the config**

New full content of `release.config.js` (removes `branches: ["release"]` and `ci: false`; CI detection must be active so the workflow run is recognized):

```js
export default {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github",
  ],
};
```

- [ ] **Step 2: Verify with a dry run**

semantic-release refuses to run on a non-release branch, so override the branch to the current one for the dry run only (this simulates what will happen on `main` — same tags, same commit range):

```bash
GITHUB_TOKEN=$(gh auth token) fnm exec --using=22 npx semantic-release --dry-run --no-ci --branches ci/auto-release
```

Expected output includes: analysis of commits since `v3.0.0`, then
`The next release version is 3.1.0` (there are `feat` commits on main since v3.0.0), and release notes. It must NOT create a tag or release (dry run). If it errors with an auth/permission message, verify `gh auth status` shows the `adrianschmidt-bot` account.

- [ ] **Step 3: Confirm nothing was published**

Run: `git tag --list 'v3.1*' && gh release list --repo pocket-dragon/pocket-dragon.github.io --limit 2`
Expected: no `v3.1.0` tag locally; latest release on GitHub is still `v3.0.0`.

- [ ] **Step 4: Commit**

```bash
git add release.config.js
git commit -m "ci: release from main instead of the manual release branch

semantic-release now runs in CI against main (versions are read from
tags, so it picks up from v3.0.0). The release branch is obsolete and
will be deleted once the automated pipeline is live."
```

### Task 3: Add the release job to the deploy pipeline

**Files:**
- Modify: `.github/workflows/orchestrate-deploy.yml` (append a job after the `pipeline` job, which ends at line 152; also update the header comment at lines 3–6)

**Interfaces:**
- Consumes: the `pipeline` job (unchanged) — the new job declares `needs: pipeline`, so it runs only after staging + prod deploys and both smoke tests succeed.
- Produces: a `release` job that later PRs extend (PR 3 adds the offline-artifact build + `assets` attachment inside this same job).

- [ ] **Step 1: Update the workflow header comment**

Replace lines 3–6:

```yaml
# Hands-off release pipeline: on every merge to main, sync the code to the fork,
# deploy + smoke-test staging, then deploy + smoke-test production, opening a
# deploy-failure issue if any step fails. workflow_dispatch is kept as a manual
# re-run; the per-repo deploy.yml remains as a break-glass manual deploy.
```

with:

```yaml
# Hands-off release pipeline: on every merge to main, sync the code to the fork,
# deploy + smoke-test staging, then deploy + smoke-test production, then cut a
# semantic-release tag + GitHub Release, opening a deploy-failure issue if any
# step fails. workflow_dispatch is kept as a manual re-run; the per-repo
# deploy.yml remains as a break-glass manual deploy.
```

- [ ] **Step 2: Append the release job**

Add at the end of the file (same indentation level as `pipeline:` under `jobs:`):

```yaml
  # 8. Cut a release for what just shipped. Runs only after the prod smoke test
  # succeeds, so a release tag always means "this commit is live in prod".
  # Merges containing only chore/ci/docs commits correctly produce no release.
  release:
    # Same fork-mirror guard as the pipeline job. A job-level `if` without a
    # status function still implies success() on `needs`, so this only runs
    # after a green pipeline.
    if: github.repository == 'pocket-dragon/pocket-dragon.github.io'
    needs: pipeline
    runs-on: ubuntu-latest
    # Replaces the workflow-level permissions for this job only.
    permissions:
      contents: write  # push the version tag, create the GitHub Release
      issues: write    # deploy-failure reporting below
      pull-requests: write  # @semantic-release/github posts successComment on released PRs
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          fetch-depth: 0          # semantic-release needs full history + tags
          persist-credentials: false

      - uses: ./.github/actions/set-up-node
      - run: npm ci

      - name: Semantic release
        env:
          GITHUB_TOKEN: ${{ github.token }}
        run: npx semantic-release

      # Prod is already deployed and healthy if we got here, so a release
      # failure must not go unnoticed silently — reuse the deploy-failure
      # issue mechanism from the pipeline job. Re-running the workflow
      # retries the release; semantic-release is idempotent (if a failure
      # lands between tag push and Release creation, recreate it manually
      # with gh release create from the tag).
      - name: Report failure
        if: failure()
        env:
          GH_TOKEN: ${{ github.token }}
          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: |
          gh label create deploy-failure --repo "$GITHUB_REPOSITORY" \
            --color B60205 --description "Automated deploy pipeline failed" 2>/dev/null || true
          EXISTING=$(gh issue list --repo "$GITHUB_REPOSITORY" \
            --label deploy-failure --state open --limit 1 --json number -q '.[].number')
          BODY="Release step failed after successful prod deploy: ${RUN_URL}"
          if [ -n "$EXISTING" ]; then
            gh issue comment "$EXISTING" --repo "$GITHUB_REPOSITORY" --body "$BODY"
            echo "Commented on existing deploy-failure issue #$EXISTING"
          else
            gh issue create --repo "$GITHUB_REPOSITORY" \
              --title "🔴 Release step failed" \
              --label deploy-failure --body "$BODY"
            echo "Opened a new deploy-failure issue"
          fi
```

- [ ] **Step 3: Lint the workflow**

Run: `actionlint .github/workflows/orchestrate-deploy.yml`
Expected: only the two pre-existing SC2034 warnings in the pipeline job's retry loops; the release job must add no new findings.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/orchestrate-deploy.yml
git commit -m "ci: cut a semantic release after each successful prod deploy

New release job in the orchestrator, gated on the pipeline job, so a
release tag always points at a commit that is live in prod. Failures
reuse the deploy-failure issue mechanism; the job is a no-op on the
fork mirror."
```

### Task 4: Open the PR

**Files:** none (branch push + PR)

**Interfaces:**
- Consumes: branch `ci/auto-release` with three commits (spec doc, config, workflow — plus the plan doc if committed).
- Produces: an open PR whose merge activates the automation.

- [ ] **Step 1: Push and create the PR**

```bash
git push -u origin ci/auto-release
gh pr create --repo pocket-dragon/pocket-dragon.github.io \
  --title "ci: automate releases from main" \
  --body "$(cat <<'EOF'
Part 1 of 3 for #9 (design spec included in this PR under
docs/superpowers/specs/).

- semantic-release now targets `main` and runs as a final `release` job in
  the deploy orchestrator, after the prod smoke test passes — so a release
  tag always means "live in prod".
- Job-scoped `contents: write` / `issues: write`; the default GITHUB_TOKEN
  suffices. Release failures reuse the deploy-failure issue mechanism.
- Merges with only chore/ci/docs commits (like this PR) deploy but cut no
  release — expected.
- Follow-up after merge: delete the obsolete `release` branch.

Upcoming: PR 2 migrates media assets to Vite imports (prod-neutral);
PR 3 ships the self-contained offline pocket-dragon.html as a release
asset. See the spec for details.
EOF
)"
```

- [ ] **Step 2: Wait for CI checks**

Run: `gh pr checks --repo pocket-dragon/pocket-dragon.github.io ci/auto-release --watch`
Expected: all required checks green (Fallow audit and CodeQL are changed-code gates; a ci/docs-only diff passes them).

- [ ] **Step 3: Hand off for merge**

The branch ruleset requires approval, and the PR author cannot approve their own PR — report to Adrian that the PR is ready for review/merge (rebase-and-merge). STOP here; Tasks 5 runs after the merge.

### Task 5: Post-merge verification and cleanup

**Files:** none (remote operations)

**Interfaces:**
- Consumes: the merged PR on `main`, which triggers `orchestrate-deploy.yml`.
- Produces: verified automation; deleted `release` branch.

- [ ] **Step 1: Watch the pipeline run end-to-end**

```bash
RID=$(gh run list --repo pocket-dragon/pocket-dragon.github.io \
  --workflow orchestrate-deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RID" --repo pocket-dragon/pocket-dragon.github.io --interval 30 --exit-status
```

Expected: `pipeline` job succeeds, then the `release` job runs and succeeds. Because this PR contains only `ci:`/`docs:` commits **and** `main` has unreleased `feat` commits from before (game-state persistence, merged after v3.0.0), semantic-release WILL cut `v3.1.0` on this first run — the correct catch-up release covering everything since March.

- [ ] **Step 2: Confirm the release**

Run: `gh release view --repo pocket-dragon/pocket-dragon.github.io`
Expected: `v3.1.0`, tagged at the just-merged commit, with generated notes listing the feat/fix commits since v3.0.0.

- [ ] **Step 3: Delete the obsolete release branch**

The branch's only purpose was to mark where manual semantic-release runs happened; `main` is now the release branch and nothing reads or updates `release`. Tags and past GitHub Releases are unaffected by branch deletion.

```bash
git push origin --delete release
git branch -d release 2>/dev/null || true
```

Expected: remote branch deleted (`- [deleted] release`).

- [ ] **Step 4: Verify final state**

Run: `git ls-remote --heads origin | grep -c release || echo "release branch gone"`
Expected: `release branch gone` (only `main` and feature branches remain).

## Self-Review Notes

- Spec coverage: config change ✔ (Task 2), pipeline job with job-scoped permissions ✔ (Task 3), failure reporting ✔ (Task 3 step 2), catch-up from v3.0.0 ✔ (Task 5), branch deletion ✔ (Task 5), npm script kept as break-glass ✔ (dry-runs outside CI; use -- --no-ci to publish manually).
- The `GITHUB_TOKEN`-created tag not triggering other workflows is a non-issue: nothing listens for tags, and PR 3 attaches the artifact inside this same job.
