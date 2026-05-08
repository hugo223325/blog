// Generate simple solid-color PNG icons for PWA
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function createPNG(size, color) {
  // color = [r, g, b] 0-255
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = createChunk("IHDR", ihdrData);

  // Raw pixel data: filter byte + RGB for each pixel, for each row
  const rawData = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 3);
    rawData[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const pixelStart = rowStart + 1 + x * 3;
      rawData[pixelStart] = color[0];
      rawData[pixelStart + 1] = color[1];
      rawData[pixelStart + 2] = color[2];
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk("IDAT", compressed);
  const iend = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcInput);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const iconsDir = path.join(__dirname, "..", "public", "icons");

const blue = [26, 26, 46]; // #1a1a2e

fs.writeFileSync(path.join(iconsDir, "icon-192.png"), createPNG(192, blue));
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), createPNG(512, blue));

console.log("Icons generated successfully!");
