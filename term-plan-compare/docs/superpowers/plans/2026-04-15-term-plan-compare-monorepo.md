# Term-Plan-Compare Monorepo Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure two standalone calculator apps (term-plan eTouch II and ULIP Goal Assure IV) into a single pnpm workspaces monorepo that produces one combined `dist/` artifact, served under base path `/term-plan-compare/` with ULIP at `/term-plan-compare/goal-assure-compare/`.

**Architecture:** New monorepo root `Calculators/term-plan-compare/` with `packages/shell/` (term-plan — the "shell" app at the base path) and `packages/goal-assure-compare/` (ULIP — at the subpath). Both apps remain standalone vanilla-JS Vite builds, emit into disjoint subfolders of a shared `dist/`, and never cross-link at runtime. No micro-frontend runtime, no shared package, no framework conversion, no business-logic changes.

**Tech Stack:** pnpm workspaces, Vite 5, vanilla ES modules. No new runtime dependencies. `rimraf` added as a root devDependency for the clean script.

**Project note:** The project is not currently a git repository. Steps that would normally say "commit" instead say "save and move on". Git is initialized in the final task, after the migration passes its smoke tests, so there is one single known-good baseline instead of a trail of partial commits.

**Spec reference:** `term-plan-compare/docs/superpowers/specs/2026-04-13-term-plan-compare-monorepo-design.md`

---

## File Structure

### New files to create

| File | Responsibility |
|---|---|
| `term-plan-compare/package.json` | Private root; orchestration scripts only (`clean`, `build`, `dev`, per-package filters). Holds `rimraf` + `vite` as dev deps. |
| `term-plan-compare/pnpm-workspace.yaml` | Declares `packages/*` as workspace packages. |
| `term-plan-compare/.gitignore` | Excludes `node_modules/`, `dist/`, `web-dist/`, `.vite/`, `*.stackdump`. |

### Existing files to move (bulk copy, then per-package edits)

- `Calculators/term-plan-etouch-online-sales/` → `term-plan-compare/packages/shell/`
- `Calculators/goal-assure-ulip-online-sales/` → `term-plan-compare/packages/goal-assure-compare/`

Excluded during copy: `node_modules/`, `web-dist/`, `.vite/`, `bash.exe.stackdump`.

### Files to edit in-place after copy

Per-package edits are scoped to these files only. All other files in each package are copied verbatim and left alone.

**`packages/shell/` (term-plan):**
| File | Change |
|---|---|
| `package.json` | Rename to `@tpc/shell`; drop `version`; preserve all scripts (test, dev, build, etc.); swap `npx vite` → `vite` since pnpm puts it on PATH. |
| `web/vite.config.ts` | Set `base: '/term-plan-compare/'`, `outDir: '../../../dist'`, `emptyOutDir: false`. Preserve rollupOptions/assetsDir. |
| `web/index.html` | 2 edits: drop leading `./` from `Bajaj Logo.png` (line 1606) and `src/ui.js` (line 1670). |
| `web/src/config.js` | 3 fetch edits: lines 51, 52, 144 — `./X.json` → `` `${import.meta.env.BASE_URL}X.json` ``. |
| `web/src/calc.js` | 8 fetch edits: lines 61-65 (5 fetches) + 80-82 (3 fetches). |

**`packages/goal-assure-compare/` (ULIP):**
| File | Change |
|---|---|
| `package.json` | Rename to `@tpc/goal-assure-compare`; drop `version`; preserve scripts; swap `npx vite` → `vite`. |
| `web/vite.config.ts` | Set `base: '/term-plan-compare/goal-assure-compare/'`, `outDir: '../../../dist/goal-assure-compare'`, `emptyOutDir: false`; merge `server.port: 5174` into existing `server` block (preserve proxy verbatim). |
| `web/index.html` | 1 edit: drop leading `./` from `style.css` (line 14). Leave the inline `<script type="module">` block alone — Vite rewrites inline-script imports automatically. |
| `web/src/config.js` | 3 fetch edits: lines 33, 34, 35. |
| `web/src/calc.js` | 3 fetch edits: lines 20, 21, 22. |
| `web/src/ui.js` | **1 innerHTML edit: line 40 — `<img src="./Bajaj Logo.png">` inside a template literal. (Not listed in the original spec — discovered during plan-writing inventory. Must be `${import.meta.env.BASE_URL}Bajaj Logo.png`.)** |
| `scripts/copy-data.cjs` | Delete lines 11-17 (the cross-repo logo-copy block). The relative path `..` + `term-plan-etouch-online-sales` no longer resolves inside the monorepo. The logo is already committed to `web/public/Bajaj Logo.png`. |

**Stale lock files (in both packages after copy):**
- `packages/shell/package-lock.json` → delete
- `packages/goal-assure-compare/package-lock.json` → delete
- `packages/shell/pnpm-lock.yaml` → delete
- `packages/goal-assure-compare/pnpm-lock.yaml` → delete

