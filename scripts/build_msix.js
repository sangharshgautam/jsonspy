import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { execSync } from 'child_process';

const stagingDir = path.resolve('dist-msix/staging');
const assetsDir = path.join(stagingDir, 'Assets');
const outputDir = path.resolve('dist-msix');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Helper to generate valid PNG chunks
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crcBuf]);
}

function drawStyledPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const minDim = Math.min(width, height);
  const badgeSize = Math.floor(minDim * 0.55);
  const badgeX = Math.floor((width - badgeSize) / 2);
  const badgeY = Math.floor((height - badgeSize) / 2);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Inside badge?
      if (x >= badgeX && x < badgeX + badgeSize && y >= badgeY && y < badgeY + badgeSize) {
        // Bright brand blue #0c8de9
        rawData[pixelOffset] = 12;      // R
        rawData[pixelOffset + 1] = 141; // G
        rawData[pixelOffset + 2] = 233; // B
        rawData[pixelOffset + 3] = 255; // A
      } else {
        // Dark background #0f172a
        rawData[pixelOffset] = 15;
        rawData[pixelOffset + 1] = 23;
        rawData[pixelOffset + 2] = 42;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

console.log('1. Generating Appx Visual Assets in Assets/...');
fs.writeFileSync(path.join(assetsDir, 'Square44x44Logo.png'), drawStyledPng(44, 44));
fs.writeFileSync(path.join(assetsDir, 'Square150x150Logo.png'), drawStyledPng(150, 150));
fs.writeFileSync(path.join(assetsDir, 'Wide310x150Logo.png'), drawStyledPng(310, 150));
fs.writeFileSync(path.join(assetsDir, 'Square310x310Logo.png'), drawStyledPng(310, 310));
fs.writeFileSync(path.join(assetsDir, 'StoreLogo.png'), drawStyledPng(50, 50));
fs.writeFileSync(path.join(assetsDir, 'SplashScreen.png'), drawStyledPng(620, 300));

// 2. Locate and copy the executable
console.log('2. Staging JSONSpy executable...');
const sourceExe = path.resolve('src-tauri/target/release/jsonspy_lib.exe');
if (!fs.existsSync(sourceExe)) {
  throw new Error(`Target executable not found at ${sourceExe}. Please run 'npx tauri build' first.`);
}
const destExe = path.join(stagingDir, 'JSONSpy.exe');
fs.copyFileSync(sourceExe, destExe);
console.log(`Copied executable to ${destExe}`);

// 3. Write AppxManifest.xml
const rawVersion = fs.existsSync('version.txt') ? fs.readFileSync('version.txt', 'utf8').trim() : '1.0.4';
const msixVersion = rawVersion.split('.').length === 3 ? `${rawVersion}.0` : rawVersion;
console.log(`3. Writing AppxManifest.xml with version ${msixVersion} and Partner Center identity...`);

const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities">
  <Identity
    Name="Sangharsh.JSONSpy"
    Publisher="CN=2CF8B2FC-AACD-4C91-AA14-5CCD7C34E015"
    Version="${msixVersion}"
    ProcessorArchitecture="x64" />
  <Properties>
    <DisplayName>JSONSpy</DisplayName>
    <PublisherDisplayName>Sangharsh</PublisherDisplayName>
    <Logo>Assets\\StoreLogo.png</Logo>
  </Properties>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.22621.0" />
  </Dependencies>
  <Resources>
    <Resource Language="en-us" />
  </Resources>
  <Applications>
    <Application Id="JSONSpy" Executable="JSONSpy.exe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="JSONSpy"
        Description="Enterprise JSON &amp; Schema Workbench"
        BackgroundColor="transparent"
        Square150x150Logo="Assets\\Square150x150Logo.png"
        Square44x44Logo="Assets\\Square44x44Logo.png">
        <uap:DefaultTile Wide310x150Logo="Assets\\Wide310x150Logo.png" Square310x310Logo="Assets\\Square310x310Logo.png" />
        <uap:SplashScreen Image="Assets\\SplashScreen.png" />
      </uap:VisualElements>
    </Application>
  </Applications>
  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>
</Package>
`;

fs.writeFileSync(path.join(stagingDir, 'AppxManifest.xml'), manifestContent, 'utf8');

// 4. Pack into MSIX using makeappx.exe
const makeAppxPath = 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.26100.0\\x64\\makeappx.exe';
const outputMsix = path.join(outputDir, `JSONSpy_${rawVersion}_x64.msix`);

console.log(`4. Running makeappx.exe to produce ${outputMsix}...`);
execSync(`"${makeAppxPath}" pack /v /o /d "${stagingDir}" /p "${outputMsix}"`, { stdio: 'inherit' });

const stats = fs.statSync(outputMsix);
console.log(`\nSUCCESS! MSIX generated successfully!`);
console.log(`Output: ${outputMsix}`);
console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

