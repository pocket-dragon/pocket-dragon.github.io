# Actions Deploy + Build-Number Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Pocket Dragon's deployment from a local script to a manual GitHub Actions workflow, and surface the workflow run number as a low-contrast `b<run_number>` build indicator in the app corner.

**Architecture:** A `workflow_dispatch` workflow builds the app with `VITE_APP_VERSION="b<run_number>"` and publishes `dist/` via Actions-native Pages (no deploy branch). The app reads `import.meta.env.VITE_APP_VERSION` through a tiny pure function and renders it only when present. The same workflow file lives in both repos: dispatching in the fork publishes staging Pages, dispatching in upstream publishes production.

**Tech Stack:** React + Vite + vite-plugin-pwa, vitest (logic unit tests), Playwright (e2e), GitHub Actions, GitHub Pages.

## Global Constraints

- **Commits:** Conventional Commits, enforced by commitlint (`<type>(<scope>): <subject>`). No `fixup!`/`squash!` on the PR (a "Block Autosquash Commits" check enforces this).
- **Node:** pinned to v22 via `.nvmrc`; the workflow must use `node-version-file: .nvmrc`.
- **Spelling:** American English in all identifiers, comments, copy.
- **Deploy is build-only:** the deploy workflow does NOT run tests (CI already gates `dev`).
- **Vite base:** stays default `/` (both repos are root-served user/org Pages). Do not set `base`.
- **Indicator value format:** exactly `b<run_number>` (e.g. `b42`), prefix lowercase `b`.
- **Branch:** all code changes land on branch `ci/deploy-via-actions` (already created off `origin/dev`), merged via PR.

---

### Task 1: Build-number indicator in the app

**Files:**
- Create: `src/logic/buildVersion.ts`
- Create: `src/logic/buildVersion.test.ts`
- Modify: `src/vite-env.d.ts` (whole file)
- Modify: `src/App.tsx` (add import near top with the other local imports; add a `const` in the component body; add JSX before the root `</div>`)
- Modify: `src/App.css` (append a `.app-version` rule)

**Interfaces:**
- Produces: `getBuildVersion(): string | undefined` — returns `import.meta.env.VITE_APP_VERSION` when it is a non-empty string, otherwise `undefined`. Consumed by `src/App.tsx`.

- [ ] **Step 1: Write the failing test**

Create `src/logic/buildVersion.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { getBuildVersion } from './buildVersion';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getBuildVersion', () => {
  it('returns the value when VITE_APP_VERSION is a non-empty string', () => {
    vi.stubEnv('VITE_APP_VERSION', 'b42');
    expect(getBuildVersion()).toBe('b42');
  });

  it('returns undefined when VITE_APP_VERSION is an empty string', () => {
    vi.stubEnv('VITE_APP_VERSION', '');
    expect(getBuildVersion()).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:unit -- buildVersion`
Expected: FAIL — cannot resolve `./buildVersion` (module does not exist yet).

- [ ] **Step 3: Write the minimal implementation**

Create `src/logic/buildVersion.ts`:

```ts
// Reads the build identifier injected at deploy time via VITE_APP_VERSION
// (set to "b<github.run_number>" by .github/workflows/deploy.yml). Returns
// undefined for local/dev builds where the variable is not set, so the
// indicator only appears on deployed builds.
export function getBuildVersion(): string | undefined {
  const value = import.meta.env.VITE_APP_VERSION;
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return undefined;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:unit -- buildVersion`
Expected: PASS (2 tests).

- [ ] **Step 5: Add the env typing**

Replace the whole contents of `src/vite-env.d.ts` with:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 6: Wire the indicator into `src/App.tsx`**

Add this import alongside the existing local imports near the top of the file (after the `./components/PdButton` import line):

```tsx
import { getBuildVersion } from './logic/buildVersion';
```

Inside the `App` component, immediately above the `return (` (currently around line 224), add:

```tsx
  const buildVersion = getBuildVersion();
```

In the returned JSX, add the indicator as the last child of the root `<div className="app">`, immediately before its closing `</div>` (the final line before `);`):