pnpm produces a single fresh `pnpm-lock.yaml` at the monorepo root.

### Files deliberately NOT touched

- `web/style.css` (ULIP) — verified to contain zero `url('./...')` references. Vite rewrites CSS `url()` automatically anyway.
- `web/main.js` (both apps) — verified to contain no asset references matching the pattern.
- `web/tests/` (ULIP) — contains `excel_match_test.js` and `ltcg_test.js` but neither is wired into `package.json` scripts today; they come along with the copy and stay dormant.
- `tests/` (term-plan, top-level) — full regression suite, re-run after migration via `pnpm --filter @tpc/shell test`.
- `scripts/extract_all.py`, data-extraction Python scripts — unchanged.
- Any existing vite config settings not explicitly listed above (custom plugins, define vars, other server settings) — **preserved verbatim**.

### Final build output shape (`term-plan-compare/dist/` after `pnpm build`)

```
dist/
├── index.html                           ← term-plan shell
├── <hashed>.js, <hashed>.css            ← flat (assetsDir: '')
├── Bajaj Logo.png, *.json, ...          ← shell public/ copied in
└── goal-assure-compare/
    ├── index.html                       ← ULIP
    ├── <hashed>.js, <hashed>.css
    └── Bajaj Logo.png, *.json, ...      ← ULIP public/ copied in
```

All asset URLs inside both HTML files reference absolute paths starting with `/term-plan-compare/`.

---

## Phase 1: Scaffold the monorepo root

### Task 1: Create the empty monorepo root folder

**Files:**
- Create: `term-plan-compare/packages/` (empty directory)

Note: `term-plan-compare/` itself already exists because `docs/` was created for the spec.

- [ ] **Step 1: Create the `packages/` directory**

```bash
mkdir -p term-plan-compare/packages
```

- [ ] **Step 2: Verify the layout**

```bash
ls term-plan-compare/
```

Expected: `docs  packages`

---

### Task 2: Create the root `package.json`

**Files:**
- Create: `term-plan-compare/package.json`

- [ ] **Step 1: Write the file**

```json
{
  "name": "term-plan-compare",
  "private": true,
  "scripts": {
    "clean": "rimraf dist",
    "build": "pnpm clean && pnpm -r --parallel build",
    "build:shell": "pnpm --filter @tpc/shell build",
    "build:gac": "pnpm --filter @tpc/goal-assure-compare build",
    "dev": "pnpm -r --parallel dev",
    "dev:shell": "pnpm --filter @tpc/shell dev",
    "dev:gac": "pnpm --filter @tpc/goal-assure-compare dev"
  },
  "devDependencies": {
    "rimraf": "^5.0.0",
    "vite": "^5.0.0"
  },
  "engines": {
    "node": ">=18"
  }
}
```

- [ ] **Step 2: Verify the file parses**

```bash
node -e "console.log(require('./term-plan-compare/package.json').name)"
```

Expected output: `term-plan-compare`

---

### Task 3: Create `pnpm-workspace.yaml`

**Files:**
- Create: `term-plan-compare/pnpm-workspace.yaml`

- [ ] **Step 1: Write the file**

```yaml
packages:
  - "packages/*"
```

- [ ] **Step 2: Verify**

```bash
cat term-plan-compare/pnpm-workspace.yaml
```

Expected: the two lines above, nothing else.

---

### Task 4: Create the root `.gitignore`

**Files:**
- Create: `term-plan-compare/.gitignore`

- [ ] **Step 1: Write the file**

```
node_modules/
dist/
web-dist/
.vite/
*.stackdump
.DS_Store
```

- [ ] **Step 2: Verify**

```bash
ls -la term-plan-compare/.gitignore
```

Expected: file exists, non-zero size.

---

## Phase 2: Copy the two source projects into `packages/`

Both copies exclude `node_modules/`, `web-dist/`, `.vite/`, and `bash.exe.stackdump`. Lock files come along intentionally in this phase and are deleted in Task 7.

### Task 5: Copy term-plan → `packages/shell/`

**Files:**
- Copy: `Calculators/term-plan-etouch-online-sales/` → `Calculators/term-plan-compare/packages/shell/`

- [ ] **Step 1: Copy with exclusions (bash on Windows)**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators"
rsync -a \
  --exclude 'node_modules' \
  --exclude 'web-dist' \
  --exclude '.vite' \
  --exclude 'bash.exe.stackdump' \
  term-plan-etouch-online-sales/ term-plan-compare/packages/shell/
```

If `rsync` is unavailable, fall back to `cp -r` then remove the excluded dirs:

```bash
cp -r term-plan-etouch-online-sales term-plan-compare/packages/shell
rm -rf term-plan-compare/packages/shell/node_modules \
       term-plan-compare/packages/shell/web-dist \
       term-plan-compare/packages/shell/.vite
