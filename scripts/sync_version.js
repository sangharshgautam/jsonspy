import fs from 'fs';
import path from 'path';

const versionFile = path.resolve('version.txt');
if (!fs.existsSync(versionFile)) {
  console.error('Error: version.txt does not exist.');
  process.exit(1);
}

const version = fs.readFileSync(versionFile, 'utf-8').trim();
console.log(`Synchronizing project version to: ${version}`);

// 1. Update package.json
const pkgPath = path.resolve('package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// 2. Update src-tauri/tauri.conf.json
const tauriPath = path.resolve('src-tauri/tauri.conf.json');
const tauri = JSON.parse(fs.readFileSync(tauriPath, 'utf-8'));
tauri.version = version;
fs.writeFileSync(tauriPath, JSON.stringify(tauri, null, 2) + '\n');

console.log('Successfully synchronized version across package.json and tauri.conf.json!');
