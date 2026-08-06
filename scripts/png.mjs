// Codificador PNG mínimo (RGBA crudo -> PNG), sin dependencias nativas.
// Se usa solo para generar imágenes placeholder pixel-art al sembrar datos de ejemplo.
import { deflateSync } from "node:zlib";

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/** rgba: Uint8Array de tamaño width*height*4. Devuelve un Buffer PNG. */
export function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1
    );
  }
  const idat = chunk("IDAT", deflateSync(raw));
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

/**
 * Dibuja una cuadrícula de pixel-art (array de strings) escalada por pixelSize
 * sobre un fondo, y devuelve un Buffer PNG.
 */
export function renderPixelArtPng({ rows, palette, background, pixelSize = 16, padding = 2 }) {
  const cols = rows[0].length;
  const gridW = cols + padding * 2;
  const gridH = rows.length + padding * 2;
  const width = gridW * pixelSize;
  const height = gridH * pixelSize;
  const rgba = new Uint8Array(width * height * 4);

  const bg = hexToRgb(background);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = bg.r;
    rgba[i * 4 + 1] = bg.g;
    rgba[i * 4 + 2] = bg.b;
    rgba[i * 4 + 3] = 255;
  }

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      const color = palette[char];
      if (!color) continue;
      const { r, g, b } = hexToRgb(color);
      const px0 = (x + padding) * pixelSize;
      const py0 = (y + padding) * pixelSize;
      for (let py = 0; py < pixelSize; py++) {
        const rowOffset = ((py0 + py) * width + px0) * 4;
        for (let px = 0; px < pixelSize; px++) {
          const idx = rowOffset + px * 4;
          rgba[idx] = r;
          rgba[idx + 1] = g;
          rgba[idx + 2] = b;
          rgba[idx + 3] = 255;
        }
      }
    }
  }

  return encodePng(width, height, rgba);
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}
