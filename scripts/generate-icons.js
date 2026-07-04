/**
 * generate-icons.js — rasterize app/icon.svg into the PWA icon set.
 *
 * Outputs:
 *   public/icon-192.png       (purpose: any)
 *   public/icon-512.png       (purpose: any)
 *   public/icon-maskable-512.png (80% safe zone on #020204)
 *   app/apple-icon.png        (180x180, flattened — Next auto-links it)
 *
 * Run: node scripts/generate-icons.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SVG = fs.readFileSync(path.join(ROOT, "app", "icon.svg"));
const BG = "#020204";

async function renderSquare(size, outPath) {
  const buf = await sharp(SVG, { density: 300 })
    .resize(size, size)
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: buf }])
    .png()
    .toFile(outPath);
  console.log("wrote", path.relative(ROOT, outPath));
}

async function renderMaskable(size, outPath) {
  // Safe zone: artwork occupies 80% of the canvas, centered.
  const inner = Math.round(size * 0.8);
  const buf = await sharp(SVG, { density: 300 })
    .resize(inner, inner)
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: buf, gravity: "center" }])
    .png()
    .toFile(outPath);
  console.log("wrote", path.relative(ROOT, outPath));
}

(async () => {
  await renderSquare(192, path.join(ROOT, "public", "icon-192.png"));
  await renderSquare(512, path.join(ROOT, "public", "icon-512.png"));
  await renderMaskable(512, path.join(ROOT, "public", "icon-maskable-512.png"));
  await renderSquare(180, path.join(ROOT, "app", "apple-icon.png"));
  console.log("done");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
