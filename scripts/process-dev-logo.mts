import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const source = path.join(
  process.cwd(),
  "src/app/(public)/images/logo_dev.jpeg"
);
const outDir = path.join(process.cwd(), "public/images");
const output = path.join(outDir, "developer-logo.png");

const TARGET = 512;

async function run() {
  await mkdir(outDir, { recursive: true });

  const { data, info } = await sharp(source)
    .resize(TARGET, TARGET, {
      kernel: sharp.kernel.lanczos3,
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  const threshold = 210;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const avg = (r + g + b) / 3;

    if (avg >= threshold) {
      pixels[i + 3] = 0;
    } else {
      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
      pixels[i + 3] = 255;
    }
  }

  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);

  console.log(`Logo PNG generado: ${output} (${info.width}x${info.height})`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
