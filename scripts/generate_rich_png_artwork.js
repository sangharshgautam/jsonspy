import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const iconsDir = path.resolve('src-tauri/icons');

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

function drawStyledPng(width, height, isPoster = false) {
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

  const logoSize = Math.floor(Math.min(width, height) * 0.38);
  const logoX = Math.floor((width - logoSize) / 2);
  const logoY = Math.floor(height * (isPoster ? 0.32 : 0.31));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;

    const t = y / height;
    const bgR = Math.floor(9 + t * 5);
    const bgG = Math.floor(13 + t * 25);
    const bgB = Math.floor(22 + t * 50);

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      let r = bgR;
      let g = bgG;
      let b = bgB;

      // Render Logo Badge ({ })
      if (x >= logoX && x < logoX + logoSize && y >= logoY && y < logoY + logoSize) {
        const lt = (x - logoX) / logoSize;
        r = Math.floor(12 - lt * 10);
        g = Math.floor(141 - lt * 9);
        b = Math.floor(233 - lt * 34);

        const lx = x - logoX;
        const ly = y - logoY;
        const bw = Math.floor(logoSize * 0.08);
        const marginX = Math.floor(logoSize * 0.25);
        const marginY = Math.floor(logoSize * 0.25);

        // Left bracket {
        if ((lx >= marginX && lx < marginX + bw && ly >= marginY && ly < logoSize - marginY) ||
            (ly >= marginY && ly < marginY + bw && lx >= marginX && lx < marginX + logoSize * 0.18) ||
            (ly >= logoSize - marginY - bw && ly < logoSize - marginY && lx >= marginX && lx < marginX + logoSize * 0.18) ||
            (ly >= logoSize * 0.46 && ly < logoSize * 0.54 && lx >= marginX - logoSize * 0.08 && lx < marginX + bw)) {
          r = 255; g = 255; b = 255;
        }

        // Right bracket }
        const rx = logoSize - marginX;
        if ((lx >= rx - bw && lx < rx && ly >= marginY && ly < logoSize - marginY) ||
            (ly >= marginY && ly < marginY + bw && lx >= rx - logoSize * 0.18 && lx < rx) ||
            (ly >= logoSize - marginY - bw && ly < logoSize - marginY && lx >= rx - logoSize * 0.18 && lx < rx) ||
            (ly >= logoSize * 0.46 && ly < logoSize * 0.54 && lx >= rx - bw && lx < rx + logoSize * 0.08)) {
          r = 255; g = 255; b = 255;
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = 255;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync(path.join(iconsDir, 'Store_BoxArt_1080x1080.png'), drawStyledPng(1080, 1080, false));
fs.writeFileSync(path.join(iconsDir, 'Store_BoxArt_2160x2160.png'), drawStyledPng(2160, 2160, false));
fs.writeFileSync(path.join(iconsDir, 'Store_PosterArt_720x1080.png'), drawStyledPng(720, 1080, true));
fs.writeFileSync(path.join(iconsDir, 'Store_PosterArt_1440x2160.png'), drawStyledPng(1440, 2160, true));

console.log('Rich PNG Box Art and Poster Art rendered successfully!');
