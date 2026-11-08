import fs from 'fs';
import path from 'path';

const iconsDir = path.resolve('src-tauri/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateSvgArtwork(width, height, isPoster = false) {
  const logoScale = Math.min(width, height) * 0.35;
  const fontSizeTitle = Math.min(width, height) * 0.08;
  const fontSizeSubtitle = Math.min(width, height) * 0.035;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#082849"/>
    </linearGradient>

    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c8de9"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${width * 0.02}" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Subtle Background Grid Pattern -->
  <g stroke="#1e293b" stroke-width="2" opacity="0.4">
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * (width / 20)}" y1="0" x2="${i * (width / 20)}" y2="${height}"/>`).join('')}
    ${Array.from({ length: 20 }, (_, i) => `<line x1="0" y1="${i * (height / 20)}" x2="${width}" y2="${i * (height / 20)}"/>`).join('')}
  </g>

  <!-- Radial Glow Behind Logo -->
  <circle cx="${width / 2}" cy="${height * (isPoster ? 0.4 : 0.42)}" r="${logoScale * 1.2}" fill="#0c8de9" opacity="0.25" filter="url(#glow)"/>

  <!-- Logo Icon Badge -->
  <g transform="translate(${width / 2 - logoScale / 2}, ${height * (isPoster ? 0.4 : 0.42) - logoScale / 2})">
    <rect width="${logoScale}" height="${logoScale}" rx="${logoScale * 0.22}" fill="url(#brand)"/>

    <!-- Code Brackets { } -->
    <text x="${logoScale * 0.5}" y="${logoScale * 0.68}" font-family="JetBrains Mono, Arial, sans-serif" font-weight="900" font-size="${logoScale * 0.52}" fill="#ffffff" text-anchor="middle">{ }</text>
  </g>

  <!-- Main Title -->
  <text x="${width / 2}" y="${height * (isPoster ? 0.68 : 0.72)}" font-family="Inter, system-ui, Arial, sans-serif" font-weight="900" font-size="${fontSizeTitle}" fill="#ffffff" text-anchor="middle" letter-spacing="-1">
    JSON<tspan fill="#36a9f8">Spy</tspan>
  </text>

  <!-- Subtitle -->
  <text x="${width / 2}" y="${height * (isPoster ? 0.75 : 0.79)}" font-family="Inter, system-ui, Arial, sans-serif" font-weight="600" font-size="${fontSizeSubtitle}" fill="#94a3b8" text-anchor="middle" letter-spacing="1">
    ENTERPRISE WORKBENCH
  </text>
</svg>`;
}

// Write high-res SVG files
fs.writeFileSync(path.join(iconsDir, 'Store_BoxArt_1080x1080.svg'), generateSvgArtwork(1080, 1080, false));
fs.writeFileSync(path.join(iconsDir, 'Store_BoxArt_2160x2160.svg'), generateSvgArtwork(2160, 2160, false));
fs.writeFileSync(path.join(iconsDir, 'Store_PosterArt_720x1080.svg'), generateSvgArtwork(720, 1080, true));
fs.writeFileSync(path.join(iconsDir, 'Store_PosterArt_1440x2160.svg'), generateSvgArtwork(1440, 2160, true));

console.log('Rich SVG Box Art and Poster Art generated successfully!');
