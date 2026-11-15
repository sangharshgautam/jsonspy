import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('1. Building JSONSpy Frontend Bundle...');
execSync('npm run build', { stdio: 'inherit' });

const distDir = path.resolve('dist');
const extMediaDir = path.resolve('vscode-extension/media');

if (!fs.existsSync(distDir)) {
  console.log('1. Building JSONSpy Frontend Bundle...');
  execSync('npm run build', { stdio: 'inherit' });
} else {
  console.log('1. Using existing JSONSpy Frontend Bundle in dist/...');
}

if (!fs.existsSync(extMediaDir)) {
  fs.mkdirSync(extMediaDir, { recursive: true });
}

console.log('2. Copying web bundle to vscode-extension/media/...');
fs.cpSync(distDir, extMediaDir, { recursive: true });

// Copy icon for the extension
const iconSrc = path.resolve('src-tauri/icons/128x128.png');
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(extMediaDir, 'icon.png'));
}

// Copy license for marketplace compliance
const licenseSrc = path.resolve('LICENSE');
if (fs.existsSync(licenseSrc)) {
  fs.copyFileSync(licenseSrc, path.resolve('vscode-extension/LICENSE'));
}

console.log('3. Compiling VS Code extension TypeScript...');
const extDir = path.resolve('vscode-extension');
execSync('node build.js', { cwd: extDir, stdio: 'inherit' });

console.log('\n======================================================');
console.log('✅ VS Code Extension built successfully!');
console.log('Extension directory: vscode-extension');
console.log('To debug: Open JSONSpy in VS Code and press F5 (Extension Development Host)');
console.log('To package: cd vscode-extension && npx @vscode/vsce package');
console.log('======================================================\n');