```tsx
      {buildVersion && <span className="app-version">{buildVersion}</span>}
```

- [ ] **Step 7: Add the style to `src/App.css`**

Append to the end of `src/App.css`:

```css
/* Build-number indicator — injected at deploy time via VITE_APP_VERSION.
   Deliberately very low contrast; tuned by eye on the staging deploy. */
.app-version {
  position: fixed;
  right: 6px;
  bottom: 4px;
  z-index: 50;
  font-size: 0.6rem;
  color: var(--color-black);
  opacity: 0.18;
  pointer-events: none;
  user-select: none;
}
```

- [ ] **Step 8: Verify the build and unit tests pass**

Run: `npm run build && npm run test:unit`
Expected: `tsc` type-checks clean (the `import.meta.env.VITE_APP_VERSION` access is typed), Vite build succeeds, all unit tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/logic/buildVersion.ts src/logic/buildVersion.test.ts src/vite-env.d.ts src/App.tsx src/App.css
git commit -m "feat: show build number in app corner on deployed builds"
```

---

### Task 2: Deploy workflow + remove obsolete publish scripts

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `package.json` (remove the `publishApp` and `setupPublishBranch` scripts)

**Interfaces:**
- Consumes: `VITE_APP_VERSION` is read by `getBuildVersion()` from Task 1. The workflow sets it to `b<github.run_number>` for the build step.

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_APP_VERSION: "b${{ github.run_number }}"
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Validate the workflow YAML parses**

Run: `npx --yes js-yaml .github/workflows/deploy.yml > /dev/null && echo OK`
Expected: prints `OK` (js-yaml exits 0 on valid YAML). If `npx js-yaml` is unavailable, instead run `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/deploy.yml')); print('OK')"`.

- [ ] **Step 3: Remove the obsolete scripts from `package.json`**

Run:

```bash
npm pkg delete scripts.publishApp
npm pkg delete scripts.setupPublishBranch
```

- [ ] **Step 4: Verify the build script is intact and still works**

Run: `npm pkg get scripts.publishApp scripts.setupPublishBranch scripts.build`
Expected: `publishApp` and `setupPublishBranch` are `{}` (removed); `build` is still `"tsc && vite build"`.

Run: `npm run build`
Expected: build succeeds (script removal did not affect the build).

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy.yml package.json
git commit -m "ci: deploy to Pages via Actions, drop local publish scripts"
```

---

### Task 3: Open the PR and merge

**Files:** none (VCS operations).

- [ ] **Step 1: Push the branch**

Run: `git push -u origin ci/deploy-via-actions`

- [ ] **Step 2: Open the PR against `dev`**

Run:

```bash
gh pr create --repo pocket-dragon/pocket-dragon.github.io --base dev \
  --title "ci: Actions-based Pages deploy + build-number indicator" \
  --body "Implements docs/superpowers/specs/2026-06-30-actions-deploy-build-indicator-design.md. Manual workflow_dispatch deploy via Actions-native Pages; adds a low-contrast b<run_number> indicator. Does not change ci.yml, up-check.yml, or semantic-release."
