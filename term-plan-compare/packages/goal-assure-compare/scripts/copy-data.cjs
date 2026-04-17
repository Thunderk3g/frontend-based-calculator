const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const webPublic = path.join(workspaceRoot, 'web', 'public');

if (!fs.existsSync(webPublic)) {
    fs.mkdirSync(webPublic, { recursive: true });
}

console.log('Data preparation complete.');
