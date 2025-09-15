import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC_SVG = path.join(ROOT, 'favicon.svg');
const targets = [
  { size: 192, file: path.join(ROOT, 'icon-192.png') },
  { size: 512, file: path.join(ROOT, 'icon-512.png') },
];

async function ensureSvgExists() {
  try {
    await fs.access(SRC_SVG);
  } catch {
    throw new Error('favicon.svg not found at project root');
  }
}

async function generate() {
  await ensureSvgExists();
  const svgBuffer = await fs.readFile(SRC_SVG);
  for (const t of targets) {
    const png = await sharp(svgBuffer, { density: 384 })
      .resize(t.size, t.size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await fs.writeFile(t.file, png);
    // eslint-disable-next-line no-console
    console.log(`Generated ${path.basename(t.file)}`);
  }
}

generate().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

