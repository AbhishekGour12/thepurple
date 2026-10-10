import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'https://api.nowthepurple.com/api/v1/admin';

// R2 WebP URLs
const IMAGES = {
  stitchRedBow: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270822863-7deb322617eed6cd62977156c5418a84.webp',
    r2Key: 'products/1791270822863-7deb322617eed6cd62977156c5418a84.webp',
    altText: 'Stitch with Red Bow and Scrump Plush Keychain',
  },
  stitchPinkBow: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270824792-74a297adf0be2df47a8adce3f122aa74.webp',
    r2Key: 'products/1791270824792-74a297adf0be2df47a8adce3f122aa74.webp',
    altText: 'Stitch with Pink Bow and Scrump Plush Keychain',
  },
  pinkMonkey: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270825886-23c5c5363da649e41116e7f55b7b8534.webp',
    r2Key: 'products/1791270825886-23c5c5363da649e41116e7f55b7b8534.webp',
    altText: 'Kawaii Pink Monkey Magazine Plush Charm',
  },
  duckSide: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270826994-e60d2f6ad2d686bebfe1acae5e8fb680.webp',
    r2Key: 'products/1791270826994-e60d2f6ad2d686bebfe1acae5e8fb680.webp',
    altText: 'Twisted Neck Duck with Rain Hat Side Profile',
  },
  duckFront: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270828060-fe2c109af4220143e94758823e47d841.webp',
    r2Key: 'products/1791270828060-fe2c109af4220143e94758823e47d841.webp',
    altText: 'Twisted Neck Duck with Rain Hat Front View',
  },
  stitchBlueOverhead: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270829083-75eb2bcb69c66e4aaea264ffde4cca20.webp',
    r2Key: 'products/1791270829083-75eb2bcb69c66e4aaea264ffde4cca20.webp',
    altText: 'Classic Blue Stitch Overhead Angle',
  },
  stitchBlueStudio: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270830119-69d0ffd714bbb113971de8a83dbb9898.webp',
    r2Key: 'products/1791270830119-69d0ffd714bbb113971de8a83dbb9898.webp',
    altText: 'Classic Blue Stitch Studio View',
  },
  angelPinkOverhead: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270831153-116c230813df132839f59a36163a3e24.webp',
    r2Key: 'products/1791270831153-116c230813df132839f59a36163a3e24.webp',
    altText: 'Pastel Pink Angel Overhead Angle',
  },
  angelPinkStudio: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270832192-7f7cccaf80230c74789a529c69f52614.webp',
    r2Key: 'products/1791270832192-7f7cccaf80230c74789a529c69f52614.webp',
    altText: 'Pastel Pink Angel Studio View',
  },
  stitchPurpleStudio: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270833354-fef4e6b83c2204a1a9be666ce5e1cd1f.webp',
    r2Key: 'products/1791270833354-fef4e6b83c2204a1a9be666ce5e1cd1f.webp',
    altText: 'Lavender Purple Stitch Studio View',
  },
  crystalBracelet: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270834392-34b1dfbf5bdd13602c882bda18231e28.webp',
    r2Key: 'products/1791270834392-34b1dfbf5bdd13602c882bda18231e28.webp',
    altText: 'Crystal Butterfly Gemstone Healing Stretch Bracelet',
  },
  solitaireRing: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270835460-673d756b5250949f4ad81ed4113b0a60.webp',
    r2Key: 'products/1791270835460-673d756b5250949f4ad81ed4113b0a60.webp',
    altText: 'Princess Crown Solitaire AAA+ Zirconia Sparkle Ring',
  },
  pearlHairClips: {
    imageUrl: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270836573-2331b586f0b2ab6941eec6e8666db107.webp',
    r2Key: 'products/1791270836573-2331b586f0b2ab6941eec6e8666db107.webp',
    altText: 'Korean Aesthetic Pearl Bow & Floral Hairpins Claw Clip Pack',
  },
};

