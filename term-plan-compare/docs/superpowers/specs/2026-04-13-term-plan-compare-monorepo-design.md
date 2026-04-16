# Term-Plan-Compare Monorepo — Design Spec

**Date:** 2026-04-13
**Status:** Approved (brainstorming phase complete)
**Next step:** Implementation plan (writing-plans skill)

## Problem

Two independent calculator apps exist as sibling folders on disk:

- `Calculators/goal-assure-ulip-online-sales/` — ULIP calculator (vanilla JS + Vite)
- `Calculators/term-plan-etouch-online-sales/` — Term plan calculator (vanilla JS + Vite)

The deployment dispatcher has only **one** folder available: `/term-plan-compare/`. Both apps must be served under that single base path:

- Term plan at `/term-plan-compare/`
- ULIP at `/term-plan-compare/goal-assure-compare/`

Today, neither app is deploy-ready for a non-root base path. Both use `base: './'`, mount to `#app` via `innerHTML`, have globally-scoped CSS, fetch JSON via relative paths (`./extracted_data.json`), and reference assets via `./Bajaj Logo.png` — patterns that "work" only at the URL root.

## Goal

Restructure the two apps into a single **pnpm workspaces monorepo** that produces one combined `dist/` artifact ready to drop into the dispatcher's `/term-plan-compare/` slot. Both apps remain independent at runtime — they never load together, never share state, never cross-link.

## Non-goals

- **No micro-frontend runtime** (no Module Federation, no single-spa, no dynamic mounting, no iframes). Both apps deploy as plain static files served from disjoint URL subpaths.
- **No CSS scoping work.** The two apps never co-render, so collisions cannot occur.
- **No shared `packages/common/`.** YAGNI — the apps share no code today and have no contract that would require it.
- **No conversion to React or any framework.** Both apps stay vanilla JS.
- **No changes to either app's business logic, calculation rules, or UI.**
- **No CI/CD setup.** Out of scope until the build trigger is defined.
- **No cross-linking between apps.** Each app is fully standalone; users arrive via external links (CRM, email, etc.).

## Decisions made during brainstorming

The user picked these explicitly:

1. **Navigation model:** Full page navigation between apps (no in-place mounting, no iframes).
2. **Cross-linking:** None — each app is fully standalone at its own URL.
3. **Build & deploy:** Monorepo (pnpm workspaces), not independent builds + copy script and not shell-pulls-child.
4. **Monorepo location:** New root folder `Calculators/term-plan-compare/`, with both projects moved inside as workspace packages.
5. **Subpath name:** `goal-assure-compare` (ULIP served at `/term-plan-compare/goal-assure-compare/`).
6. **Build artifact shape:** Single `dist/` folder at the monorepo root containing term-plan at the top level and `goal-assure-compare/` as a subfolder.

## Assumption flagged but not confirmed

The dispatcher serves plain static files with no SPA fallback, and is either already configured to serve `/term-plan-compare/` or under the user's control. This is the safer assumption and works either way given option (2) above (no client-side routing in either app).

## Architecture

### Section 1: Monorepo layout

```
Calculators/term-plan-compare/            ← monorepo root
├── package.json                          ← private root, scripts only
├── pnpm-workspace.yaml                   ← lists packages/*
├── .gitignore                            ← node_modules, dist, web-dist
├── dist/                                 ← BUILD OUTPUT (gitignored)
│   ├── index.html                        ← term-plan shell
│   ├── <hashed>.js / <hashed>.css        ← flat asset layout (assetsDir: '')
│   ├── Bajaj Logo.png, *.json, ...       ← copied from web/public/
│   └── goal-assure-compare/
│       ├── index.html                    ← ULIP
│       ├── <hashed>.js / <hashed>.css
│       └── Bajaj Logo.png, *.json, ...
└── packages/
    ├── shell/                            ← was term-plan-etouch-online-sales
    │   ├── package.json                  ← name: "@tpc/shell"
    │   ├── web/
    │   │   ├── vite.config.ts            ← base: "/term-plan-compare/"
    │   │   ├── index.html
    │   │   ├── public/                   ← static assets (logo, JSON)
    │   │   └── src/
    │   └── scripts/
    └── goal-assure-compare/              ← was goal-assure-ulip-online-sales
        ├── package.json                  ← name: "@tpc/goal-assure-compare"
        ├── web/
        │   ├── vite.config.ts            ← base: "/term-plan-compare/goal-assure-compare/"
        │   ├── index.html
        │   ├── public/                   ← static assets (logo, JSON)
        │   └── src/
        └── scripts/
```

