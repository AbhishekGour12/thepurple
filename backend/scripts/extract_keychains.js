import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_IMG = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/e030079b-06fb-4919-a4d0-9e6eda530674/.user_uploaded/media_1790325268631.jpg';
const OUTPUT_DIR = 'd:/workspace/ThePurple/frontend/public/products/keychains';

// First, let's copy the full collection image
fs.copyFileSync(SRC_IMG, path.join(OUTPUT_DIR, 'keychain-collection.jpg'));

// Keychain extraction specifications based on 1024x1024 source image
// Keychains are oriented ~ -68 deg (leaning right)
const KEYCHAINS = [
  {
    id: 'keychain-sasuke',
    title: 'Sasuke Sharingan Eyes Keychain',
    left: 110,
    top: 120,
    width: 140,
    height: 230,
    angle: 22,
  },
  {
    id: 'keychain-ryuk',
    title: 'Ryuk Death Note Keychain',
    left: 320,
    top: 105,
    width: 130,
    height: 220,
    angle: 22,
  },
  {
    id: 'keychain-tanjiro',
    title: 'Tanjiro Demon Slayer Keychain',
    left: 470,
    top: 85,
    width: 130,
    height: 210,
    angle: 22,
  },
  {
    id: 'keychain-goku',
    title: 'Goku Dragon Ball Z Keychain',
    left: 165,
    top: 360,
    width: 140,
    height: 260,
    angle: 22,
  },
  {
    id: 'keychain-noface',
    title: 'No-Face Kaonashi Keychain',
    left: 380,
    top: 300,
    width: 130,
    height: 270,
    angle: 22,
  },
  {
    id: 'keychain-shadow-wolf',
    title: 'Anime Shadow Wolf Keychain',
    left: 540,
    top: 295,
    width: 145,
    height: 245,
    angle: 22,
  },
  {
    id: 'keychain-itachi',
    title: 'Itachi Uchiha Akatsuki Keychain',
    left: 175,
    top: 680,
    width: 190,
    height: 320,
    angle: 22,
  },
  {
    id: 'keychain-pikachu',
    title: 'Pikachu Pokeball Keychain',
    left: 470,
    top: 615,
    width: 170,
    height: 330,
    angle: 22,
  },
  {
    id: 'keychain-akatsuki',
    title: 'Akatsuki Red Clouds Keychain',
    left: 645,
    top: 525,
    width: 180,
    height: 305,
    angle: 22,
  },
];

async function processAll() {
  console.log('Starting extraction of 9 keychains...');
  
  for (const item of KEYCHAINS) {
    try {
      const croppedBuffer = await sharp(SRC_IMG)
        .extract({ left: item.left, top: item.top, width: item.width, height: item.height })
        .rotate(item.angle, { background: { r: 245, g: 243, b: 248, alpha: 1 } })
        .toBuffer();

      const metadata = await sharp(croppedBuffer).metadata();

      // Create a luxury product background (800x800 square or 896x1200 vertical)
      // Soft aesthetic gradient / light studio backdrop
      const bgWidth = 800;
      const bgHeight = 800;

      // Scale cropped keychain to fit nicely inside 800x800 with padding
      const maxDim = 660;
      const scale = Math.min(maxDim / metadata.height, (maxDim * 0.6) / metadata.width);
      const targetW = Math.round(metadata.width * scale);
      const targetH = Math.round(metadata.height * scale);

      const resizedItem = await sharp(croppedBuffer)
        .resize(targetW, targetH, { fit: 'inside' })
        .toBuffer();

      const resizedMeta = await sharp(resizedItem).metadata();

      // Create clean solid soft aesthetic background
      const compositeX = Math.round((bgWidth - resizedMeta.width) / 2);
      const compositeY = Math.round((bgHeight - resizedMeta.height) / 2);

      // Create gradient/clean studio svg background
      const svgBg = `
        <svg width="${bgWidth}" height="${bgHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="grad" cx="50%" cy="45%" r="65%" fx="50%" fy="40%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="60%" stop-color="#F8F6FC" />
              <stop offset="100%" stop-color="#EDE9FE" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" />
          <ellipse cx="${bgWidth / 2}" cy="${compositeY + resizedMeta.height - 15}" rx="${resizedMeta.width * 0.45}" ry="18" fill="#D8B4FE" opacity="0.35" filter="blur(10px)" />
        </svg>
      `;

      const finalImage = await sharp(Buffer.from(svgBg))
        .composite([
          {
            input: resizedItem,
            top: compositeY,
            left: compositeX,
          },
        ])
        .jpeg({ quality: 95 })
        .toFile(path.join(OUTPUT_DIR, `${item.id}.jpg`));

      console.log(`✅ Saved ${item.id}.jpg`);
    } catch (err) {
      console.error(`❌ Error processing ${item.id}:`, err);
    }
  }

  console.log('\n🎉 Finished processing all keychains!');
}

processAll();