const CATEGORIES_SETUP = [
  {
    name: 'Gifts & Celebration Hampers',
    slug: 'gifts-celebration-hampers',
    description: 'Handcrafted gifts, crochet bouquets, teddy hampers and celebration sets.',
    subcategories: [
      { name: 'Teddy & Plush Gifts', slug: 'teddy-plush-gifts', description: 'Cute kawaii plush toys and keychains.' },
    ],
  },
  {
    name: 'Jewellery & Ornaments',
    slug: 'jewellery-ornaments',
    description: 'Luxury handcrafted jewelry, bracelets, rings and ornaments.',
    subcategories: [
      { name: 'Charm Bracelets', slug: 'charm-bracelets', description: 'Handmade beaded and charm bracelets.' },
      { name: 'Cocktail & Solitaire Rings', slug: 'cocktail-solitaire-rings', description: 'Solitaire and sparkle rings.' },
    ],
  },
  {
    name: 'Hair Accesseries',
    slug: 'hair-accesseries',
    description: 'Luxury hair clips, clatures, claw clips, and hair accessories.',
    subcategories: [
      { name: 'Clatures & Hair Claws', slug: 'clatures-hair-claws', description: 'Premium claw clips and clatures.' },
    ],
  },
];

const COLORS_SETUP = [
  { name: 'Classic Stitch Blue', hexCode: '#2563EB' },
  { name: 'Pastel Angel Pink', hexCode: '#F472B6' },
  { name: 'Lavender Purple', hexCode: '#A855F7' },
  { name: 'Stitch with Red Bow', hexCode: '#EF4444' },
  { name: 'Stitch with Pink Bow', hexCode: '#FB7185' },
  { name: 'Emerald Green', hexCode: '#10B981' },
  { name: 'Rose Gold', hexCode: '#B76E79' },
  { name: 'Golden Yellow', hexCode: '#F59E0B' },
  { name: 'Pure White', hexCode: '#FFFFFF' },
];

const SIZES_SETUP = [
  { name: '6 mm (Delicate Bead)', code: '6MM' },
  { name: '8 mm (Standard Bead)', code: '8MM' },
  { name: '10 mm (Statement Bead)', code: '10MM' },
  { name: '12 mm (Chunky Power Bead)', code: '12MM' },
  { name: 'Ring Size 6 (16.5 mm)', code: 'SZ6' },
  { name: 'Ring Size 7 (17.3 mm)', code: 'SZ7' },
  { name: 'Ring Size 8 (18.1 mm)', code: 'SZ8' },
  { name: 'Free Size / Adjustable', code: 'ADJ' },
];