The `@tpc/` npm scope is shorthand for **t**erm-**p**lan-**c**ompare. It's a private scope used only inside this monorepo for `pnpm --filter` selectors; nothing is published to npm.

**Rationale for naming:**
- Package names match URL subpaths so the `base` config is self-documenting.
- Each package keeps its existing `web/` + `scripts/` internal structure so the move is a top-level rename, not an internal restructure.
- `node_modules` hoisted via pnpm workspaces — one `node_modules` at the root, not two.

### Section 2: Per-package Vite config

**`packages/shell/web/vite.config.ts`:**

```ts
export default defineConfig({
  base: '/term-plan-compare/',
  build: {
    outDir: '../../../dist',        // monorepo root dist
    emptyOutDir: false,             // shared output dir — see Section 3
    assetsDir: '',                  // keep flat — matches existing layout
    rollupOptions: { /* preserve existing */ },
  },
});
```

**`packages/goal-assure-compare/web/vite.config.ts`:**

```ts
export default defineConfig({
  base: '/term-plan-compare/goal-assure-compare/',
  server: { port: 5174 },           // avoid port collision with shell in dev
  build: {
    outDir: '../../../dist/goal-assure-compare',
    emptyOutDir: false,
    assetsDir: '',
    rollupOptions: { /* preserve existing */ },
  },
});
```

**Existing config to preserve verbatim** in both packages: any custom plugins, `define` vars, and other `server` settings present in the current vite.config.ts files. The implementation plan must inventory these before touching the configs.

### Section 2b: Asset path rewrite (highest-risk work)

Setting `base` correctly only fixes URLs Vite *sees*. It does **not** rewrite string literals inside JS or inside innerHTML templates. Today both apps reference assets like `./Bajaj Logo.png` and fetch data like `fetch('./extracted_data.json')`. These break the moment the page is served from a non-root URL.

**Fix pattern (mechanical, applied to both packages):**

For all dynamic references inside JS:

```js
// Before
fetch('./extracted_data.json')
element.innerHTML = `<img src="./Bajaj Logo.png">`

// After
fetch(`${import.meta.env.BASE_URL}extracted_data.json`)
element.innerHTML = `<img src="${import.meta.env.BASE_URL}Bajaj Logo.png">`
```

For static references inside `index.html`:

```html
<!-- Before -->
<img src="./Bajaj Logo.png">
<link rel="icon" href="./favicon.ico">

<!-- After: drop the leading ./ — Vite rewrites these at build via `base` -->
<img src="Bajaj Logo.png">
<link rel="icon" href="favicon.ico">
```

For CSS `url(...)` references: Vite *does* rewrite asset URLs inside CSS automatically. No change needed, but verify in the smoke test.

**Files known to need touching** (verified file-by-file during plan-writing — this is the authoritative catalog):

**Shell (term-plan):**
- `packages/shell/web/index.html` line 1606: `<img src="./Bajaj Logo.png">` → drop leading `./`
- `packages/shell/web/index.html` line 1670: `<script type="module" src="./src/ui.js">` → drop leading `./`
- `packages/shell/web/src/config.js` lines 51-52, 144: 3 `fetch('./*.json')` calls (`extracted_data.json`, `version_control.json`, `care_plus_validations.json`)
- `packages/shell/web/src/calc.js` lines 61-65, 80-82: 8 `fetch('./*.json')` calls (`medical_rates.json`, `non_medical_rates.json`, `adb_rates.json`, `ci_rates.json`, `care_plus_rates.json`, `hsar_factors.json`, `fpr_base_rates.json`, `fpr_rate_calculation.json`)

