const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const webDir = path.join(packageRoot, 'web');
const webPublic = path.join(webDir, 'public');

// Source project (sibling of term-plan-compare at Calculators/)
const sourceRoot = path.resolve(
  packageRoot,
  '..', '..', '..', 'goal-assure-ulip-online-sales'
);
const sourceWeb = path.join(sourceRoot, 'web');

// Files that must NOT be overwritten from the source project — the
// monorepo has its own vite config (different `base`, shared dist dir).
const PRESERVE = new Set(['vite.config.ts']);

function syncTree(src, dest, relPath = '') {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const rel = relPath ? path.join(relPath, entry.name) : entry.name;
    if (PRESERVE.has(rel)) continue;

    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      syncTree(s, d, rel);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

if (fs.existsSync(sourceWeb)) {
  syncTree(sourceWeb, webDir);
  console.log(`Synced source web/ from ${sourceRoot}`);
} else {
  console.warn(`Source web/ not found: ${sourceWeb} — using existing files`);
}

if (!fs.existsSync(webPublic)) fs.mkdirSync(webPublic, { recursive: true });

console.log('Data preparation complete.');
