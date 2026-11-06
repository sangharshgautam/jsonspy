import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Building JSONSpy Web SPA...');
execSync('npm run build', { stdio: 'inherit' });

const distDir = path.resolve('dist');
const pluginWebviewDir = path.resolve('intellij-plugin/src/main/resources/webview');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist.');
  process.exit(1);
}

if (fs.existsSync(pluginWebviewDir)) {
  fs.rmSync(pluginWebviewDir, { recursive: true, force: true });
}

fs.mkdirSync(pluginWebviewDir, { recursive: true });

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

copyRecursive(distDir, pluginWebviewDir);

// Generate single self-contained HTML for JCEF
let htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
const assetsDir = path.join(distDir, 'assets');

if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);

  // Inline CSS files using replacer function to prevent $ substitution
  for (const file of assetFiles) {
    if (file.endsWith('.css')) {
      const cssContent = fs.readFileSync(path.join(assetsDir, file), 'utf-8');
      const linkRegex = new RegExp(`<link[^>]*href=["'](?:/)?assets/${file}["'][^>]*>`, 'g');
      htmlContent = htmlContent.replace(linkRegex, () => `<style>\n${cssContent}\n</style>`);
    }
  }

  // Inline JS files using replacer function with defer attribute
  for (const file of assetFiles) {
    if (file.endsWith('.js')) {
      const jsContent = fs.readFileSync(path.join(assetsDir, file), 'utf-8');
      const scriptRegex = new RegExp(`<script[^>]*src=["'](?:/)?assets/${file}["'][^>]*>\\s*</script>`, 'g');
      htmlContent = htmlContent.replace(scriptRegex, () => `<script defer>\n${jsContent}\n</script>`);
    }
  }
}

fs.writeFileSync(path.join(pluginWebviewDir, 'single_index.html'), htmlContent);
console.log('Successfully generated self-contained webview/single_index.html for JCEF!');