```

- [ ] **Step 2: Verify the copy**

```bash
ls term-plan-compare/packages/shell/web/
```

Expected: `CALC_ENGINE.md  README.md  index.html  main.js  public  src  style.css  vite.config.ts`

- [ ] **Step 3: Confirm no excluded dirs came along**

```bash
ls term-plan-compare/packages/shell/ | grep -E '^(node_modules|web-dist|\.vite)$' || echo "clean"
```

Expected: `clean`

---

### Task 6: Copy ULIP → `packages/goal-assure-compare/`

**Files:**
- Copy: `Calculators/goal-assure-ulip-online-sales/` → `Calculators/term-plan-compare/packages/goal-assure-compare/`

- [ ] **Step 1: Copy with exclusions**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators"
rsync -a \
  --exclude 'node_modules' \
  --exclude 'web-dist' \
  --exclude '.vite' \
  --exclude 'bash.exe.stackdump' \
  goal-assure-ulip-online-sales/ term-plan-compare/packages/goal-assure-compare/
```

Fallback (same pattern as Task 5) if `rsync` is unavailable.

- [ ] **Step 2: Verify the copy**

```bash
ls term-plan-compare/packages/goal-assure-compare/web/
```

Expected: `index.html  main.js  public  src  style.css  tests  vite.config.ts`

- [ ] **Step 3: Confirm logo is present (key file)**

```bash
ls "term-plan-compare/packages/goal-assure-compare/web/public/Bajaj Logo.png"
```

