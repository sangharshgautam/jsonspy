import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Building JSONSpy Web SPA for Browser Extension...');
execSync('npm run build', { stdio: 'inherit' });

const distDir = path.resolve('dist');
const extensionDistDir = path.resolve('edge-extension/dist');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist.');
  process.exit(1);
}

if (fs.existsSync(extensionDistDir)) {
  fs.rmSync(extensionDistDir, { recursive: true, force: true });
}

fs.mkdirSync(extensionDistDir, { recursive: true });

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(distDir, extensionDistDir);

// Copy extension manifest and background script into dist
fs.copyFileSync(path.resolve('edge-extension/manifest.json'), path.join(extensionDistDir, 'manifest.json'));
fs.copyFileSync(path.resolve('edge-extension/background.js'), path.join(extensionDistDir, 'background.js'));

// Copy icons if available
const iconsSrc = path.resolve('src-tauri/icons');
const iconsDest = path.join(extensionDistDir, 'icons');
if (fs.existsSync(iconsSrc)) {
  if (!fs.existsSync(iconsDest)) fs.mkdirSync(iconsDest, { recursive: true });
  fs.copyFileSync(path.join(iconsSrc, '128x128.png'), path.join(iconsDest, '128x128.png'));
}

console.log('Successfully built Microsoft Edge / Chrome browser extension at edge-extension/dist!');