**Goal-assure-compare (ULIP):**
- `packages/goal-assure-compare/web/index.html` line 14: `<link rel="stylesheet" href="./style.css">` → drop leading `./`
- `packages/goal-assure-compare/web/index.html` line 538 (inline `<script type="module">` block): `import { bootstrap } from './src/ui.js'` — **leave alone**, Vite processes inline-script imports as virtual module entries and rewrites them automatically.
- `packages/goal-assure-compare/web/src/config.js` lines 33-35: 3 `fetch('./*.json')` calls (`extracted_data.json`, `charges.json`, `version_control.json`)
- `packages/goal-assure-compare/web/src/calc.js` lines 20-22: 3 `fetch('./*.json')` calls (`apr_rates.json`, `ci_rates.json`, `care_plus_rates.json`)

**No CSS edits needed.** Term-plan has all CSS inline in `index.html` (no external stylesheet). ULIP has `web/style.css` but verified to contain zero `url('./...')` references.

**Total: 16 individual references across 4 source files + 3 HTML attribute references = 19 mechanical edits across both apps.**

## Operational concerns discovered during plan writing

These were not anticipated in the original brainstorming. They do not change the architecture but they ARE blockers if not addressed by the implementation plan.

### 1. `prepare-data` script must be preserved

Both apps run `node scripts/copy-data.cjs` before every `dev` and `build`. Today their `package.json` scripts look like:

```json
"dev":   "npm run prepare-data && npx vite web",
"build": "npm run prepare-data && npx vite build web",
```

The new package.json files MUST preserve this `&& vite ...` chain (substituting `npx vite` with `vite` since pnpm puts it on PATH). Skipping `prepare-data` breaks term-plan's build because its three source JSON files (`extracted_data.json`, `extracted_formulas_com.json`, `named_ranges.json`) live at the package root and `copy-data.cjs` is what stages them into `web/public/`.

### 2. ULIP's `copy-data.cjs` has a cross-repo reference that will break post-rename

ULIP's `scripts/copy-data.cjs` contains:

```js
const logoSrc = path.resolve(workspaceRoot, '..', 'term-plan-etouch-online-sales', 'web', 'public', 'Bajaj Logo.png');
```