async function runLivePipeline() {
  console.log('🚀 Starting Live API Seeding on https://api.nowthepurple.com...\n');

  // 1. Admin Login
  console.log('1️⃣ Authenticating with Live API...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_INITIAL_EMAIL || 'nowthepurple25@gmail.com',
      password: process.env.ADMIN_INITIAL_PASSWORD || '123456',
    }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.token;
  if (!token) throw new Error(`Could not login to live API: ${JSON.stringify(loginJson)}`);
  console.log('✅ Admin Authenticated Successfully!\n');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Categories and Subcategories
  console.log('2️⃣ Ensuring Categories and Subcategories...');
  const catRes = await fetch(`${API_BASE}/categories`, { headers: authHeaders });
  const catJson = await catRes.json();
  const existingCats = catJson.data?.categories || [];

  const subRes = await fetch(`${API_BASE}/subcategories`, { headers: authHeaders });
  const subJson = await subRes.json();
  const existingSubs = subJson.data?.subcategories || [];

  const categoryMap = {};
  existingCats.forEach((c) => (categoryMap[c.slug] = c));
  const subcategoryMap = {};
  existingSubs.forEach((s) => (subcategoryMap[s.slug] = s));

  for (const cData of CATEGORIES_SETUP) {
    let cat = categoryMap[cData.slug];
    if (!cat) {
      console.log(`   ➕ Creating Category: ${cData.name}...`);
      const createCatRes = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: cData.name, slug: cData.slug, description: cData.description, isActive: true }),
      });
      const createCatJson = await createCatRes.json();
      if (createCatJson.success && createCatJson.data?.category) {
        cat = createCatJson.data.category;
        categoryMap[cData.slug] = cat;
      }
    }
    if (cat && cData.subcategories) {
      for (const sData of cData.subcategories) {
        let sub = subcategoryMap[sData.slug];
        if (!sub) {
          console.log(`      ➕ Creating Subcategory: ${sData.name}...`);
          const createSubRes = await fetch(`${API_BASE}/subcategories`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ categoryId: cat.id, name: sData.name, slug: sData.slug, description: sData.description, isActive: true }),
          });
          const createSubJson = await createSubRes.json();
          if (createSubJson.success && createSubJson.data?.subcategory) {
            sub = createSubJson.data.subcategory;
            subcategoryMap[sData.slug] = sub;
          }
        }
      }
    }
  }

  // 3. Colors
  console.log('\n3️⃣ Ensuring Colors...');
  const colorRes = await fetch(`${API_BASE}/colors`, { headers: authHeaders });
  const colorJson = await colorRes.json();
  const existingColors = colorJson.data?.colors || [];
  const colorMap = {};
  existingColors.forEach((c) => (colorMap[c.name] = c.id));

  for (const c of COLORS_SETUP) {
    if (!colorMap[c.name]) {
      const createColorRes = await fetch(`${API_BASE}/colors`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: c.name, hexCode: c.hexCode, isActive: true }),
      });
      const createColorJson = await createColorRes.json();
      if (createColorJson.success && createColorJson.data?.color) {
        colorMap[c.name] = createColorJson.data.color.id;
        console.log(`   🎨 Color Created: ${c.name}`);
      }
    }
  }

  // 4. Sizes
  console.log('\n4️⃣ Ensuring Sizes...');
  const sizeRes = await fetch(`${API_BASE}/sizes`, { headers: authHeaders });
  const sizeJson = await sizeRes.json();
  const existingSizes = sizeJson.data?.sizes || [];
  const sizeMap = {};
  existingSizes.forEach((s) => (sizeMap[s.name] = s.id));

  for (const s of SIZES_SETUP) {
    if (!sizeMap[s.name]) {
      const createSizeRes = await fetch(`${API_BASE}/sizes`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: s.name, code: s.code, isActive: true }),
      });
      const createSizeJson = await createSizeRes.json();
      if (createSizeJson.success && createSizeJson.data?.size) {
        sizeMap[s.name] = createSizeJson.data.size.id;
        console.log(`   📏 Size Created: ${s.name}`);
      }
    }
  }

  // 5. Products Definition for Live API
  const productsToPublish = [
    // 1. Multi-Color Variants: Disney Stitch & Angel Plush Keychain Charm
    {
      name: 'Disney Kawaii Stitch & Angel Soft Plush Keychain Charm',
      sku: 'TP-STITCH-PLUSH-COLOR-SERIES',
      slug: 'disney-kawaii-stitch-angel-soft-plush-keychain-charm',
      categorySlug: 'gifts-celebration-hampers',
      subcategorySlug: 'teddy-plush-gifts',
      price: 1.0,
      salePrice: 1.0,
      discountPercent: 0,
      stock: 250,
      brand: 'ThePurple Kawaii',
      badge: 'COLOR VARIANTS',
      isFeatured: true,
      isBestSeller: true,
      isBulk: false,
      minOrderQuantity: 1,
      shortDescription: 'Ultra-soft furry Disney Stitch and Angel plush doll keychains available in 5 delightful colorways and bow styles with gold keyring.',
      description: `Bring playful magic everywhere you go with our Disney Kawaii Stitch & Angel Soft Plush Keychain Charm series!

Lovingly crafted from ultra-soft micro-plush velvet fur, each keychain features iconic large expressive anime eyes, embroidered detailing, plush ears, and a high-strength gold metal snap keyring clasp.

Choose your favorite character shade:
• Classic Royal Stitch Blue
• Pastel Sweet Angel Pink
• Cosmic Lavender Purple
• Stitch with Red Bow & Mini Scrump Doll
• Stitch with Pink Bow & Mini Scrump Doll`,
      specifications: JSON.stringify({
        "Product Type": "Plush Keychain / Bag Charm",
        "Character": "Disney Stitch & Angel Series",
        "Material": "Ultra-Soft Microfiber Fur + High-Elastic PP Cotton",
        "Hardware": "Gold Plated Snap Lobster Clasp & Ring",
        "Height": "Approx. 12 - 14 cm",
        "Variants Available": "5 Unique Colorways & Bow Styles"
      }, null, 2),
      careInstructions: 'Spot clean with mild soapy water and a soft cloth. Air dry naturally.',
      tags: ['Stitch', 'Angel', 'Plush Keychain', 'Kawaii Gift', 'Bag Charm', 'Color Variants', 'ThePurple'],
      images: [
        { imageUrl: IMAGES.stitchBlueStudio.imageUrl, r2Key: IMAGES.stitchBlueStudio.r2Key, altText: 'Stitch Blue Studio View', isPrimary: true, displayOrder: 0 },
        { imageUrl: IMAGES.angelPinkStudio.imageUrl, r2Key: IMAGES.angelPinkStudio.r2Key, altText: 'Angel Pink Studio View', isPrimary: false, displayOrder: 1 },
        { imageUrl: IMAGES.stitchPurpleStudio.imageUrl, r2Key: IMAGES.stitchPurpleStudio.r2Key, altText: 'Purple Stitch Studio View', isPrimary: false, displayOrder: 2 },
        { imageUrl: IMAGES.stitchRedBow.imageUrl, r2Key: IMAGES.stitchRedBow.r2Key, altText: 'Stitch with Red Bow', isPrimary: false, displayOrder: 3 },
        { imageUrl: IMAGES.stitchPinkBow.imageUrl, r2Key: IMAGES.stitchPinkBow.r2Key, altText: 'Stitch with Pink Bow', isPrimary: false, displayOrder: 4 },
      ],
      variants: [
        { name: 'Classic Stitch Blue', colorId: colorMap['Classic Stitch Blue'], sku: 'TP-STITCH-VAR-BLUE', mrp: 1.0, salePrice: 1.0, stock: 50, imageUrl: IMAGES.stitchBlueStudio.imageUrl },
        { name: 'Pastel Angel Pink', colorId: colorMap['Pastel Angel Pink'], sku: 'TP-STITCH-VAR-PINK', mrp: 1.0, salePrice: 1.0, stock: 50, imageUrl: IMAGES.angelPinkStudio.imageUrl },
        { name: 'Lavender Purple', colorId: colorMap['Lavender Purple'], sku: 'TP-STITCH-VAR-PURPLE', mrp: 1.0, salePrice: 1.0, stock: 50, imageUrl: IMAGES.stitchPurpleStudio.imageUrl },
        { name: 'Stitch with Red Bow', colorId: colorMap['Stitch with Red Bow'], sku: 'TP-STITCH-VAR-RED-BOW', mrp: 1.0, salePrice: 1.0, stock: 50, imageUrl: IMAGES.stitchRedBow.imageUrl },
        { name: 'Stitch with Pink Bow', colorId: colorMap['Stitch with Pink Bow'], sku: 'TP-STITCH-VAR-PINK-BOW', mrp: 1.0, salePrice: 1.0, stock: 50, imageUrl: IMAGES.stitchPinkBow.imageUrl },
      ],
    },

    // 2. Multi-Angle Personality Product: Quirky Twisted Neck Duck
    {
      name: 'Quirky Twisted-Neck White Duck Plush with Yellow Rain Hat',
      sku: 'TP-TWISTED-DUCK-RAINHAT',
      slug: 'quirky-twisted-neck-white-duck-plush-yellow-rain-hat',
      categorySlug: 'gifts-celebration-hampers',
      subcategorySlug: 'teddy-plush-gifts',
      price: 1.0,
      salePrice: 1.0,
      discountPercent: 0,
      stock: 120,
      brand: 'ThePurple Quirky',
      badge: 'MEME FAVORITE',
      isFeatured: true,
      isBestSeller: true,
      isBulk: false,
      minOrderQuantity: 1,
      shortDescription: 'Hilarious bendable twisted-neck duck plush dressed in a vibrant yellow rain bucket hat and wide curious googly eyes.',
      description: `Meet the viral sensation: The Quirky Twisted-Neck White Duck Plush with Yellow Rain Hat! 

Featuring a flexible bendable long neck that you can twist into funny poses, signature cartoon wide eyes, orange bill and webbed feet, all topped with a cheerful bright yellow fisherman rain hat.`,
      specifications: JSON.stringify({
        "Product Type": "Meme Character Plush Figurine",
        "Design": "Twisted Neck Duck with Rain Hat",
        "Material": "Soft Velboa Fabric + Wire-Reinforced Flexible Neck",
        "Color": "Snow White & Sunny Yellow",
        "Height": "Approx. 20 cm"
      }, null, 2),
      careInstructions: 'Gently wipe with dry or damp cloth. Do not immerse in water.',
      tags: ['Duck Plush', 'Twisted Duck', 'Funny Gift', 'Meme Toy', 'Yellow Hat', 'ThePurple Gifts'],
      images: [
        { imageUrl: IMAGES.duckSide.imageUrl, r2Key: IMAGES.duckSide.r2Key, altText: 'Twisted Duck Side Profile', isPrimary: true, displayOrder: 0 },
        { imageUrl: IMAGES.duckFront.imageUrl, r2Key: IMAGES.duckFront.r2Key, altText: 'Twisted Duck Front View', isPrimary: false, displayOrder: 1 },
      ],
    },

    // 3. Single Editorial Keychain: Pink Monkey
    {
      name: 'Kawaii Fluffy Baby Pink Monkey Hanging Plush Bag Charm',
      sku: 'TP-PINK-MONKEY-CHARM',
      slug: 'kawaii-fluffy-baby-pink-monkey-hanging-plush-bag-charm',
      categorySlug: 'gifts-celebration-hampers',
      subcategorySlug: 'teddy-plush-gifts',
      price: 1.0,
      salePrice: 1.0,
      discountPercent: 0,
      stock: 90,
      brand: 'ThePurple Luxury Charms',
      badge: 'TRENDING',
      isFeatured: true,
      isBestSeller: false,
      isBulk: false,
      minOrderQuantity: 1,
      shortDescription: 'Charming pastel baby pink long-limbed monkey plush keychain with cheerful smile and premium gold lobster hook.',
      description: `Infuse your daily style with playful cuteness! The Kawaii Fluffy Baby Pink Monkey Hanging Plush Bag Charm features cloud-like soft faux fur in pastel pink, an adorable cream snout with embroidered smile, and long cuddly arms.`,
      specifications: JSON.stringify({
        "Type": "Animal Plush Bag Charm & Keychain",
        "Character": "Smiley Long-Arm Pink Monkey",
        "Material": "Premium Long-Pile Soft Faux Fur",
        "Clasp": "Heavy-Duty Gold Plated Lobster Swivel Clasp",
        "Size": "Approx. 15 cm"
      }, null, 2),
      careInstructions: 'Brush fur gently with soft bristles. Spot clean only.',
      tags: ['Pink Monkey', 'Plush Charm', 'Kawaii Keychain', 'Bag Accessory', 'Cute Gifts'],
      images: [
        { imageUrl: IMAGES.pinkMonkey.imageUrl, r2Key: IMAGES.pinkMonkey.r2Key, altText: 'Pink Monkey Magazine Showcase', isPrimary: true, displayOrder: 0 },
      ],
    },

    // 4. MM Size Variants: Crystal Gemstone Bracelet
    {
      name: 'Natural Crystal Butterfly & Healing Gemstone Stretch Bracelet',
      sku: 'TP-BRAC-CRYSTAL-BEADS-MM',
      slug: 'natural-crystal-butterfly-healing-gemstone-stretch-bracelet',
      categorySlug: 'jewellery-ornaments',
      subcategorySlug: 'charm-bracelets',
      price: 1.0,
      salePrice: 1.0,
      discountPercent: 0,
      stock: 180,
      brand: 'ThePurple Jewels',
      badge: 'SIZE VARIANTS',
      isFeatured: true,
      isBestSeller: true,
      isBulk: false,
      minOrderQuantity: 1,
      shortDescription: 'High-grade natural gemstone beaded bracelet with 18K gold butterfly charm, available in 6mm, 8mm, 10mm, and 12mm bead sizes.',
      description: `Balance your aura and elevate your wrist stack with our Natural Crystal Butterfly & Healing Gemstone Stretch Bracelet. 

Choose your ideal bead size:
• 6 mm Beads — Delicate, subtle and perfect for multi-layer stacking
• 8 mm Beads — Standard classic everyday fit
• 10 mm Beads — Bold, prominent aesthetic statement
• 12 mm Beads — Chunky power bead profile for maximum gemstone energy`,
      specifications: JSON.stringify({
        "Type": "Gemstone Beaded Stretch Bracelet",
        "Stone Quality": "Grade AAA Natural Polished Stones",
        "Bead Sizes": "6mm, 8mm, 10mm, 12mm",
        "Cord": "High-Durability Quad-Core Elastic Stretch",
        "Charm": "18K Gold PVD Plated Anti-Tarnish Butterfly"
      }, null, 2),
      careInstructions: 'Keep away from harsh chemicals and perfumes. Wipe with soft cloth.',
      tags: ['Crystal Bracelet', 'Gemstone Beads', '6mm Beads', '8mm Beads', '10mm Beads', 'Butterfly Charm', 'Size Variants'],
      images: [
        { imageUrl: IMAGES.crystalBracelet.imageUrl, r2Key: IMAGES.crystalBracelet.r2Key, altText: 'Crystal Butterfly Gemstone Bracelet', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: '6 mm (Delicate Bead)', sizeId: sizeMap['6 mm (Delicate Bead)'], sku: 'TP-BRAC-6MM-BEAD', mrp: 1.0, salePrice: 1.0, stock: 45, imageUrl: IMAGES.crystalBracelet.imageUrl },
        { name: '8 mm (Standard Bead)', sizeId: sizeMap['8 mm (Standard Bead)'], sku: 'TP-BRAC-8MM-BEAD', mrp: 1.0, salePrice: 1.0, stock: 50, imageUrl: IMAGES.crystalBracelet.imageUrl },
        { name: '10 mm (Statement Bead)', sizeId: sizeMap['10 mm (Statement Bead)'], sku: 'TP-BRAC-10MM-BEAD', mrp: 1.0, salePrice: 1.0, stock: 45, imageUrl: IMAGES.crystalBracelet.imageUrl },
        { name: '12 mm (Chunky Power Bead)', sizeId: sizeMap['12 mm (Chunky Power Bead)'], sku: 'TP-BRAC-12MM-BEAD', mrp: 1.0, salePrice: 1.0, stock: 40, imageUrl: IMAGES.crystalBracelet.imageUrl },
      ],
    },

    // 5. Wholesale / Bulk Product (MOQ: 20 units)
    {
      name: 'Korean Aesthetic Pearl Bow & Floral Hairpins Claw Clip Pack (Bulk Wholesale Lot)',
      sku: 'TP-WHOLESALE-PEARL-CLAW-LOT',
      slug: 'korean-aesthetic-pearl-bow-floral-hairpins-claw-clip-pack-bulk-lot',
      categorySlug: 'hair-accesseries',
      subcategorySlug: 'clatures-hair-claws',
      price: 1.0,
      salePrice: 1.0,
      discountPercent: 0,
      stock: 500,
      brand: 'ThePurple Wholesale',
      badge: 'WHOLESALE MOQ 20',
      isFeatured: true,
      isBestSeller: true,
      isBulk: true,
      minOrderQuantity: 20, // Minimum Order Quantity Set!
      shortDescription: 'Wholesale lot of Korean pearl bow hair barrettes and floral claw clips. Minimum order quantity: 20 units.',
      description: `Special wholesale and boutique lot for retailers, gift hamper curators, and event planners. 

• Minimum Order Quantity (MOQ): 20 Pieces
• Price per unit: ₹1.00
• Packed in individual protective sleeves with header cards ready for retail display.`,
      specifications: JSON.stringify({
        "Pack Type": "Wholesale / Bulk Lot",
        "Minimum Order Quantity": "20 Units",
        "Unit Price": "₹1.00",
        "Material": "Alloy Spring, Resin, Velvet, Faux Pearl"
      }, null, 2),
      careInstructions: 'Store in dry packaging.',
      tags: ['Wholesale', 'Bulk Selling', 'MOQ 20', 'Hair Accessories', 'Claw Clips', 'Boutique Pack'],
      images: [
        { imageUrl: IMAGES.pearlHairClips.imageUrl, r2Key: IMAGES.pearlHairClips.r2Key, altText: 'Korean Pearl Hairpins Claw Clips Wholesale Pack', isPrimary: true, displayOrder: 0 },
      ],
    },

    // 6. Ring Sizes: Crown Princess Solitaire Ring
    {
      name: 'Princess Crown Solitaire AAA+ Zirconia Sparkle Ring',
      sku: 'TP-RING-SOLITAIRE-CROWN-VAR',
      slug: 'princess-crown-solitaire-aaa-zirconia-sparkle-ring',
      categorySlug: 'jewellery-ornaments',
      subcategorySlug: 'cocktail-solitaire-rings',
      price: 1.0,
      salePrice: 1.0,
      discountPercent: 0,
      stock: 100,
      brand: 'ThePurple Solitaire',
      badge: 'RING SIZES',
      isFeatured: true,
      isBestSeller: false,
      isBulk: false,
      minOrderQuantity: 1,
      shortDescription: 'Regal crown solitaire ring featuring a brilliant 2.0 carat round AAA+ cubic zirconia in sterling silver finish, available in ring sizes 6, 7, 8 and adjustable free size.',
      description: `Shine with royal sophistication. The Princess Crown Solitaire Ring cradles a faceted AAA+ round zirconia gemstone in an ornate tiara-inspired crown mount. 

Available in calibrated US Ring Sizes:
• Ring Size 6 (16.5 mm Inner Diameter)
• Ring Size 7 (17.3 mm Inner Diameter)
• Ring Size 8 (18.1 mm Inner Diameter)
• Free Size / Adjustable Band`,
      specifications: JSON.stringify({
        "Jewelry Type": "Crown Solitaire Ring",
        "Center Stone": "8mm AAA+ Brilliant Round Cut Zirconia",
        "Mount Type": "6-Prong Tiara Crown Mount",
        "Sizes Available": "Size 6, Size 7, Size 8, Free Size Adjustable"
      }, null, 2),
      careInstructions: 'Store in soft pouch. Avoid contact with perfumes.',
      tags: ['Solitaire Ring', 'Crown Ring', 'Ring Sizes', 'Zirconia Diamond', 'Silver Ring'],
      images: [
        { imageUrl: IMAGES.solitaireRing.imageUrl, r2Key: IMAGES.solitaireRing.r2Key, altText: 'Princess Crown Solitaire Ring', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        { name: 'Ring Size 6 (16.5 mm)', sizeId: sizeMap['Ring Size 6 (16.5 mm)'], sku: 'TP-RING-SZ6-VAR', mrp: 1.0, salePrice: 1.0, stock: 25, imageUrl: IMAGES.solitaireRing.imageUrl },
        { name: 'Ring Size 7 (17.3 mm)', sizeId: sizeMap['Ring Size 7 (17.3 mm)'], sku: 'TP-RING-SZ7-VAR', mrp: 1.0, salePrice: 1.0, stock: 35, imageUrl: IMAGES.solitaireRing.imageUrl },
        { name: 'Ring Size 8 (18.1 mm)', sizeId: sizeMap['Ring Size 8 (18.1 mm)'], sku: 'TP-RING-SZ8-VAR', mrp: 1.0, salePrice: 1.0, stock: 25, imageUrl: IMAGES.solitaireRing.imageUrl },
        { name: 'Free Size / Adjustable', sizeId: sizeMap['Free Size / Adjustable'], sku: 'TP-RING-ADJ-VAR', mrp: 1.0, salePrice: 1.0, stock: 15, imageUrl: IMAGES.solitaireRing.imageUrl },
      ],
    },
  ];

  // 6. Fetch existing products on live API
  console.log('\n5️⃣ Fetching existing products on Live Server...');
  const prodListRes = await fetch(`${API_BASE}/products?limit=100`, { headers: authHeaders });
  const prodListJson = await prodListRes.json();
  const existingProducts = prodListJson.data?.products || [];
  const prodSkuMap = {};
  existingProducts.forEach((p) => (prodSkuMap[p.sku] = p));

  for (const prod of productsToPublish) {
    console.log(`\n📦 Processing on Live Server: ${prod.name} [${prod.sku}]`);
    const subcategory = subcategoryMap[prod.subcategorySlug];
    const category = categoryMap[prod.categorySlug];

    const payload = {
      name: prod.name,
      sku: prod.sku,
      slug: prod.slug,
      subcategoryId: subcategory?.id,
      categoryId: category?.id,
      price: prod.price,
      salePrice: prod.salePrice,
      discountPercent: prod.discountPercent,
      stock: prod.stock,
      brand: prod.brand,
      badge: prod.badge,
      shortDescription: prod.shortDescription,
      description: prod.description,
      specifications: prod.specifications,
      careInstructions: prod.careInstructions,
      seoTitle: `${prod.name} | ThePurple`,
      seoDescription: prod.shortDescription,
      seoKeywords: prod.tags.join(', '),
      tags: prod.tags,
      isFeatured: prod.isFeatured,
      isBestSeller: prod.isBestSeller,
      isBulk: prod.isBulk,
      minOrderQuantity: prod.minOrderQuantity,
      status: 'PUBLISHED',
      images: prod.images,
      variants: prod.variants,
    };

    const existing = prodSkuMap[prod.sku];
    if (existing) {
      console.log(`   🔄 Updating existing product ID ${existing.id}...`);
      const updRes = await fetch(`${API_BASE}/products/${existing.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const updJson = await updRes.json();
      if (updJson.success) {
        console.log(`   ✅ Product Updated on Live Server!`);
      } else {
        console.error(`   ❌ Failed to update product:`, updJson);
      }
    } else {
      console.log(`   ➕ Creating new product on Live Server...`);
      const createRes = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const createJson = await createRes.json();
      if (createJson.success) {
        console.log(`   🎉 Product Created on Live Server! ID: ${createJson.data?.product?.id}`);
      } else {
        console.error(`   ❌ Failed to create product:`, createJson);
      }
    }
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL 6 COMPREHENSIVE VARIETY PRODUCTS PUBLISHED ON https://api.nowthepurple.com!');
  console.log('===============================================================\n');
}

runLivePipeline()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Pipeline Error:', err);
    process.exit(1);
  });
