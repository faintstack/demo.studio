const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dir = path.join(process.cwd(), 'public/backgrounds');
fs.mkdirSync(dir, { recursive: true });

const backgrounds = {
  midnight: (x, y) => [Math.min(100*x/1280, 255), Math.min(50*x/1280, 255), Math.min(200*x/1280+50, 255)],
  aurora:   (x, y) => [0, Math.min(150*x/1280, 255), Math.min(200*x/1280, 255)],
  ember:    (x, y) => [Math.min(220*x/1280+35, 255), Math.min(80*x/1280, 255), Math.min(60*x/1280, 255)],
  forest:   (x, y) => [0, Math.min(160*x/1280+20, 255), Math.min(80*x/1280, 255)],
  slate:    (x, y) => [Math.min(80*x/1280, 255), Math.min(80*x/1280, 255), Math.min(220*x/1280+35, 255)],
  void:     (x, y) => [Math.min(60*x/1280, 255), 0, Math.min(120*x/1280, 255)],
};

for (const [name, fn] of Object.entries(backgrounds)) {
  const pixels = Buffer.alloc(1280 * 720 * 3);
  for (let y = 0; y < 720; y++) {
    for (let x = 0; x < 1280; x++) {
      const [r, g, b] = fn(x, y);
      const i = (y * 1280 + x) * 3;
      pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b;
    }
  }
  sharp(pixels, { raw: { width: 1280, height: 720, channels: 3 } })
    .png()
    .toFile(path.join(dir, `${name}.png`))
    .then(() => console.log(`✅ ${name}.png`));
}