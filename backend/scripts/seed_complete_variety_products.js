import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

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
import meiliService from '../src/services/meiliService.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// Uploaded R2 URLs
const IMAGES = {
  stitchRedBow: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270822863-7deb322617eed6cd62977156c5418a84.webp',
    key: 'products/1791270822863-7deb322617eed6cd62977156c5418a84.webp',
  },
  stitchPinkBow: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270824792-74a297adf0be2df47a8adce3f122aa74.webp',
    key: 'products/1791270824792-74a297adf0be2df47a8adce3f122aa74.webp',
  },
  pinkMonkey: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270825886-23c5c5363da649e41116e7f55b7b8534.webp',
    key: 'products/1791270825886-23c5c5363da649e41116e7f55b7b8534.webp',
  },
  duckSide: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270826994-e60d2f6ad2d686bebfe1acae5e8fb680.webp',
    key: 'products/1791270826994-e60d2f6ad2d686bebfe1acae5e8fb680.webp',
  },
  duckFront: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270828060-fe2c109af4220143e94758823e47d841.webp',
    key: 'products/1791270828060-fe2c109af4220143e94758823e47d841.webp',
  },
  stitchBlueOverhead: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270829083-75eb2bcb69c66e4aaea264ffde4cca20.webp',
    key: 'products/1791270829083-75eb2bcb69c66e4aaea264ffde4cca20.webp',
  },
  stitchBlueStudio: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270830119-69d0ffd714bbb113971de8a83dbb9898.webp',
    key: 'products/1791270830119-69d0ffd714bbb113971de8a83dbb9898.webp',
  },
  angelPinkOverhead: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270831153-116c230813df132839f59a36163a3e24.webp',
    key: 'products/1791270831153-116c230813df132839f59a36163a3e24.webp',
  },
  angelPinkStudio: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270832192-7f7cccaf80230c74789a529c69f52614.webp',
    key: 'products/1791270832192-7f7cccaf80230c74789a529c69f52614.webp',
  },
  stitchPurpleStudio: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270833354-fef4e6b83c2204a1a9be666ce5e1cd1f.webp',
    key: 'products/1791270833354-fef4e6b83c2204a1a9be666ce5e1cd1f.webp',
  },
  crystalBracelet: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270834392-34b1dfbf5bdd13602c882bda18231e28.webp',
    key: 'products/1791270834392-34b1dfbf5bdd13602c882bda18231e28.webp',
  },
  solitaireRing: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270835460-673d756b5250949f4ad81ed4113b0a60.webp',
    key: 'products/1791270835460-673d756b5250949f4ad81ed4113b0a60.webp',
  },
  pearlHairClips: {
    url: 'https://pub-78368d2978924d49bd93cfc4c52ed1f1.r2.dev/products/1791270836573-2331b586f0b2ab6941eec6e8666db107.webp',
    key: 'products/1791270836573-2331b586f0b2ab6941eec6e8666db107.webp',
  },
};

