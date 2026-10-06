import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import r2Service from '../src/services/r2Service.js';
import sequelize from '../src/config/database.js';
import {
  Product,
  ProductImage,
  ProductVariant,
  Category,
  Subcategory,
  Color,
  Size,
} from '../src/models/index.js';
import { PRODUCT_STATUS } from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function uploadLocalToR2(filePath, targetFilename) {
  try {
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      const res = await r2Service.uploadImage(buffer, targetFilename, mime, 'products');
      const url = res?.imageUrl || res?.publicUrl || res?.url;
      const r2Key = res?.r2Key || res?.key;
      console.log(`✅ Uploaded ${targetFilename} -> ${url}`);
      return { url, r2Key };
    } else {
      console.warn(`⚠️ File not found: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Upload error for ${targetFilename}:`, err.message);
  }
  return null;
}

async function run() {
  console.log('🚀 Starting Product Creation with Root Images...');
  await sequelize.authenticate();
  console.log('✅ Connected to database');

  // Upload all images from root
  const imgStitchRedBow = await uploadLocalToR2(path.join(rootDir, 'WhatsApp Image 2026-10-06 at 9.57.56 AM.jpeg'), 'stitch-red-bow.jpg');
  const imgStitchPinkBow = await uploadLocalToR2(path.join(rootDir, 'WhatsApp Image 2026-10-06 at 9.57.56 AM (1).jpeg'), 'stitch-pink-bow.jpg');
  const imgPinkMonkey = await uploadLocalToR2(path.join(rootDir, 'showcase_01_pink_monkey.jpg'), 'pink-monkey-plush-keychain.jpg');
  const imgDuckSide = await uploadLocalToR2(path.join(rootDir, 'showcase_02_twisted_duck_side.jpg'), 'twisted-duck-side.jpg');
  const imgDuckFront = await uploadLocalToR2(path.join(rootDir, 'showcase_03_twisted_duck_front.jpg'), 'twisted-duck-front.jpg');
  const imgStitchBlueOverhead = await uploadLocalToR2(path.join(rootDir, 'showcase_06_blue_stitch_overhead.jpg'), 'stitch-blue-overhead.jpg');
  const imgStitchBlueStudio = await uploadLocalToR2(path.join(rootDir, 'showcase_07_blue_stitch_studio.jpg'), 'stitch-blue-studio.jpg');
  const imgAngelPinkOverhead = await uploadLocalToR2(path.join(rootDir, 'showcase_08_pink_angel_overhead.jpg'), 'angel-pink-overhead.jpg');
  const imgAngelPinkStudio = await uploadLocalToR2(path.join(rootDir, 'showcase_09_pink_angel_studio.jpg'), 'angel-pink-studio.jpg');
  const imgStitchPurpleStudio = await uploadLocalToR2(path.join(rootDir, 'showcase_10_purple_stitch_studio.jpg'), 'stitch-purple-studio.jpg');

  // Brain images for jewelry / bracelet / hair accessories
  const brainDir = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\1817420b-ac9f-45de-9e24-9262a90c61ea';
  const imgBracelet = await uploadLocalToR2(path.join(brainDir, 'butterfly_bracelet_1791114590182.jpg'), 'crystal-charm-bracelet.jpg');
  const imgRing = await uploadLocalToR2(path.join(brainDir, 'solitaire_ring_1791114608007.jpg'), 'solitaire-crown-ring.jpg');
  const imgHairClips = await uploadLocalToR2(path.join(brainDir, 'pearl_hair_clips_1791114644625.jpg'), 'korean-pearl-hair-clips.jpg');

  console.log('✅ All Image uploads completed!');
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