Expected: the file exists (it was already in ULIP's own `web/public/`).

---

### Task 7: Delete stale lock files from both packages

**Files:**
- Delete: `term-plan-compare/packages/shell/package-lock.json`
- Delete: `term-plan-compare/packages/shell/pnpm-lock.yaml`
- Delete: `term-plan-compare/packages/goal-assure-compare/package-lock.json`
- Delete: `term-plan-compare/packages/goal-assure-compare/pnpm-lock.yaml`

- [ ] **Step 1: Delete all four lock files**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators/term-plan-compare"
rm -f packages/shell/package-lock.json \
      packages/shell/pnpm-lock.yaml \
      packages/goal-assure-compare/package-lock.json \
      packages/goal-assure-compare/pnpm-lock.yaml
```

- [ ] **Step 2: Verify they are gone**

```bash
ls packages/shell/*.yaml packages/shell/*.json packages/goal-assure-compare/*.yaml packages/goal-assure-compare/*.json 2>&1 | grep -E 'lock' || echo "no lock files"
```

Expected: `no lock files`

---

## Phase 3: Rewrite `package.json` for each package

### Task 8: Rewrite `packages/shell/package.json`

**Files:**
- Modify: `term-plan-compare/packages/shell/package.json`

Replace the entire file contents. Rename to `@tpc/shell`, drop `version`, preserve all existing scripts (including the full regression test suite), and swap `npx vite` → `vite`.

- [ ] **Step 1: Write the new contents**

```json
{
  "name": "@tpc/shell",
  "private": true,
  "type": "module",
  "scripts": {
    "prepare-data": "node scripts/copy-data.cjs",
    "dev": "pnpm run prepare-data && vite web",
    "build": "pnpm run prepare-data && vite build web",
    "preview": "vite preview web-dist",
    "test": "node ./tests/master.test.js",
    "test:excel": "node tests/excel_match_test.js",
    "generate:cases": "py scripts/generate_test_cases.py",
    "generate:10k": "py scripts/generate_10k_tests.py",
    "test:10k": "node tests/excel_match_10k.js",
    "test:verified": "node tests/verified_tests.js"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  },
  "engines": {
    "node": ">=18"
  }
}
```

- [ ] **Step 2: Verify it parses and has the expected name**

```bash
node -e "const p=require('./term-plan-compare/packages/shell/package.json'); console.log(p.name, Object.keys(p.scripts).length)"
```

Expected: `@tpc/shell 10`

---

### Task 9: Rewrite `packages/goal-assure-compare/package.json`

**Files:**
- Modify: `term-plan-compare/packages/goal-assure-compare/package.json`

- [ ] **Step 1: Write the new contents**

```json
{
  "name": "@tpc/goal-assure-compare",
  "private": true,
  "type": "module",
  "scripts": {
    "prepare-data": "node scripts/copy-data.cjs",
    "dev": "pnpm run prepare-data && vite web",
    "build": "pnpm run prepare-data && vite build web",
    "preview": "vite preview web-dist"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  },
  "engines": {
    "node": ">=18"
  }
}
```

- [ ] **Step 2: Verify**

```bash
node -e "const p=require('./term-plan-compare/packages/goal-assure-compare/package.json'); console.log(p.name)"
```

Expected: `@tpc/goal-assure-compare`

---

## Phase 4: Rewrite `vite.config.ts` for each package

### Task 10: Rewrite `packages/shell/web/vite.config.ts`

**Files:**
- Modify: `term-plan-compare/packages/shell/web/vite.config.ts`

- [ ] **Step 1: Write the new contents**

```ts
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/term-plan-compare/',
    build: {
        // Shared monorepo dist/ — goal-assure-compare writes into dist/goal-assure-compare/
        // so emptyOutDir MUST stay false; root `pnpm clean` handles wiping dist.
        outDir: '../../../dist',
        emptyOutDir: false,
        assetsDir: '',
        rollupOptions: {
            output: {
                entryFileNames: '[name]-[hash].js',
                chunkFileNames: '[name]-[hash].js',
                assetFileNames: '[name]-[hash].[ext]'
            }
        }
    }
});
```

- [ ] **Step 2: Verify the file is valid TypeScript (parse-only)**

```bash
node -e "require('fs').readFileSync('./term-plan-compare/packages/shell/web/vite.config.ts','utf8').includes('/term-plan-compare/') || (console.error('missing base'), process.exit(1)); console.log('ok')"
```

Expected: `ok`

---

### Task 11: Rewrite `packages/goal-assure-compare/web/vite.config.ts`

**Files:**
- Modify: `term-plan-compare/packages/goal-assure-compare/web/vite.config.ts`

Merges the new `server.port: 5174` setting into the existing `server` block so the fund-details proxy is preserved verbatim.

- [ ] **Step 1: Write the new contents**

```ts
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/term-plan-compare/goal-assure-compare/',
    server: {
        port: 5174,
        proxy: {
            '/api/fund-details': {
                target: 'https://online.bajajlife.com',
                changeOrigin: true,
                rewrite: (path) => '/OnlineCustomerPortal/ws/Prelogin/azbj_fund_dtls',
                secure: true,
            }
        }
    },
    build: {
        // Shared monorepo dist/ — emptyOutDir MUST stay false so the shell build
        // doesn't wipe this subfolder. Root `pnpm clean` handles wiping dist.
        outDir: '../../../dist/goal-assure-compare',
        emptyOutDir: false,
        assetsDir: '',
        rollupOptions: {
            output: {
                entryFileNames: '[name]-[hash].js',
                chunkFileNames: '[name]-[hash].js',
                assetFileNames: '[name]-[hash].[ext]'
            }
        }
    }
});
```

- [ ] **Step 2: Verify**

```bash
node -e "const s=require('fs').readFileSync('./term-plan-compare/packages/goal-assure-compare/web/vite.config.ts','utf8'); ['goal-assure-compare/','5174','/api/fund-details'].forEach(k=>{if(!s.includes(k)){console.error('missing',k);process.exit(1)}}); console.log('ok')"
```

Expected: `ok`

---

## Phase 5: Asset-path rewrites (highest-risk work)

Each task is one file, one or two edits, then a grep-based verification that every stale `./` reference in that file is gone.

### Task 12: Fix `packages/shell/web/index.html` asset references

**Files:**
- Modify: `term-plan-compare/packages/shell/web/index.html` (lines 1606, 1670)

- [ ] **Step 1: Edit line 1606 — logo image**

Replace:
```html
          <img src="./Bajaj Logo.png" alt="Logo" class="logo-icon" />
```

With:
```html
          <img src="Bajaj Logo.png" alt="Logo" class="logo-icon" />
```

- [ ] **Step 2: Edit line 1670 — ui.js script**

Replace:
```html
  <script type="module" src="./src/ui.js"></script>
```

With:
```html
  <script type="module" src="src/ui.js"></script>
```

- [ ] **Step 3: Verify no stale `./` HTML asset references remain in this file**

```bash
grep -nE '(src|href)="\./' term-plan-compare/packages/shell/web/index.html || echo "clean"
```

Expected: `clean`

---

### Task 13: Fix `packages/shell/web/src/config.js` fetch paths

**Files:**
- Modify: `term-plan-compare/packages/shell/web/src/config.js` (lines 51, 52, 144)

- [ ] **Step 1: Edit lines 51-52**

Replace:
```js
        const [dataResp, versionResp] = await Promise.all([
            fetch('./extracted_data.json'),
            fetch('./version_control.json')
        ]);
```

With:
```js
        const [dataResp, versionResp] = await Promise.all([
            fetch(`${import.meta.env.BASE_URL}extracted_data.json`),
            fetch(`${import.meta.env.BASE_URL}version_control.json`)
        ]);
```

- [ ] **Step 2: Edit line 144**

Replace:
```js
            const cpResp = await fetch('./care_plus_validations.json');
```

With:
```js
            const cpResp = await fetch(`${import.meta.env.BASE_URL}care_plus_validations.json`);
```

- [ ] **Step 3: Verify no stale `./*.json` fetches remain in this file**

```bash
grep -nE "fetch\('\./" term-plan-compare/packages/shell/web/src/config.js || echo "clean"
```

Expected: `clean`

---

### Task 14: Fix `packages/shell/web/src/calc.js` fetch paths

**Files:**
- Modify: `term-plan-compare/packages/shell/web/src/calc.js` (lines 61-65, 80-82)

- [ ] **Step 1: Edit the first Promise.all (lines 60-66)**

Replace:
```js
  const [medResp, nonMedResp, adbResp, ciResp, cpResp] = await Promise.all([
    fetch('./medical_rates.json'),
    fetch('./non_medical_rates.json'),
    fetch('./adb_rates.json'),
    fetch('./ci_rates.json'),
    fetch('./care_plus_rates.json'),
  ]);
```

With:
```js
  const [medResp, nonMedResp, adbResp, ciResp, cpResp] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}medical_rates.json`),
    fetch(`${import.meta.env.BASE_URL}non_medical_rates.json`),
    fetch(`${import.meta.env.BASE_URL}adb_rates.json`),
    fetch(`${import.meta.env.BASE_URL}ci_rates.json`),
    fetch(`${import.meta.env.BASE_URL}care_plus_rates.json`),
  ]);
```

- [ ] **Step 2: Edit the second Promise.all (lines 79-83)**

Replace:
```js
    const [hsarResp, fprBaseResp, fprCalcResp] = await Promise.all([
      fetch('./hsar_factors.json'),
      fetch('./fpr_base_rates.json'),
      fetch('./fpr_rate_calculation.json')
    ]);
```

With:
```js
    const [hsarResp, fprBaseResp, fprCalcResp] = await Promise.all([
      fetch(`${import.meta.env.BASE_URL}hsar_factors.json`),
      fetch(`${import.meta.env.BASE_URL}fpr_base_rates.json`),
      fetch(`${import.meta.env.BASE_URL}fpr_rate_calculation.json`)
    ]);
```

- [ ] **Step 3: Verify**

```bash
grep -nE "fetch\('\./" term-plan-compare/packages/shell/web/src/calc.js || echo "clean"
```

Expected: `clean`

---

### Task 15: Fix `packages/goal-assure-compare/web/index.html` asset references

**Files:**
- Modify: `term-plan-compare/packages/goal-assure-compare/web/index.html` (line 14)

Note: the inline `<script type="module">` block around line 537-540 imports `./src/ui.js` — **leave that alone**. Vite processes inline-script imports as virtual module entries and rewrites the final URL correctly. Editing it is unnecessary and breaks Vite's entry-point detection.

- [ ] **Step 1: Edit line 14**

Replace:
```html
  <link rel="stylesheet" href="./style.css" />
```

With:
```html
  <link rel="stylesheet" href="style.css" />
```

- [ ] **Step 2: Verify**

```bash
grep -nE '(src|href)="\./' term-plan-compare/packages/goal-assure-compare/web/index.html || echo "clean"
```

Expected: `clean`

---

### Task 16: Fix `packages/goal-assure-compare/web/src/config.js` fetch paths

**Files:**
- Modify: `term-plan-compare/packages/goal-assure-compare/web/src/config.js` (lines 33-35)

- [ ] **Step 1: Edit the Promise.all**

Replace:
```js
        const [dataResp, chargesResp, versionResp] = await Promise.all([
            fetch('./extracted_data.json'),
            fetch('./charges.json'),
            fetch('./version_control.json')
        ]);
```

With:
```js
        const [dataResp, chargesResp, versionResp] = await Promise.all([
            fetch(`${import.meta.env.BASE_URL}extracted_data.json`),
            fetch(`${import.meta.env.BASE_URL}charges.json`),
            fetch(`${import.meta.env.BASE_URL}version_control.json`)
        ]);
```

- [ ] **Step 2: Verify**

```bash
grep -nE "fetch\('\./" term-plan-compare/packages/goal-assure-compare/web/src/config.js || echo "clean"
```

Expected: `clean`

---

### Task 17: Fix `packages/goal-assure-compare/web/src/calc.js` fetch paths

**Files:**
- Modify: `term-plan-compare/packages/goal-assure-compare/web/src/calc.js` (lines 20-22)

- [ ] **Step 1: Edit the Promise.all**

Replace:
```js
        const [aprR, ciR, cpR] = await Promise.all([
            fetch('./apr_rates.json').catch(() => ({ ok: false })),
            fetch('./ci_rates.json').catch(() => ({ ok: false })),
            fetch('./care_plus_rates.json').catch(() => ({ ok: false }))
        ]);
```

With:
```js
        const [aprR, ciR, cpR] = await Promise.all([
            fetch(`${import.meta.env.BASE_URL}apr_rates.json`).catch(() => ({ ok: false })),
            fetch(`${import.meta.env.BASE_URL}ci_rates.json`).catch(() => ({ ok: false })),
            fetch(`${import.meta.env.BASE_URL}care_plus_rates.json`).catch(() => ({ ok: false }))
        ]);
```

- [ ] **Step 2: Verify**

```bash
grep -nE "fetch\('\./" term-plan-compare/packages/goal-assure-compare/web/src/calc.js || echo "clean"
```

Expected: `clean`

---

### Task 18: Fix `packages/goal-assure-compare/web/src/ui.js` innerHTML logo reference

**Files:**
- Modify: `term-plan-compare/packages/goal-assure-compare/web/src/ui.js` (line 40)

**Not in the original spec** — this reference was discovered during plan-writing inventory. It's inside a template literal assigned to `root.innerHTML`, so Vite has no way to rewrite it at build time. It MUST use `import.meta.env.BASE_URL`.

- [ ] **Step 1: Edit line 40**

Replace:
```js
                        <img src="./Bajaj Logo.png" alt="Bajaj Logo" class="logo-icon" onerror="this.style.display='none'">
```

With:
```js
                        <img src="${import.meta.env.BASE_URL}Bajaj Logo.png" alt="Bajaj Logo" class="logo-icon" onerror="this.style.display='none'">
```

- [ ] **Step 2: Verify no stale `./Bajaj Logo.png` references remain anywhere in `src/`**

```bash
grep -rn "\./Bajaj Logo.png" term-plan-compare/packages/goal-assure-compare/web/src/ || echo "clean"
```

Expected: `clean`

- [ ] **Step 3: Sanity-check that the new reference is present**

```bash
grep -n 'BASE_URL}Bajaj Logo' term-plan-compare/packages/goal-assure-compare/web/src/ui.js
```

Expected: one line matching, near line 40.

---

### Task 19: Sweep-verify no stale `./` asset references remain anywhere

Belt-and-braces check to catch any reference missed by the per-file tasks.

- [ ] **Step 1: Search both packages for stale asset references**

```bash
grep -rnE "(fetch\(['\"]\./|src=['\"]\./|href=['\"]\./)[^)'\"]*\.(json|png|jpg|svg|css|ico)" \
  term-plan-compare/packages/shell/web \
  term-plan-compare/packages/goal-assure-compare/web \
  || echo "clean"
```

Expected: `clean`

If anything appears, stop and fix it before proceeding — this is the gate for all of Phase 5.

---

### Task 20: Clean up `packages/goal-assure-compare/scripts/copy-data.cjs`

**Files:**
- Modify: `term-plan-compare/packages/goal-assure-compare/scripts/copy-data.cjs`

Delete the cross-repo logo-copy block that no longer resolves inside the monorepo. The logo is already committed to ULIP's `web/public/Bajaj Logo.png` so the script has nothing useful to do, but the `prepare-data` npm script still invokes it, so the file must stay.

- [ ] **Step 1: Replace the file contents**

```js
const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const webPublic = path.join(workspaceRoot, 'web', 'public');

if (!fs.existsSync(webPublic)) {
    fs.mkdirSync(webPublic, { recursive: true });
}

console.log('Data preparation complete.');
```

- [ ] **Step 2: Verify it runs cleanly in isolation**

```bash
cd term-plan-compare/packages/goal-assure-compare
node scripts/copy-data.cjs
```

Expected: `Data preparation complete.` and exit code 0.

---

## Phase 6: Install and smoke-test in dev mode

### Task 21: Run `pnpm install` at the monorepo root

**Working directory:** `term-plan-compare/`

- [ ] **Step 1: Install**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators/term-plan-compare"
pnpm install
```

Expected: no errors, a single `node_modules/` and `pnpm-lock.yaml` created at the monorepo root.

- [ ] **Step 2: Verify pnpm detected both workspace packages**

```bash
pnpm -r exec node -e "console.log(require('./package.json').name)"
```

Expected: two lines, `@tpc/shell` and `@tpc/goal-assure-compare` (order may vary).

- [ ] **Step 3: Verify no per-package `node_modules/` was recreated**

```bash
ls packages/shell/node_modules packages/goal-assure-compare/node_modules 2>&1 | grep -i "no such" | wc -l
```

Expected: `2` (both missing — everything hoists to the root).

If pnpm creates per-package `node_modules/`, that is OK too — pnpm does this for packages with conflicting transitive deps. It does NOT block the migration. Note it but move on.

---

### Task 22: Smoke-test the shell in dev mode

- [ ] **Step 1: Start dev server**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators/term-plan-compare"
pnpm dev:shell
```

Expected console output includes: `Local: http://localhost:5173/term-plan-compare/`

- [ ] **Step 2: Open the URL in a browser**

Browse to `http://localhost:5173/term-plan-compare/`. **Not** `http://localhost:5173/` — that URL will 404 because `base` is honored in dev.

Verify all of the following by hand:
- Page renders fully (nav bar, profile card, product cards)
- Bajaj logo visible in the top-left
- DevTools Console: zero errors
- DevTools Network tab: every one of these JSONs returns 200 — `extracted_data.json`, `version_control.json`, `care_plus_validations.json`, `medical_rates.json`, `non_medical_rates.json`, `adb_rates.json`, `ci_rates.json`, `care_plus_rates.json`, `hsar_factors.json`, `fpr_base_rates.json`, `fpr_rate_calculation.json`
- Changing age, gender, smoker status, mode → premium updates reactively
- Opening a rider modal works

- [ ] **Step 3: Stop the dev server**

`Ctrl+C` in the terminal.

- [ ] **Step 4: Gate**

If any of the above failed, stop. Fix, then re-run the step. Do not proceed to Task 23 until the shell smoke test is fully green.

---

### Task 23: Smoke-test goal-assure-compare (ULIP) in dev mode

- [ ] **Step 1: Start dev server**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators/term-plan-compare"
pnpm dev:gac
```

Expected console output includes: `Local: http://localhost:5174/term-plan-compare/goal-assure-compare/`

- [ ] **Step 2: Open the URL in a browser**

Browse to `http://localhost:5174/term-plan-compare/goal-assure-compare/`.

Verify:
- Page renders fully
- Bajaj logo visible in the top-left of the nav (this is the one from the `ui.js` innerHTML — it's the specific regression target of Task 18)
- DevTools Console: zero errors
- DevTools Network tab: these JSONs return 200 — `extracted_data.json`, `charges.json`, `version_control.json`, `apr_rates.json`, `ci_rates.json`, `care_plus_rates.json`
- BI Calculator tab ↔ Fund Performance tab switcher works
- Changing inputs updates outputs
- `style.css` loads (check Network tab and confirm styled page, not bare HTML)

- [ ] **Step 3: Stop the dev server**

`Ctrl+C`.

- [ ] **Step 4: Gate**

If any of the above failed, stop and fix before proceeding.

---

### Task 24: Run the shell regression test suite

Term-plan carries a full regression test suite that MUST still pass after the migration. Any failure here is a migration bug, not a pre-existing issue.

- [ ] **Step 1: Record the baseline pass count before migration**

Note: by the time this plan runs, the originals still exist (they get deleted only in Task 27). Record the baseline now for comparison:

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators/term-plan-etouch-online-sales"
npm test 2>&1 | tail -20 > /tmp/baseline-test-output.txt
cat /tmp/baseline-test-output.txt
```

Record the pass/fail counts.

- [ ] **Step 2: Run the same suite in the monorepo**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators/term-plan-compare"
pnpm --filter @tpc/shell test 2>&1 | tail -20 > /tmp/monorepo-test-output.txt
cat /tmp/monorepo-test-output.txt
```

- [ ] **Step 3: Diff the two**

```bash
diff /tmp/baseline-test-output.txt /tmp/monorepo-test-output.txt || echo "output differs — inspect manually"
```

Expected: either identical, or differs only in timing/paths but pass count is unchanged.

- [ ] **Step 4: Gate**

If the monorepo pass count is lower than the baseline, stop and fix. Do not proceed.

---

## Phase 7: Production build and served-from-disk smoke test

### Task 25: Build production artifact

- [ ] **Step 1: Run the full build**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators/term-plan-compare"
pnpm build
```

Expected: no errors, finishes with two Vite build summaries.

- [ ] **Step 2: Verify output layout**

```bash
ls dist/
ls dist/goal-assure-compare/
```

Expected at `dist/`: `index.html`, hashed `.js`/`.css` files, `Bajaj Logo.png`, the JSON data files, plus a `goal-assure-compare/` subfolder.

Expected at `dist/goal-assure-compare/`: `index.html`, hashed `.js`/`.css` files, `Bajaj Logo.png`, the ULIP JSON files.

- [ ] **Step 3: Verify asset URLs in the built HTML are absolute and prefixed**

```bash
grep -oE '(src|href)="[^"]+"' dist/index.html | head -20
grep -oE '(src|href)="[^"]+"' dist/goal-assure-compare/index.html | head -20
```

Expected: every non-external URL starts with `/term-plan-compare/` (for the shell HTML) or `/term-plan-compare/goal-assure-compare/` (for the ULIP HTML). No `./` prefixes, no bare relative names.

- [ ] **Step 4: Gate**

If any URL is still `./`-prefixed or missing the `/term-plan-compare/` prefix, Phase 5 missed something. Go back and re-run Task 19.

---

### Task 26: Smoke-test the production `dist/` via `npx serve`

**This is the most important check in the entire plan** — dev mode hides path bugs that only show up when assets are served from disk.

- [ ] **Step 1: Serve the dist folder**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators/term-plan-compare"
npx serve dist -p 8080
```

- [ ] **Step 2: Browse both URLs**

- `http://localhost:8080/term-plan-compare/` — shell
- `http://localhost:8080/term-plan-compare/goal-assure-compare/` — ULIP

For each URL, verify:
- Page renders fully
- Logo visible
- DevTools Console: **zero errors**
- DevTools Network tab: **zero failed requests** (no 404s on JSON, no 404s on CSS/JS chunks, no 404s on images)
- Every interactive control works (mode toggle, profile edits, tab switching, rider modals)

- [ ] **Step 3: Stop the server**

`Ctrl+C`.

- [ ] **Step 4: Gate — point of no return acceptance**

This is the gate for Phase 8. If this task doesn't pass cleanly, the monorepo is not ready. Do not delete the originals.

---

## Phase 8: Point-of-no-return — delete originals and initialize git

### Task 27: Delete the original source folders

**Only run this task after Task 26 has passed.** Until now, everything is reversible.

**Files:**
- Delete: `Calculators/term-plan-etouch-online-sales/`
- Delete: `Calculators/goal-assure-ulip-online-sales/`
- Delete: `Calculators/goal-assure-ulip-online-sales.zip` (superseded archive)

- [ ] **Step 1: Delete the originals**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators"
rm -rf term-plan-etouch-online-sales goal-assure-ulip-online-sales goal-assure-ulip-online-sales.zip
```

- [ ] **Step 2: Verify`Calculators/` is down to the essentials**

```bash
ls "/c/Users/Diwakar.Adhikari01/Desktop/Calculators"
```

Expected: `docs  term-plan-compare` (and nothing else except maybe the existing `docs/` folder at the Calculators root if it's still there).

---

### Task 28: Initialize the monorepo as a git repository

- [ ] **Step 1: git init**

```bash
cd "/c/Users/Diwakar.Adhikari01/Desktop/Calculators/term-plan-compare"
git init
```

- [ ] **Step 2: Stage all tracked files**

```bash
git add .
```

- [ ] **Step 3: Verify `.gitignore` did its job**

```bash
git status | grep -E '(node_modules|dist|web-dist|\.vite)' || echo "correctly ignored"
```

Expected: `correctly ignored`

- [ ] **Step 4: Create initial commit**

```bash
git commit -m "Initial monorepo baseline: term-plan shell + goal-assure-compare"
```

- [ ] **Step 5: Tag the baseline**

```bash
git tag v0-monorepo-baseline
```

- [ ] **Step 6: Verify**

```bash
git log --oneline
git tag
```

Expected: one commit, one tag `v0-monorepo-baseline`.

---

## Done criteria

All of the following must be true when the plan is complete:

1. ✅ `term-plan-compare/packages/shell/` and `term-plan-compare/packages/goal-assure-compare/` exist and contain the migrated source.
2. ✅ `pnpm install` at the monorepo root completes without errors.
3. ✅ `pnpm dev:shell` serves term-plan at `http://localhost:5173/term-plan-compare/` — page fully functional, zero console errors.
4. ✅ `pnpm dev:gac` serves ULIP at `http://localhost:5174/term-plan-compare/goal-assure-compare/` — page fully functional, zero console errors.
5. ✅ `pnpm --filter @tpc/shell test` passes with the same pass count as the pre-migration baseline.
6. ✅ `pnpm build` produces `dist/index.html` and `dist/goal-assure-compare/index.html`, all asset URLs prefixed with `/term-plan-compare/`.
7. ✅ `npx serve dist -p 8080` serves both URLs with zero console errors and zero failed network requests.
8. ✅ Original `term-plan-etouch-online-sales/` and `goal-assure-ulip-online-sales/` folders are deleted.
9. ✅ `term-plan-compare/` is a git repository with one initial commit tagged `v0-monorepo-baseline`.

---

## Risks and mitigations (recap from spec)

1. **Asset-path rewrite misses a reference.** Mitigated by Task 19 (sweep grep) and Task 26 (production-served smoke test).
2. **Vite `emptyOutDir` warning blocks the build.** Mitigated by `emptyOutDir: false` in both vite.configs + an inline comment explaining why.
3. **pnpm hoisting changes a transitive dep version.** Mitigated by Task 21 step 3 — if hoisting causes trouble, pin via root `pnpm.overrides`.
4. **Trailing-slash sensitivity at the dispatcher.** Out of this plan's scope; test both URL forms in Task 26 and document any mismatch for the ops team.
5. **Disk space during Phase 2.** Two old `node_modules/` + one new hoisted one can consume tens of GB temporarily. If disk runs out before Task 26, delete the originals early and accept the rollback trade-off.

---

## Open questions (non-blocking, defer to post-migration)

- Pin `"packageManager": "pnpm@x.y.z"` in the root `package.json`? Helps CI, doesn't matter locally.
- Top-level `README.md` describing the monorepo? Not required for the migration; add in a follow-up.
- The `scripts/` folders inside each package contain data-prep Python utilities. Promoting them into a third workspace package is YAGNI for now — leave them in-place.