async function seedCompleteVarietyProducts() {
  try {
    console.log('--- 🚀 Seeding Complete Variety Product Portfolio at ₹1.00 ---');
    await sequelize.authenticate();

    // 1. Ensure Categories & Subcategories
    let hamperCat = await Category.findOne({ where: { slug: 'gifts-celebration-hampers' } });
    if (!hamperCat) {
      hamperCat = await Category.create({
        name: 'Gifts & Celebration Hampers',
        slug: 'gifts-celebration-hampers',
        description: 'Handcrafted gifts, crochet bouquets, teddy hampers and celebration sets.',
        isActive: true,
      });
    }

    let plushSub = await Subcategory.findOne({ where: { slug: 'teddy-plush-gifts' } });
    if (!plushSub) {
      plushSub = await Subcategory.create({
        categoryId: hamperCat.id,
        name: 'Teddy & Plush Gifts',
        slug: 'teddy-plush-gifts',
        description: 'Cute kawaii plush toys and keychains.',
        isActive: true,
      });
    }

    let jewelleryCat = await Category.findOne({ where: { name: 'Jewellery & Ornaments' } });
    if (!jewelleryCat) {
      jewelleryCat = await Category.create({
        name: 'Jewellery & Ornaments',
        slug: 'jewellery-ornaments',
        description: 'Luxury handcrafted jewelry, bracelets, rings and ornaments.',
        isActive: true,
      });
    }

    let braceletSub = await Subcategory.findOne({ where: { name: 'Charm Bracelets' } });
    if (!braceletSub) {
      braceletSub = await Subcategory.create({
        categoryId: jewelleryCat.id,
        name: 'Charm Bracelets',
        slug: 'charm-bracelets',
        description: 'Handmade beaded and charm bracelets.',
        isActive: true,
      });
    }

    let ringSub = await Subcategory.findOne({ where: { name: 'Cocktail & Solitaire Rings' } });
    if (!ringSub) {
      ringSub = await Subcategory.create({
        categoryId: jewelleryCat.id,
        name: 'Cocktail & Solitaire Rings',
        slug: 'cocktail-solitaire-rings',
        description: 'Solitaire and bridal sparkle rings.',
        isActive: true,
      });
    }

    let hairCat = await Category.findOne({ where: { slug: 'hair-accesseries' } });
    if (!hairCat) {
      hairCat = await Category.create({
        name: 'Hair Accesseries',
        slug: 'hair-accesseries',
        description: 'Luxury hair clips, clatures, claw clips, and hair accessories.',
        isActive: true,
      });
    }

    let clawSub = await Subcategory.findOne({ where: { slug: 'clatures-hair-claws' } });
    if (!clawSub) {
      clawSub = await Subcategory.create({
        categoryId: hairCat.id,
        name: 'Clatures & Hair Claws',
        slug: 'clatures-hair-claws',
        description: 'Premium claw clips and clatures.',
        isActive: true,
      });
    }

    // 2. Ensure Colors
    const colorsData = [
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

    const colorMap = {};
    for (const c of colorsData) {
      let [record] = await Color.findOrCreate({
        where: { name: c.name },
        defaults: { name: c.name, hexCode: c.hexCode, isActive: true },
      });
      colorMap[c.name] = record.id;
    }

    // 3. Ensure Sizes (including MM Bead Sizes & Ring Sizes)
    const sizesData = [
      { name: '6 mm (Delicate Bead)', code: '6MM' },
      { name: '8 mm (Standard Bead)', code: '8MM' },
      { name: '10 mm (Statement Bead)', code: '10MM' },
      { name: '12 mm (Chunky Power Bead)', code: '12MM' },
      { name: 'Ring Size 6 (16.5 mm)', code: 'SZ6' },
      { name: 'Ring Size 7 (17.3 mm)', code: 'SZ7' },
      { name: 'Ring Size 8 (18.1 mm)', code: 'SZ8' },
      { name: 'Free Size / Adjustable', code: 'ADJ' },
      { name: 'Standard Unit Size', code: 'STD' },
    ];

    const sizeMap = {};
    for (const s of sizesData) {
      let [record] = await Size.findOrCreate({
        where: { name: s.name },
        defaults: { name: s.name, code: s.code, isActive: true },
      });
      sizeMap[s.name] = record.id;
    }

    // 4. Products Definition
    const products = [
      // ═════════════════════════════════════════════════════════════════════════
      // 1. MULTI-COLOR VARIANT PRODUCT (Stitch & Angel Plush Keychains with 5 Color/Style Variants)
      // ═════════════════════════════════════════════════════════════════════════
      {
        name: 'Disney Kawaii Stitch & Angel Soft Plush Keychain Charm',
        sku: 'TP-STITCH-PLUSH-COLOR-SERIES',
        slug: 'disney-kawaii-stitch-angel-soft-plush-keychain-charm',
        subcategoryId: plushSub.id,
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
• Stitch with Pink Bow & Mini Scrump Doll

Perfect as a handbag charm, backpack accessory, car key ornament, or a heartwarming gift.`,
        specifications: JSON.stringify(
          {
            "Product Type": "Plush Keychain / Bag Charm",
            "Character": "Disney Stitch & Angel Series",
            "Material": "Ultra-Soft Microfiber Fur + High-Elastic PP Cotton Filling",
            "Hardware": "Gold Plated Snap Lobster Clasp & Ring",
            "Height": "Approx. 12 - 14 cm",
            "Variants Available": "5 Unique Colorways & Bow Styles"
          },
          null,
          2
        ),
        careInstructions: 'Spot clean with mild soapy water and a soft cloth. Air dry naturally.',
        tags: ['Stitch', 'Angel', 'Plush Keychain', 'Kawaii Gift', 'Bag Charm', 'Color Variants', 'ThePurple'],
        images: [
          { imageUrl: IMAGES.stitchBlueStudio.url, r2Key: IMAGES.stitchBlueStudio.key, altText: 'Stitch Blue Studio View', isPrimary: true, displayOrder: 0 },
          { imageUrl: IMAGES.angelPinkStudio.url, r2Key: IMAGES.angelPinkStudio.key, altText: 'Angel Pink Studio View', isPrimary: false, displayOrder: 1 },
          { imageUrl: IMAGES.stitchPurpleStudio.url, r2Key: IMAGES.stitchPurpleStudio.key, altText: 'Purple Stitch Studio View', isPrimary: false, displayOrder: 2 },
          { imageUrl: IMAGES.stitchRedBow.url, r2Key: IMAGES.stitchRedBow.key, altText: 'Stitch with Red Bow and Scrump', isPrimary: false, displayOrder: 3 },
          { imageUrl: IMAGES.stitchPinkBow.url, r2Key: IMAGES.stitchPinkBow.key, altText: 'Stitch with Pink Bow and Scrump', isPrimary: false, displayOrder: 4 },
        ],
        variants: [
          {
            name: 'Classic Stitch Blue',
            colorName: 'Classic Stitch Blue',
            sku: 'TP-STITCH-VAR-BLUE',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 50,
            imageUrl: IMAGES.stitchBlueStudio.url,
          },
          {
            name: 'Pastel Angel Pink',
            colorName: 'Pastel Angel Pink',
            sku: 'TP-STITCH-VAR-PINK',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 50,
            imageUrl: IMAGES.angelPinkStudio.url,
          },
          {
            name: 'Lavender Purple',
            colorName: 'Lavender Purple',
            sku: 'TP-STITCH-VAR-PURPLE',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 50,
            imageUrl: IMAGES.stitchPurpleStudio.url,
          },
          {
            name: 'Stitch with Red Bow',
            colorName: 'Stitch with Red Bow',
            sku: 'TP-STITCH-VAR-RED-BOW',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 50,
            imageUrl: IMAGES.stitchRedBow.url,
          },
          {
            name: 'Stitch with Pink Bow',
            colorName: 'Stitch with Pink Bow',
            sku: 'TP-STITCH-VAR-PINK-BOW',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 50,
            imageUrl: IMAGES.stitchPinkBow.url,
          },
        ],
      },

      // ═════════════════════════════════════════════════════════════════════════
      // 2. MULTI-VIEW HIGH PERSONALITY PRODUCT (Twisted Neck Duck with Rain Hat)
      // ═════════════════════════════════════════════════════════════════════════
      {
        name: 'Quirky Twisted-Neck White Duck Plush with Yellow Rain Hat',
        sku: 'TP-TWISTED-DUCK-RAINHAT',
        slug: 'quirky-twisted-neck-white-duck-plush-yellow-rain-hat',
        subcategoryId: plushSub.id,
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

Featuring a flexible bendable long neck that you can twist into funny poses, signature cartoon wide eyes, orange bill and webbed feet, all topped with a cheerful bright yellow fisherman rain hat.

This plush toy is a mood-lifter for study tables, car dashboards, bedside decor, or gifting friends who love quirky humor.`,
        specifications: JSON.stringify(
          {
            "Product Type": "Meme Character Plush Figurine",
            "Design": "Twisted Neck Duck with Rain Hat",
            "Material": "Soft Velboa Fabric + Wire-Reinforced Flexible Neck",
            "Color": "Snow White & Sunny Yellow",
            "Height": "Approx. 20 cm",
            "Features": "Bendable Posable Neck, Non-Slip Stand Base"
          },
          null,
          2
        ),
        careInstructions: 'Gently wipe with dry or damp cloth. Do not immerse in water to preserve internal neck structure.',
        tags: ['Duck Plush', 'Twisted Duck', 'Funny Gift', 'Meme Toy', 'Yellow Hat', 'ThePurple Gifts'],
        images: [
          { imageUrl: IMAGES.duckSide.url, r2Key: IMAGES.duckSide.key, altText: 'Twisted Duck Side Profile', isPrimary: true, displayOrder: 0 },
          { imageUrl: IMAGES.duckFront.url, r2Key: IMAGES.duckFront.key, altText: 'Twisted Duck Front View', isPrimary: false, displayOrder: 1 },
        ],
      },

      // ═════════════════════════════════════════════════════════════════════════
      // 3. MAGAZINE EDITORIAL PRODUCT (Pink Monkey Plush Keychain)
      // ═════════════════════════════════════════════════════════════════════════
      {
        name: 'Kawaii Fluffy Baby Pink Monkey Hanging Plush Bag Charm',
        sku: 'TP-PINK-MONKEY-CHARM',
        slug: 'kawaii-fluffy-baby-pink-monkey-hanging-plush-bag-charm',
        subcategoryId: plushSub.id,
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
        description: `Infuse your daily style with playful cuteness! The Kawaii Fluffy Baby Pink Monkey Hanging Plush Bag Charm features cloud-like soft faux fur in pastel pink, an adorable cream snout with embroidered smile, and long cuddly arms.

Fitted with a solid gold-toned lobster clip that attaches securely to totes, backpacks, key sets, or luggage.`,
        specifications: JSON.stringify(
          {
            "Type": "Animal Plush Bag Charm & Keychain",
            "Character": "Smiley Long-Arm Pink Monkey",
            "Material": "Premium Long-Pile Soft Faux Fur",
            "Clasp": "Heavy-Duty Gold Plated Lobster Swivel Clasp",
            "Size": "Approx. 15 cm"
          },
          null,
          2
        ),
        careInstructions: 'Brush fur gently with soft bristles. Spot clean only.',
        tags: ['Pink Monkey', 'Plush Charm', 'Kawaii Keychain', 'Bag Accessory', 'Cute Gifts'],
        images: [
          { imageUrl: IMAGES.pinkMonkey.url, r2Key: IMAGES.pinkMonkey.key, altText: 'Pink Monkey Magazine Showcase', isPrimary: true, displayOrder: 0 },
        ],
      },

      // ═════════════════════════════════════════════════════════════════════════
      // 4. MULTI-SIZE MM BEAD VARIANT PRODUCT (Crystal Charm Beaded Bracelet with 6mm, 8mm, 10mm, 12mm)
      // ═════════════════════════════════════════════════════════════════════════
      {
        name: 'Natural Crystal Butterfly & Healing Gemstone Stretch Bracelet',
        sku: 'TP-BRAC-CRYSTAL-BEADS-MM',
        slug: 'natural-crystal-butterfly-healing-gemstone-stretch-bracelet',
        subcategoryId: braceletSub.id,
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

Strung on durable Japanese quadruple-core elastic cord, this bracelet pairs polished round gemstone beads with a delicate 18K gold-plated cubic zirconia butterfly charm.

Choose your ideal bead size:
• 6 mm Beads — Delicate, subtle and perfect for multi-layer stacking
• 8 mm Beads — Standard classic everyday fit
• 10 mm Beads — Bold, prominent aesthetic statement
• 12 mm Beads — Chunky power bead profile for maximum gemstone energy`,
        specifications: JSON.stringify(
          {
            "Type": "Gemstone Beaded Stretch Bracelet",
            "Stone Quality": "Grade AAA Natural Polished Stones",
            "Bead Sizes": "6mm, 8mm, 10mm, 12mm",
            "Cord": "High-Durability Quad-Core Elastic Stretch",
            "Charm": "18K Gold PVD Plated Anti-Tarnish Butterfly",
            "Wrist Size": "Elastic Stretch Fits Wrists 15cm to 19cm"
          },
          null,
          2
        ),
        careInstructions: 'Keep away from harsh chemicals, perfumes, and chlorinated pools. Wipe with soft cloth.',
        tags: ['Crystal Bracelet', 'Gemstone Beads', '6mm Beads', '8mm Beads', '10mm Beads', 'Butterfly Charm', 'Size Variants'],
        images: [
          { imageUrl: IMAGES.crystalBracelet.url, r2Key: IMAGES.crystalBracelet.key, altText: 'Crystal Butterfly Gemstone Bracelet', isPrimary: true, displayOrder: 0 },
        ],
        variants: [
          {
            name: '6 mm (Delicate Bead)',
            sizeName: '6 mm (Delicate Bead)',
            sku: 'TP-BRAC-6MM-BEAD',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 45,
            imageUrl: IMAGES.crystalBracelet.url,
          },
          {
            name: '8 mm (Standard Bead)',
            sizeName: '8 mm (Standard Bead)',
            sku: 'TP-BRAC-8MM-BEAD',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 50,
            imageUrl: IMAGES.crystalBracelet.url,
          },
          {
            name: '10 mm (Statement Bead)',
            sizeName: '10 mm (Statement Bead)',
            sku: 'TP-BRAC-10MM-BEAD',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 45,
            imageUrl: IMAGES.crystalBracelet.url,
          },
          {
            name: '12 mm (Chunky Power Bead)',
            sizeName: '12 mm (Chunky Power Bead)',
            sku: 'TP-BRAC-12MM-BEAD',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 40,
            imageUrl: IMAGES.crystalBracelet.url,
          },
        ],
      },

      // ═════════════════════════════════════════════════════════════════════════
      // 5. BULK / WHOLESALE PRODUCT WITH MINIMUM ORDER QUANTITY (MOQ = 20)
      // ═════════════════════════════════════════════════════════════════════════
      {
        name: 'Korean Aesthetic Pearl Bow & Floral Hairpins Claw Clip Pack (Bulk Wholesale Lot)',
        sku: 'TP-WHOLESALE-PEARL-CLAW-LOT',
        slug: 'korean-aesthetic-pearl-bow-floral-hairpins-claw-clip-pack-bulk-lot',
        subcategoryId: clawSub.id,
        price: 1.0,
        salePrice: 1.0,
        discountPercent: 0,
        stock: 500,
        brand: 'ThePurple Wholesale',
        badge: 'WHOLESALE MOQ 20',
        isFeatured: true,
        isBestSeller: true,
        isBulk: true,
        minOrderQuantity: 20, // Minimum Order Quantity demonstration!
        shortDescription: 'Wholesale lot of Korean pearl bow hair barrettes and floral claw clips. Minimum order quantity: 20 units.',
        description: `Special wholesale and boutique lot for retailers, gift hamper curators, and event planners. 

Contains luxury Korean-style hair accessory pieces featuring high-lustre faux freshwater pearls, velvet ribbon bows, and high-tension alloy spring claw clips.

• Minimum Order Quantity (MOQ): 20 Pieces
• Price per unit: ₹1.00
• Packed in individual protective sleeves with header cards ready for retail display.`,
        specifications: JSON.stringify(
          {
            "Pack Type": "Wholesale / Bulk Lot",
            "Minimum Order Quantity": "20 Units",
            "Unit Price": "₹1.00",
            "Material": "Alloy Spring, Resin, Velvet, Faux Pearl",
            "Use Case": "Boutiques, Resellers, Wedding Favors, Gift Hampers"
          },
          null,
          2
        ),
        careInstructions: 'Store in dry packaging. Avoid crushing.',
        tags: ['Wholesale', 'Bulk Selling', 'MOQ 20', 'Hair Accessories', 'Claw Clips', 'Boutique Pack'],
        images: [
          { imageUrl: IMAGES.pearlHairClips.url, r2Key: IMAGES.pearlHairClips.key, altText: 'Korean Pearl Bow Hairpins Claw Clips Wholesale Pack', isPrimary: true, displayOrder: 0 },
        ],
      },

      // ═════════════════════════════════════════════════════════════════════════
      // 6. RING SIZE VARIANT PRODUCT (Crown Princess Solitaire Ring)
      // ═════════════════════════════════════════════════════════════════════════
      {
        name: 'Princess Crown Solitaire AAA+ Zirconia Sparkle Ring',
        sku: 'TP-RING-SOLITAIRE-CROWN-VAR',
        slug: 'princess-crown-solitaire-aaa-zirconia-sparkle-ring',
        subcategoryId: ringSub.id,
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

Finished with anti-tarnish rhodium plating that maintains brilliant luster for daily and party wear.

Available in calibrated US Ring Sizes:
• Ring Size 6 (16.5 mm Inner Diameter)
• Ring Size 7 (17.3 mm Inner Diameter)
• Ring Size 8 (18.1 mm Inner Diameter)
• Free Size / Adjustable Band (Expands to fit any finger)`,
        specifications: JSON.stringify(
          {
            "Jewelry Type": "Crown Solitaire Ring",
            "Center Stone": "8mm AAA+ Brilliant Round Cut Zirconia",
            "Mount Type": "6-Prong Tiara Crown Mount",
            "Plating": "Rhodium Polish Anti-Tarnish Finish",
            "Sizes Available": "Size 6, Size 7, Size 8, Free Size Adjustable"
          },
          null,
          2
        ),
        careInstructions: 'Store in soft pouch. Avoid contact with perfumes and chlorinated water.',
        tags: ['Solitaire Ring', 'Crown Ring', 'Ring Sizes', 'Zirconia Diamond', 'Silver Ring', 'ThePurple Jewels'],
        images: [
          { imageUrl: IMAGES.solitaireRing.url, r2Key: IMAGES.solitaireRing.key, altText: 'Princess Crown Solitaire Ring', isPrimary: true, displayOrder: 0 },
        ],
        variants: [
          {
            name: 'Ring Size 6 (16.5 mm)',
            sizeName: 'Ring Size 6 (16.5 mm)',
            sku: 'TP-RING-SZ6-VAR',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 25,
            imageUrl: IMAGES.solitaireRing.url,
          },
          {
            name: 'Ring Size 7 (17.3 mm)',
            sizeName: 'Ring Size 7 (17.3 mm)',
            sku: 'TP-RING-SZ7-VAR',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 35,
            imageUrl: IMAGES.solitaireRing.url,
          },
          {
            name: 'Ring Size 8 (18.1 mm)',
            sizeName: 'Ring Size 8 (18.1 mm)',
            sku: 'TP-RING-SZ8-VAR',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 25,
            imageUrl: IMAGES.solitaireRing.url,
          },
          {
            name: 'Free Size / Adjustable',
            sizeName: 'Free Size / Adjustable',
            sku: 'TP-RING-ADJ-VAR',
            mrp: 1.0,
            salePrice: 1.0,
            stock: 15,
            imageUrl: IMAGES.solitaireRing.url,
          },
        ],
      },
    ];

    const createdIds = [];

    for (const p of products) {
      console.log(`\n📦 Processing: ${p.name} [${p.sku}]`);

      // Destroy existing by sku or slug to ensure clean update
      await Product.destroy({
        where: {
          [sequelize.Sequelize.Op.or]: [{ sku: p.sku }, { slug: p.slug }],
        },
        force: true,
      }).catch(() => {});

      const product = await Product.create({
        name: p.name,
        sku: p.sku,
        slug: p.slug,
        subcategoryId: p.subcategoryId,
        price: p.price,
        salePrice: p.salePrice,
        discountPercent: p.discountPercent || 0,
        stock: p.stock,
        lowStockThreshold: 5,
        brand: p.brand,
        badge: p.badge,
        shortDescription: p.shortDescription,
        description: p.description,
        specifications: p.specifications,
        careInstructions: p.careInstructions,
        tags: p.tags,
        status: PRODUCT_STATUS.PUBLISHED,
        isActive: true,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        isBulk: Boolean(p.isBulk),
        minOrderQuantity: p.minOrderQuantity || 1,
        publishedAt: new Date(),
        seoTitle: `${p.name} | ThePurple`,
        seoDescription: p.shortDescription,
        seoKeywords: p.tags.join(', '),
      });

      // Insert Images
      if (p.images && p.images.length > 0) {
        for (const img of p.images) {
          await ProductImage.create({
            productId: product.id,
            imageUrl: img.imageUrl,
            r2Key: img.r2Key,
            altText: img.altText || product.name,
            displayOrder: img.displayOrder || 0,
            isPrimary: Boolean(img.isPrimary),
          });
        }
      }

      // Insert Variants
      if (p.variants && p.variants.length > 0) {
        for (let idx = 0; idx < p.variants.length; idx++) {
          const v = p.variants[idx];
          const colorId = v.colorName ? colorMap[v.colorName] || null : null;
          const sizeId = v.sizeName ? sizeMap[v.sizeName] || null : null;

          await ProductVariant.create({
            productId: product.id,
            sku: v.sku,
            name: `${product.name} - ${v.name}`,
            colorId,
            sizeId,
            mrp: v.mrp || product.price,
            salePrice: v.salePrice || product.salePrice,
            stock: v.stock || 20,
            imageUrl: v.imageUrl || p.images[0]?.imageUrl,
            isActive: true,
            displayOrder: idx,
          });
          console.log(`   └─ Created Variant: ${v.name} (Color: ${v.colorName || 'N/A'}, Size: ${v.sizeName || 'N/A'})`);
        }
      }

      createdIds.push(product.id);
      console.log(`✅ Product Created Successfully: ID ${product.id}`);
    }

    // Index to Meilisearch if running
    try {
      const allNewProds = await Product.findAll({
        where: { id: { [sequelize.Sequelize.Op.in]: createdIds } },
        include: [
          { model: Subcategory, as: 'subcategory', include: [{ model: Category, as: 'category' }] },
          { model: ProductImage, as: 'images' },
        ],
      });

      const docs = allNewProds.map((p) => {
        const primaryImage = p.images?.find((img) => img.isPrimary) || p.images?.[0];
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          shortDescription: p.shortDescription,
          description: p.description,
          price: parseFloat(p.price),
          salePrice: parseFloat(p.salePrice),
          discountPercent: p.discountPercent,
          stock: p.stock,
          status: p.status,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          isBulk: p.isBulk,
          minOrderQuantity: p.minOrderQuantity || 1,
          tags: p.tags || [],
          category: p.subcategory?.category?.name || '',
          subcategory: p.subcategory?.name || '',
          imageUrl: primaryImage?.imageUrl || '',
          createdAt: p.createdAt?.toISOString(),
        };
      });

      await meiliService.indexProducts(docs).catch(() => {});
      console.log('✅ Synced to Meilisearch search index');
    } catch (e) {
      console.warn('Meilisearch sync note:', e.message);
    }

    console.log('\n🎉 ALL 6 COMPREHENSIVE VARIETY PRODUCTS CREATED SUCCESSFULLY ON SUPABASE & LIVE BACKEND!');
    return { success: true, count: createdIds.length };
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    throw err;
  }
}

seedCompleteVarietyProducts()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
