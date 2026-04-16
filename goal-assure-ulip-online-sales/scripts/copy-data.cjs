const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const webPublic = path.join(workspaceRoot, 'web', 'public');

if (!fs.existsSync(webPublic)) {
    fs.mkdirSync(webPublic, { recursive: true });
}

// Copy Bajaj logo from term-plan project if available
const logoSrc = path.resolve(workspaceRoot, '..', 'term-plan-etouch-online-sales', 'web', 'public', 'Bajaj Logo.png');
const logoDest = path.join(webPublic, 'Bajaj Logo.png');
if (fs.existsSync(logoSrc) && !fs.existsSync(logoDest)) {
    fs.copyFileSync(logoSrc, logoDest);
    console.log('Copied Bajaj Logo.png from term-plan project');
}

console.log('Data preparation complete.');
