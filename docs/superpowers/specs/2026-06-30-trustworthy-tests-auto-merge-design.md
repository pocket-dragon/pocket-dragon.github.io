# Design: trustworthy test suite → auto-merge all green Dependabot PRs

Date: 2026-06-30
Status: Approved (pending written-spec review)

## Goal

Make the Pocket Dragon test suite trustworthy enough that **every Dependabot
PR — major version bumps included — that goes green on `dev` merges itself**,
with no manual review or merge step.

The suite must earn that trust **on its own merits**. The current staged manual
deploy (`workflow_dispatch` → fork staging → `b<n>` eyeball → production) is a
*transitional* backstop, not a permanent one: automatic deployment is a likely
future goal, after which a green `dev` would flow to users without a human in
the loop. So the trust bar is set as if the suite were the only thing standing
between a bad major and production.

This is a **5-stage program**. All test-hardening stages (1–4) land before
auto-merge (stage 5) is enabled. Each stage is tracked by its own GitHub issue
and implemented in its own PR through the established flow (branch → CI → review
→ rebase → merge to `dev`).

## Current state

- **Pure game logic** (`src/logic/gameState.ts`, `difficulty.ts`,
  `buildVersion.ts`): 100% unit coverage, 65 vitest tests. Solid.
- **`src/App.tsx`** (448 lines — the orchestration core: timers, sound
  playback, `localStorage`, dialogs, difficulty switching): **no unit/component
  tests**; exercised only indirectly through e2e.
- **Components** (`PdButton`, `RulesModal`): e2e only.
- **8 Playwright e2e specs** covering the real user flows (start/pause,
  difficulty, feeding, clues, timers, success, game-over, sound, rules). Broad
  and behavior-level — but run against the **dev server** (`npm run dev`), which
  has no service worker, no minification, and no production config.
- **CI on every PR to `dev`** (`.github/workflows/ci.yml`): `tsc` + `vite build`
  → unit → e2e (2 retries, 1 worker) + commitlint + block-autosquash.
- **`dev` ruleset** (id `13350749`): 1 required approval, rebase-only, strict
  (up-to-date required), `dismiss_stale_reviews_on_push: true`,
  `require_last_push_approval: false`, `require_code_owner_review: true` (no
  CODEOWNERS file exists, so this clause is currently vacuous),
  `required_review_thread_resolution: true`.

### Blind spots a *major* bump can slip through green

1. **PWA build output is never asserted.** `vite build` generates `dist/sw.js`
   + the workbox precache manifest, but nothing checks it exists / is valid /
   non-empty. Vite, `vite-plugin-pwa`, and workbox are frequent Dependabot
   targets — exactly the majors most likely to silently break the service
   worker while CI stays green. Highest-value gap.
2. **`App.tsx` orchestration has no isolated tests** — timers, sound,
   persistence are only seen through the user-visible e2e result.
3. **No offline/PWA runtime test** — nothing verifies the cached app loads
   offline.
4. **No visual-regression coverage** — a layout/style regression that doesn't
   change behavior passes silently.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auto-merge scope | **All green Dependabot PRs, majors included** | The user's explicit goal: maximum toil relief. Acceptable only because the suite is hardened first to the "only thing between a bad major and prod" bar. |
| Sequencing | **Harden everything first, then flip the switch** | All four test additions land before auto-merge is enabled. The manual Dependabot flow (rebase → approve → merge) continues meanwhile. |
| Merge mechanism | **GitHub native auto-merge (`--auto --rebase`) + Actions-bot auto-approve** | Keeps the approval gate intact for human PRs; GitHub does the wait-for-checks + rebase. Re-approve on each push to beat `dismiss_stale_reviews_on_push`. |
| Approval identity | **Actions bot** (`GITHUB_TOKEN`) approves | Satisfies the single required approval because no CODEOWNERS file exists. If a CODEOWNERS is ever added, switch to a PAT from a code-owner user (`adrianschmidt`). |
| Thread-resolution rule | **Disable `required_review_thread_resolution`** on the `dev` ruleset | Otherwise an unresolved CodeRabbit thread silently blocks auto-merge. Part of stage 5. |
| e2e target | **Built + served bundle (`vite preview`)**, not the dev server | Tests what actually ships (SW, minification, prod config) and is a prerequisite for the PWA/offline and visual tests. |
| Visual baselines | **Generated & compared only inside a pinned Playwright Docker image**; auto-skip on host | Mirrors `Lundalogik/lime-elements#4147`. Avoids macOS-vs-Linux pixel flakiness; the visual test skips on a plain host so local runs never go red on font mismatch. |
| `App.tsx` testability | **Refactor orchestration into testable units** before adding component tests | A 448-line component mixing timers, audio, persistence, and rendering is hard to test in isolation; extracting a pure reducer + a thin side-effect layer makes both the logic and the wiring testable. |

## Non-goals

- **Automatic deployment.** A likely future direction, and the reason the trust
  bar is high, but out of scope for this spec. Deploy stays
  `workflow_dispatch`-only here.