After the migration, ULIP lives at `packages/goal-assure-compare/` and term-plan lives at `packages/shell/` — the relative path `..` + `term-plan-etouch-online-sales` no longer resolves. The script is currently a no-op anyway because of the `&& !fs.existsSync(logoDest)` guard (the logo already exists in ULIP's own `web/public/`). **Plan resolution: delete the cross-repo logo-copy block from `packages/goal-assure-compare/scripts/copy-data.cjs` entirely.** The logo is already committed to ULIP's `web/public/`. The script can be left as a near-empty file (or deleted entirely if `prepare-data` is also dropped — but keeping the script preserves the existing build-script chain unchanged).

### 3. Stale `package-lock.json` files in both source repos

Both source repos contain a `package-lock.json` AND a `node_modules/.pnpm/` directory — they were initially npm projects then later converted to pnpm. The lock files must be deleted from the copies in `packages/shell/` and `packages/goal-assure-compare/` before the root `pnpm install` runs, so pnpm produces a single clean `pnpm-lock.yaml` at the monorepo root.

### 4. Existing tests in term-plan must keep passing

Term-plan has a `tests/` folder with real test scripts (`master.test.js`, `excel_match_test.js`, `verified_tests.js`) referenced by package.json scripts (`test`, `test:excel`, `test:verified`). These should keep working after the migration. The plan must include a regression-check task: run `pnpm --filter @tpc/shell test` after the migration completes and verify pass-rate is unchanged. ULIP has no tests.

### 5. ULIP's vite proxy must be preserved verbatim

ULIP's existing vite.config.ts contains a dev-server proxy:

```ts
server: {
  proxy: {
    '/api/fund-details': {
      target: 'https://online.bajajlife.com',
      changeOrigin: true,
      rewrite: (path) => '/OnlineCustomerPortal/ws/Prelogin/azbj_fund_dtls',
      secure: true,
    }
  }
}
```

The new vite.config.ts must merge `server.port: 5174` INTO this existing `server` block, not replace it. Production deployment of this proxy is a separate concern (the dispatcher must handle `/api/fund-details` at the deployed location) and is **out of scope** for this migration — the proxy only matters in dev mode.

### Section 3: Build orchestration

**Root `package.json`:**

```json
{
  "name": "term-plan-compare",
  "private": true,
  "scripts": {
    "clean":       "rimraf dist",
    "build":       "pnpm clean && pnpm -r --parallel build",
    "build:shell": "pnpm --filter @tpc/shell build",
    "build:gac":   "pnpm --filter @tpc/goal-assure-compare build",
    "dev:shell":   "pnpm --filter @tpc/shell dev",
    "dev:gac":     "pnpm --filter @tpc/goal-assure-compare dev",
    "dev":         "pnpm -r --parallel dev"
  },
  "devDependencies": {
    "rimraf": "^5",
    "vite": "^5"
  }
}
```

**`pnpm-workspace.yaml`:**

```yaml
packages:
  - "packages/*"
```

**Build order:** Both packages emit into disjoint subfolders (`dist/` and `dist/goal-assure-compare/`), so `pnpm -r --parallel build` is safe after the one-time `pnpm clean`. Result is a single `dist/` folder ready for the dispatcher.

**Why `emptyOutDir: false` on both packages:** the root `dist/` is shared. If shell built second with `emptyOutDir: true`, it would wipe `dist/goal-assure-compare/` that ULIP just produced. Instead, the orchestration script `rm -rf`s `dist/` once at the start of a clean build via the `clean` script, then both packages build into it without clobbering each other.

### Section 4: Dev workflow

Three modes:

1. **`pnpm dev:shell`** — runs only term-plan on default Vite port 5173. Use when working on the shell only.
2. **`pnpm dev:gac`** — runs only ULIP on port 5174 (configured via `server.port` in its vite.config to avoid colliding with shell). Use when working on ULIP only.
3. **`pnpm dev`** — runs both concurrently on 5173 + 5174.

Default day-to-day workflow: use `dev:shell` and `dev:gac` separately, because the apps never co-render in production either. `pnpm dev` is the "smoke test both at once" command.

**Important caveat about dev mode and `base`:** Vite honors `base` in dev mode. So `pnpm dev:shell` serves at `http://localhost:5173/term-plan-compare/`, **not** `http://localhost:5173/`. The bare `localhost:5173/` URL will 404. This is intentional — it catches base-path bugs locally instead of in production — but it must be documented for anyone running dev for the first time.

## Migration mechanics

### Phase 1 — Create new root, leave originals alone

1. Create empty folder `Calculators/term-plan-compare/`.
2. Add `package.json`, `pnpm-workspace.yaml`, `.gitignore` (excluding `node_modules`, `dist`, `web-dist`), and an empty `packages/` directory.
3. Originals untouched. Fully reversible.

### Phase 2 — Copy, don't move

Copy each project into its new home (NOT move) so originals remain as a fallback for one cycle:

- `Calculators/goal-assure-ulip-online-sales/` → `Calculators/term-plan-compare/packages/goal-assure-compare/`
- `Calculators/term-plan-etouch-online-sales/` → `Calculators/term-plan-compare/packages/shell/`

**Exclude during copy:** `node_modules/`, `web-dist/`, `.vite/` cache folders.

After both copies land, run `pnpm install` once at the new root. pnpm builds a single hoisted `node_modules` at the monorepo root.

### Phase 3 — Per-package edits

For each of the two new packages:

| File | Change |
|---|---|
| `package.json` | Rename `"name"` to `@tpc/shell` or `@tpc/goal-assure-compare`; remove `"version"` if present (the package is private); preserve all existing scripts. |
| `web/vite.config.ts` | Add `base`, change `outDir`, set `emptyOutDir: false`, set `server.port: 5174` (ULIP only). Preserve any existing custom plugins, define vars, and other settings. |
| `web/index.html` | Drop the leading `./` from every relative `src=`/`href=` reference. |
| `web/src/**/*.js` | Replace every `fetch('./*.json')` and every innerHTML template referencing `./*.png` / `./*.json` with the `${import.meta.env.BASE_URL}<file>` form. |
| `web/style.css` | Verify only — Vite rewrites CSS `url(...)` automatically. |

### Phase 4 — Smoke test in isolation (before deleting anything)

1. `pnpm dev:shell` → open `http://localhost:5173/term-plan-compare/`. Confirm: term-plan loads, logo renders, JSON data fetches succeed, every interactive control works.
2. `pnpm dev:gac` → open `http://localhost:5174/term-plan-compare/goal-assure-compare/`. Confirm: ULIP loads, logo renders, all three JSON files fetch (`extracted_data.json`, `charges.json`, `version_control.json`), the calculator/fund-performance tab switcher in `ui.js` works.
3. `pnpm build` → confirm `dist/index.html` (term-plan) and `dist/goal-assure-compare/index.html` (ULIP) both exist, both reference assets at absolute paths starting with `/term-plan-compare/`.
4. `npx serve dist -p 8080` → browse `http://localhost:8080/term-plan-compare/` and `http://localhost:8080/term-plan-compare/goal-assure-compare/`. **This is the most important check** — production builds expose path bugs that dev mode hides. No console errors, no failed network requests.

### Phase 5 — Delete originals (point of no return)

Only after Phase 4 passes. Delete:

- `Calculators/goal-assure-ulip-online-sales/`
- `Calculators/term-plan-etouch-online-sales/`

Their per-project `node_modules` go with them — significant disk-space win.

### Phase 6 — Git init

The original folders are not currently a git repository. The new monorepo gets `git init` plus an initial commit so there's a known-good recovery point going forward. Tag this commit (e.g. `v0-monorepo-baseline`).

## Risks

1. **Asset-path rewrite misses a reference.** The mechanical find-and-replace is the single highest-risk piece of work. Mitigation: the implementation plan must produce a full catalog of every relative asset reference *before* any edits start, and Phase 4's `npx serve dist` step is the gate that catches any miss.

2. **Vite `emptyOutDir` warning blocking the build.** Vite refuses to emit outside the project root by default. Mitigation: `emptyOutDir: false` plus an inline comment in each vite.config explaining the shared-output reason.

3. **pnpm hoisting changes a transitive dep version.** Each app has its own `node_modules` today with potentially different versions of the same package. Hoisting can promote one version and break the other. Mitigation: run both dev servers and the production build immediately after `pnpm install`. If something breaks, pin the offending package via `pnpm.overrides` in the root `package.json`.

4. **Trailing-slash sensitivity.** `/term-plan-compare` (no slash) and `/term-plan-compare/` behave differently on many static dispatchers. Mitigation: document both URL forms in the test plan. If the dispatcher doesn't auto-redirect, that's a dispatcher-side fix.

5. **Disk space during Phase 2.** Three sets of `node_modules` exist temporarily (two old + one new hoisted). On a constrained machine this can be tens of GB. Mitigation: if disk space is tight, skip the "leave originals alone" rule and accept losing the easy rollback.

## Rollback

- **Phases 1–4 are fully reversible.** Worst case: delete `Calculators/term-plan-compare/` and the two original folders are still in place.
- **Phase 5 is the point of no return.** Do not run it until Phase 4 passes AND the built output served from `npx serve dist` has been eyeballed.
- **Phase 6 (git init)** establishes a recovery point going forward.

## "Done" criteria

1. `pnpm install` at the monorepo root completes cleanly with a single hoisted `node_modules`.
2. `pnpm dev:shell` serves term-plan at `http://localhost:5173/term-plan-compare/`. Page renders, logo loads, JSON fetches succeed, every interactive control works.
3. `pnpm dev:gac` serves ULIP at `http://localhost:5174/term-plan-compare/goal-assure-compare/`. Page renders, logo loads, all three JSON files fetch, the tab switcher works.
4. `pnpm build` produces `dist/index.html` and `dist/goal-assure-compare/index.html`, both referencing assets at absolute paths starting with `/term-plan-compare/`.
5. `npx serve dist -p 8080` followed by browsing both URLs — fully functional, **no console errors, no failed network requests**.
6. Original `goal-assure-ulip-online-sales/` and `term-plan-etouch-online-sales/` folders are deleted.
7. Monorepo is a git repository with one initial commit tagged `v0-monorepo-baseline` (or similar).

## Open questions (non-blocking; resolve during implementation planning)

- Pin a specific Vite version in the root `devDependencies`, or accept whatever `^5` resolves to?
- Set `"packageManager": "pnpm@x.y.z"` in the root `package.json`? (Helps in CI, doesn't matter locally.)
- Top-level `README.md` describing the layout?
- The `scripts/` folders inside each app contain data-prep utilities. Do they stay inside their respective packages, or get hoisted into a third workspace package? Default: leave inside each package.