```

- [ ] **Step 3: Wait for CI green, then get the user's approval and merge**

CI runs `build` (npm ci → build → unit → e2e), Commitlint, Block Autosquash. Wait until the `build` check passes:

```bash
gh pr checks --repo pocket-dragon/pocket-dragon.github.io <PR#> --watch
```

**Approval:** the author here is `adrianschmidt-bot` (us), and GitHub forbids self-approving your own PR — so unlike the Dependabot PRs, we cannot approve this one. The `dev` ruleset requires 1 approval (plus passing checks, linear history). Ask the user (Adrian, the repo owner) to review and approve the PR. Once approved:

```bash
gh pr merge --repo pocket-dragon/pocket-dragon.github.io <PR#> --rebase
```

Expected: PR merges (rebase) into `dev`. (Ruleset also dismisses stale reviews on push — avoid pushing after the approval; if a rebase is needed, re-request approval. See the dependabot-merge-workflow memory.)

---

### Task 4: Stage on the fork

**Files:** none (operational; deploys the fork's GitHub Pages).

**Prerequisite:** run the git commands in this task from a local clone of the fork
repo (`adrianschmidt-bot/adrianschmidt-bot.github.io`), with the upstream repo
added as a remote named `upstream`. `<fork-clone>` below is a placeholder for
that working copy's path.

- [ ] **Step 1: Sync the fork's `dev`**

```bash
cd <fork-clone>
git fetch -q upstream
git checkout -q dev && git merge --ff-only upstream/dev && git push origin dev
```

- [ ] **Step 2: Flip the fork's Pages source to GitHub Actions**

Run:

```bash
gh api -X PUT repos/adrianschmidt-bot/adrianschmidt-bot.github.io/pages -f build_type=workflow
gh api repos/adrianschmidt-bot/adrianschmidt-bot.github.io/pages --jq '.build_type'
```

Expected: prints `workflow`.

- [ ] **Step 3: Run the deploy workflow on the fork**

```bash
gh workflow run deploy.yml --repo adrianschmidt-bot/adrianschmidt-bot.github.io --ref dev
gh run watch --repo adrianschmidt-bot/adrianschmidt-bot.github.io "$(gh run list --repo adrianschmidt-bot/adrianschmidt-bot.github.io --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
```

Expected: the run completes successfully and reports the deployed `page_url`.

- [ ] **Step 4: Verify the deployed bundle contains the build number**

The indicator is rendered at runtime, so it is not in `index.html`; verify the built JS bundle instead. Capture the run number from the workflow, then:

```bash
JS=$(curl -s https://adrianschmidt-bot.github.io/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1)
curl -s "https://adrianschmidt-bot.github.io${JS}" | grep -oE 'b[0-9]+' | head -1
```

Expected: prints `b<N>` matching the workflow's run number (confirms the freshly built bundle is live).

- [ ] **Step 5: Visually verify and tune contrast**

Open `https://adrianschmidt-bot.github.io/` in a browser. Confirm `b<N>` appears in the bottom-right corner at a deliberately faint contrast. If too strong/weak, adjust `opacity` (and if needed `font-size`/`color`) in `src/App.css` `.app-version`, commit on a new branch, PR → merge to `dev`, re-sync the fork, and re-run the deploy workflow. Repeat until the contrast looks right.

**GATE:** Do not proceed to Task 5 until the user is happy with the staging result.

---

### Task 5: Deploy to production (user-gated)

**Files:** none (operational; deploys upstream production Pages).

- [ ] **Step 1: Confirm with the user**

Explicitly confirm the user approves flipping upstream production Pages and deploying. Do not proceed without it.

- [ ] **Step 2: Flip upstream Pages source to GitHub Actions**

```bash
gh api -X PUT repos/pocket-dragon/pocket-dragon.github.io/pages -f build_type=workflow
gh api repos/pocket-dragon/pocket-dragon.github.io/pages --jq '.build_type'
```

Expected: prints `workflow`.

- [ ] **Step 3: Run the deploy workflow on upstream**

```bash
gh workflow run deploy.yml --repo pocket-dragon/pocket-dragon.github.io --ref dev
gh run watch --repo pocket-dragon/pocket-dragon.github.io "$(gh run list --repo pocket-dragon/pocket-dragon.github.io --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
```

Expected: run completes successfully.

- [ ] **Step 4: Verify production**

```bash
JS=$(curl -s https://pocket-dragon.github.io/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1)
curl -s "https://pocket-dragon.github.io${JS}" | grep -oE 'b[0-9]+' | head -1
```

Expected: prints `b<N>` for the upstream run number; the live site at `https://pocket-dragon.github.io/` shows the app with the corner indicator.

---

## Notes

- The vestigial `main` (upstream) / `master` (fork) deploy branches are left in place as a harmless fallback; prune later if desired.
- `run_number` is per-repo, so staging and production counters differ — expected.
- No changes to `ci.yml`, `up-check.yml`, `release.config.js`, or semantic-release.