- **Changing `semantic-release`, `up-check`, or the deploy workflow.**
- **Rolling visual regression out to every screen.** Stage 4 establishes the
  pattern on the key states; broadening it later is follow-up.

## Stages

Each stage = one GitHub issue + one PR. Stages are ordered; later stages depend
on earlier ones (notably the `vite preview` foundation from stage 1).

### Stage 1 — Test what actually ships

**Issue:** "Run e2e against the built bundle + assert PWA build output."

- Migrate the Playwright `webServer` from `npm run dev` to a built-and-served
  bundle (`vite build` then `vite preview`), update `baseURL`/port, and confirm
  all 8 existing specs stay green against preview (the `clock` fixture must keep
  working).
- Add a **PWA build assertion**: a fast check (run after `vite build` in CI)
  that asserts `dist/sw.js` exists, is non-empty, contains a non-empty precache
  list, and references the real hashed `index-*.js` / CSS assets present in
  `dist/`. Fails the build if the service worker didn't generate or is empty.

**Why first:** cheapest, highest-value net; unblocks stages 3 and 4.

### Stage 2 — `App.tsx` testability refactor + component tests

**Issue:** "Extract App orchestration into testable units + add component tests."

- Refactor `src/App.tsx`: extract the timer/state-transition logic into a
  **pure reducer** (directly unit-testable) and the sound + `localStorage`
  effects into a **thin, mockable side-effect layer**, leaving `App.tsx` as
  mostly wiring/rendering.
- Add **React Testing Library** + **jsdom** (+ a second vitest project) and
  cover: timer tick behavior, sound toggle + persistence, the
  difficulty-switch-while-running guard, and win/lose transitions.

**Why:** closes the single biggest untested-code gap, the orchestration core.

### Stage 3 — Offline / PWA runtime e2e

**Issue:** "Add an offline PWA e2e test against the preview build."

- A Playwright test against the preview build: load → wait for service-worker
  activation → `context.setOffline(true)` → reload → assert the app still
  renders and a core interaction works. Verifies the PWA promise end-to-end.

**Why:** the entire reason the `b<n>` indicator exists is that the SW caches the
app; nothing currently proves the cached app actually works offline.

### Stage 4 — Visual regression (the lime-elements #4147 pattern)

**Issue:** "Add Dockerized visual-regression tests for key app states."

- A separate Playwright config screenshots key states — initial screen,
  mid-game, game-over dialog, rules modal — against committed baselines.
- **Baselines are generated and compared only inside a pinned
  `mcr.microsoft.com/playwright:<ver>-jammy` Docker image** so a developer's Mac
  and CI produce identical pixels. On a plain host the visual test
  **auto-skips** (interaction tests still run).
- A **dedicated CI job** runs the visual suite inside that container on every
  PR. Animations disabled / caret hidden for stable captures.
- Scripts: `test:visual` (compare) and `test:visual:update` (regenerate
  baselines, needs Docker), mirroring lime-elements' developer workflow.

**Why:** catches behavior-invisible layout/style regressions a major can cause.

### Stage 5 — Flip the switch: auto-merge

**Issue:** "Enable auto-merge for green Dependabot PRs."

- **Ruleset change:** disable `required_review_thread_resolution` on the `dev`
  ruleset (id `13350749`).
- **`.github/workflows/dependabot-auto-merge.yml`:** triggers on `pull_request`
  (`opened`, `synchronize`, `reopened`) where the actor is `dependabot[bot]`;
  reads `dependabot/fetch-metadata`; enables GitHub **native auto-merge**
  (`gh pr merge --auto --rebase`) and **approves via the Actions bot**,
  re-approving on each `synchronize` so the approval survives Dependabot's own
  rebase pushes (`dismiss_stale_reviews_on_push: true`). Required checks +
  up-to-date gate the merge; GitHub performs the waiting and rebasing.
- **Documented fallbacks (by design, not bugs):** a PR with failing checks
  simply never auto-merges; a PR that genuinely needs human eyes can be held by
  leaving a requested-changes review.
- Update the `dependabot-merge-workflow` memory and the deploy/setup docs to
  describe the new automated path.

**Why last:** only safe once stages 1–4 have raised the suite to the trust bar.

## Risks / notes

- Auto-merging *majors* on green is the aggressive end of the spectrum. The
  hardened suite is what makes it defensible; the transitional staging deploy is
  a bonus safety margin while it lasts, not the justification.
- Stage 1's dev→preview migration is the change most likely to disturb existing
  specs (timing, ports, the `clock` fixture) — it gets careful verification
  before the rest build on it.
- The bot-approval mechanism depends on no CODEOWNERS file existing. If one is
  added later, auto-approve must move to a PAT from a code-owner user.
- Visual-regression baselines are environment-pinned; updating dependencies that
  change rendering (fonts, the rules-markdown stack) may require a
  baseline-refresh commit — an expected, low-risk maintenance step.
