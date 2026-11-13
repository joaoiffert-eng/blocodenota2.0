import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAndroidIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const densities = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
  ];

  const baseResDir = path.resolve('android-studio-project/app/src/main/res');

  for (const { folder, size } of densities) {
    const outDir = path.join(baseResDir, folder);
    fs.mkdirSync(outDir, { recursive: true });

    // Square/squircle icon
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));

    // Round icon (clipped to circle)
    const circleMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
    );

    const resized = await sharp(svgBuffer).resize(size, size).png().toBuffer();
    await sharp(resized)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));
  }

  console.log('Generated all Android mipmap icons successfully.');
}

generateAndroidIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
