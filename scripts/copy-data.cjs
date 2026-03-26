const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const webPublic = path.join(workspaceRoot, 'web', 'public');

if (!fs.existsSync(webPublic)) {
  fs.mkdirSync(webPublic, { recursive: true });
}

const filesToCopy = [
  'extracted_data.json',
  'extracted_formulas_com.json',
  'named_ranges.json'
];

filesToCopy.forEach(f => {
  const src = path.join(workspaceRoot, f);
  const dest = path.join(webPublic, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${f} -> web/public`);
  } else {
    console.warn(`Source not found: ${src}`);
  }
});

console.log('Data preparation complete.');
