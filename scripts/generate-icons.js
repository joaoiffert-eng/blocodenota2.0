import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192 standard icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('Generated pwa-192x192.png');

  // 512x512 standard icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('Generated pwa-512x512.png');

  // 180x180 Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('Generated apple-touch-icon.png');

  // 512x512 Maskable Icon with 12% safe zone padding and background gradient
  const innerSize = Math.round(512 * 0.78);
  const innerIcon = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .png()
    .toBuffer();

  const backgroundSvg = Buffer.from(`
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563eb" />
          <stop offset="50%" stop-color="#7c3aed" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bg)" />
    </svg>
  `);

  await sharp(backgroundSvg)
    .composite([
      {
        input: innerIcon,
        gravity: 'center'
      }
    ])
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('Generated pwa-maskable-512x512.png');

  // Favicon 64x64
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.ico');
  console.log('Generated favicon.ico');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
