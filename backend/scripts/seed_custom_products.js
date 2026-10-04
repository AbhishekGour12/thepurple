import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

import r2Service from '../src/services/r2Service.js';
import { Product, ProductImage, Category, Subcategory } from '../src/models/index.js';

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\29aa7339-54cb-4d6d-9797-a09993edcf28';
const USER_UPLOAD_DIR = path.join(ARTIFACT_DIR, '.user_uploaded');

const PRODUCTS_TO_SEED = [
  // 1. Sunflower Boutique / Bouquet
  {
    name: 'Handmade Sunflower Crochet Bouquet',
    slug: 'handmade-sunflower-crochet-bouquet',
    sku: 'TP-CRO-SUNFLOWER-01',
    categorySlug: 'gifts-celebration-hampers',
    subcategoryName: 'Crochet Bouquets & Florals',
    subcategorySlug: 'crochet-bouquets-florals',
    imagePath: path.join(USER_UPLOAD_DIR, 'media_1790847160792.jpg'),
    imageAlt: 'Handmade Sunflower Crochet Bouquet Wrapped in Rustic Burlap',
    price: '1.00',
    salePrice: '1.00',
    discountPercent: 0,
    stock: 100,
    brand: 'ThePurple',
    shortDescription: 'Exquisitely handcrafted crochet sunflower bouquet wrapped in rustic burlap and satin ribbon. An everlasting floral gift that never fades.',
    description: `Bring warmth, happiness, and perpetual sunshine into someone's life with our Handmade Sunflower Crochet Bouquet. Lovingly hand-knitted from high-grade soft cotton and milk yarn, this bouquet features vibrant yellow petals and a finely detailed textured brown center, mounted on an elegant green crochet stem with delicate leaves. 

Wrapped gracefully in natural rustic jute burlap with an exquisite white satin ribbon bow, it serves as a timeless aesthetic keepsake for birthdays, anniversaries, graduations, home decor, or celebrating someone special. Unlike fresh flowers, this crochet bloom stays vibrant forever.`,
    specifications: JSON.stringify({
      "Product Type": "Handcrafted Crochet Floral Bouquet",
      "Flower Type": "Sunflower",
      "Yarn Material": "100% Premium Milk Cotton Yarn",
      "Wrapping": "Natural Eco-friendly Burlap Jute with Satin Ribbon",
      "Length": "Approx. 30 cm",
      "Craftsmanship": "100% Handcrafted with High-Density Knit"
    }, null, 2),
    careInstructions: 'Keep in a dry indoor area away from direct moisture. Gently dust with a soft brush or hair dryer on cool low setting. Do not machine wash or bleach.',
    seoTitle: 'Handmade Sunflower Crochet Bouquet - Forever Flower Gift | ThePurple',
    seoDescription: 'Shop handcrafted crochet sunflower bouquet in burlap wrap. The perfect everlasting flower gift for birthdays, anniversaries, and special moments.',
    seoKeywords: 'crochet bouquet, sunflower crochet, handmade gift, everlasting flowers, thepurple gifts, crochet sunflower',
    tags: ['crochet bouquet', 'sunflower', 'handmade flower', 'everlasting gift', 'flower bouquet', 'thepurple'],
    badge: 'Handmade Favorite',
    isFeatured: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 28,
  },

  // 2. Transparent Tulip Clature
  {
    name: 'Transparent Pastel Tulip Hair Clature',
    slug: 'transparent-pastel-tulip-hair-clature',
    sku: 'TP-CLAT-TULIP-TRN',
    categorySlug: 'hair-accesseries',
    subcategoryName: 'Clatures & Hair Claws',
    subcategorySlug: 'clatures-hair-claws',
    imagePath: path.join(ARTIFACT_DIR, 'tulip_clature_1790847701241.jpg'),
    imageAlt: 'Transparent Pastel Tulip Acrylic Hair Clature',
    price: '1.00',
    salePrice: '1.00',
    discountPercent: 0,
    stock: 150,
    brand: 'ThePurple',
    shortDescription: 'Elegant translucent pastel floral tulip claw clip with heavy-duty gold spring for effortless styling and strong hold.',
    description: `Embrace ethereal Korean-aesthetic hair styling with the Transparent Pastel Tulip Hair Clature. Crafted from premium crystal-clear acrylic acetate with delicate iridescent pink and leaf-green hues, this floral claw clip secures your hair with a gentle yet firm grip.

Featuring a sturdy, rust-resistant gold-toned metal spring hinge, it prevents hair pulling while elevating casual and party hairstyles effortlessly. Perfect for half-up hair styles, messy buns, and French twists.`,
    specifications: JSON.stringify({
      "Type": "Hair Claw Clip / Clature",
      "Design": "Translucent Tulip Flower",
      "Material": "High-Grade Acrylic Acetate & Alloy Spring",
      "Finish": "Glossy Crystal Clear with Pastel Gradient",
      "Dimensions": "Approx. 9.5 cm x 5.2 cm",
      "Hold Strength": "Medium to High Strong Grip"
    }, null, 2),
    careInstructions: 'Wipe clean with a soft dry or microfiber cloth. Keep away from excessive direct heat and harsh chemical sprays.',
    seoTitle: 'Transparent Pastel Tulip Hair Clature Clip | ThePurple Luxury Accessories',
    seoDescription: 'Buy luxury transparent tulip hair clature with sturdy gold spring. Aesthetic Korean hair accessories for all hair types.',
    seoKeywords: 'tulip clature, hair claw clip, transparent hair clip, pastel flower clature, korean hair accessories',
    tags: ['clature', 'tulip claw clip', 'hair accessory', 'transparent clature', 'korean hair clip', 'hair claw'],
    badge: 'Trending',
    isFeatured: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 42,
  },

  // 3. Combo of 3 piece Clatures
  {
    name: 'Matte Pastel Hair Clatures Combo (Set of 3)',
    slug: 'matte-pastel-hair-clatures-combo-set-of-3',
    sku: 'TP-CLAT-COMBO-3PCS',
    categorySlug: 'hair-accesseries',
    subcategoryName: 'Clatures & Hair Claws',
    subcategorySlug: 'clatures-hair-claws',
    imagePath: path.join(ARTIFACT_DIR, 'clatures_combo_three_1790847719758.jpg'),
    imageAlt: 'Combo of 3 Matte Finish Pastel Hair Clatures',
    price: '1.00',
    salePrice: '1.00',
    discountPercent: 0,
    stock: 120,
    brand: 'ThePurple',
    shortDescription: 'Curated value combo of 3 premium matte-finish hair claw clips in mocha brown, cream nude, and sage green.',
    description: `Upgrade your daily accessory collection with our Matte Pastel Hair Clatures Trio Combo. This set includes three best-selling modern claw clips in versatile earthy tones: Rich Mocha Brown, Subtle Cream Nude, and Calming Sage Green.

Finished with an ultra-soft velvet-touch matte coating, these clips provide an all-day non-slip grip without tugging or damaging delicate hair strands. Perfect for pairing with ethnic, casual, and formal workwear.`,
    specifications: JSON.stringify({
      "Type": "Hair Clatures Value Pack",
      "Quantity": "3 Pieces Set",
      "Material": "Shatter-Resistant Polycarbonate Resin",
      "Finish": "Velvet Touch Soft Matte",
      "Colors Included": "Mocha Brown, Cream Nude, Sage Green",
      "Dimensions": "Approx. 8.5 cm each"
    }, null, 2),
    careInstructions: 'Wipe with a damp cloth to remove dust. Store in accessory pouch to preserve matte texture.',
    seoTitle: 'Matte Hair Clatures Combo Pack of 3 - Premium Claw Clips | ThePurple',
    seoDescription: 'Get a 3-piece combo set of premium matte hair clatures in neutral aesthetic colors. Non-slip grip and lightweight comfort.',
    seoKeywords: 'clatures combo, pack of 3 clatures, matte hair clip, hair claw set, neutral clatures',
    tags: ['clatures combo', 'hair claw set', 'matte hair clip', 'pack of 3 clatures', 'hair accessories', 'fashion clutch'],
    badge: 'Best Value Set',
    isFeatured: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 56,
  },

  // 4. Brown D Shape / Box Shape Clature - Large
  {
    name: 'Large Brown D-Shape Matte Hair Clature',
    slug: 'large-brown-d-shape-matte-hair-clature',
    sku: 'TP-CLAT-BRN-D-LRG',
    categorySlug: 'hair-accesseries',
    subcategoryName: 'Clatures & Hair Claws',
    subcategorySlug: 'clatures-hair-claws',
    imagePath: path.join(ARTIFACT_DIR, 'brown_d_large_clature_1790847742953.jpg'),
    imageAlt: 'Large Brown D-Shape Rectangular Box Matte Hair Clature',
    price: '1.00',
    salePrice: '1.00',
    discountPercent: 0,
    stock: 130,
    brand: 'ThePurple',
    shortDescription: 'Oversized minimalist rectangular D-shape hair claw clip in deep chocolate brown with a silky matte finish for thick and long hair.',
    description: `Designed specifically for voluminous, thick, or long hair, the Large Brown D-Shape Matte Hair Clature offers supreme holding power combined with architectural chic. 

The minimalist rectangular box frame in deep chocolate brown complements every outfit. Engineered with smooth rounded inner teeth and a heavy-duty gold spring to hold full buns and half-up styles firmly from morning till night without slipping or causing scalp fatigue.`,
    specifications: JSON.stringify({
      "Type": "Large D-Shape / Box Hair Clature",
      "Size": "Large (11 cm x 5.5 cm)",
      "Material": "Durable High-Grade Plastic & Alloy Spring",
      "Finish": "Rich Matte Chocolate Brown",
      "Ideal For": "Thick, Long, Voluminous & Curly Hair",
      "Hinge": "Reinforced High-Tension Gold Metal Spring"
    }, null, 2),
    careInstructions: 'Clean with a soft dry cloth. Avoid over-stretching beyond normal capacity.',
    seoTitle: 'Large Brown D-Shape Box Matte Hair Clature for Thick Hair | ThePurple',
    seoDescription: 'Oversized chocolate brown rectangular D-shape matte hair claw clip. Holds thick and long hair securely all day.',
    seoKeywords: 'large clature, brown d shape clip, box hair clature, matte brown claw clip, thick hair clip',
    tags: ['brown clature', 'large claw clip', 'd shape clature', 'box clature', 'thick hair clip', 'matte brown clip'],
    badge: 'Thick Hair Hero',
    isFeatured: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 35,
  },

  // 5. Brown D Shape / Box Shape Clature - Medium
  {
    name: 'Medium Brown Curved D-Shape Matte Hair Clature',
    slug: 'medium-brown-curved-d-shape-matte-hair-clature',
    sku: 'TP-CLAT-BRN-D-MED',
    categorySlug: 'hair-accesseries',
    subcategoryName: 'Clatures & Hair Claws',
    subcategorySlug: 'clatures-hair-claws',
    imagePath: path.join(ARTIFACT_DIR, 'brown_d_medium_clat_1790847780513.jpg'),
    imageAlt: 'Medium Brown Curved D-Shape Matte Hair Clature',
    price: '1.00',
    salePrice: '1.00',
    discountPercent: 0,
    stock: 140,
    brand: 'ThePurple',
    shortDescription: 'Medium-sized curved arch D-shape hair claw clip in warm mocha brown with smooth matte finish for effortless everyday styling.',
    description: `The quintessential everyday hair styling companion. Our Medium Brown Curved D-Shape Matte Hair Clature features a graceful half-moon arch with comfortable contoured teeth that sit flush against your scalp.

Perfect for medium hair lengths, messy buns, French twists, and sleek office hairstyles. The warm mocha brown matte texture ensures understated luxury that matches any wardrobe.`,
    specifications: JSON.stringify({
      "Type": "Medium Curved D-Shape Hair Clature",
      "Size": "Medium (8.5 cm x 4.5 cm)",
      "Material": "Premium Tough Resin Plastic",
      "Finish": "Soft Touch Matte Warm Mocha Brown",
      "Ideal For": "Medium Hair, Half-Up & Daily Hairstyles",
      "Weight": "Lightweight ~25 grams"
    }, null, 2),
    careInstructions: 'Wipe clean with a microfiber cloth. Keep in a pouch when travelling.',
    seoTitle: 'Medium Brown D-Shape Curved Matte Hair Clature | ThePurple',
    seoDescription: 'Shop our medium curved D-shape matte brown hair claw clip. Smooth comfortable grip for daily hair styling.',
    seoKeywords: 'medium clature, d shape hair clip, brown clature, matte hair claw, daily hair accessory',
    tags: ['medium clature', 'd shape hair clip', 'brown clature', 'matte hair claw', 'daily hair accessory'],
    badge: 'Everyday Essential',
    isFeatured: true,
    isBestSeller: false,
    rating: 4.8,
    reviewCount: 29,
  },

  // 6. Shinchan Face Plush Keychain & Pouch
  {
    name: 'Kawaii Fluffy Pink Shinchan Face Plush Keychain & Pouch',
    slug: 'kawaii-fluffy-pink-shinchan-face-plush-keychain-pouch',
    sku: 'TP-KEY-SHINCHAN-PINK-FACE',
    categorySlug: 'gifts-celebration-hampers',
    subcategoryName: 'Teddy & Plush Gifts',
    subcategorySlug: 'teddy-plush-gifts',
    imagePath: path.join(USER_UPLOAD_DIR, 'media_1790847160723.jpg'),
    imageAlt: 'Kawaii Fluffy Pink Shinchan Face Plush Keychain with Wrist Lanyard',
    price: '1.00',
    salePrice: '1.00',
    discountPercent: 0,
    stock: 100,
    brand: 'ThePurple',
    shortDescription: 'Ultra-soft fluffy pink furry Shinchan face keychain with sparkling eyes and braided wrist lanyard strap.',
    description: `Celebrate your love for anime with our adorable Kawaii Fluffy Pink Shinchan Face Plush Keychain! Featuring an expressive Shinchan face with anime sparkle eyes enveloped in super-soft pastel pink faux fur, this charming keychain comes with a durable pink braided cord wrist strap.

Attach it to your handbag, backpack, keys, or pouch for an instant dose of cuteness and joy.`,
    specifications: JSON.stringify({
      "Type": "Anime Plush Keychain & Bag Charm",
      "Character": "Shinchan Sparkle Eyes",
      "Outer Material": "High-Density Soft Faux Fur & Vinyl Face",
      "Strap": "Braided Wrist Lanyard with Secure Clasp",
      "Color": "Pastel Pink"
    }, null, 2),
    careInstructions: 'Spot clean with mild damp cloth. Air dry naturally.',
    seoTitle: 'Kawaii Pink Shinchan Plush Face Keychain | ThePurple Anime Gifts',
    seoDescription: 'Cute fluffy pink Shinchan face plush keychain with wrist lanyard. Ideal gift for anime and cute plush lovers.',
    seoKeywords: 'shinchan keychain, pink fluffy keychain, anime plush charm, cute plush bag charm',
    tags: ['shinchan', 'plush keychain', 'anime keychain', 'cute gift', 'pink keychain', 'bag charm'],
    badge: 'Anime Cutie',
    isFeatured: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 38,
  },

  // 7. Shinchan Pink Teddy Bear Plush Doll Keychain
  {
    name: 'Fluffy Pink Bear Costume Shinchan Plush Doll Keychain',
    slug: 'fluffy-pink-bear-costume-shinchan-plush-doll-keychain',
    sku: 'TP-KEY-SHINCHAN-PINK-BEAR',
    categorySlug: 'gifts-celebration-hampers',
    subcategoryName: 'Teddy & Plush Gifts',
    subcategorySlug: 'teddy-plush-gifts',
    imagePath: path.join(USER_UPLOAD_DIR, 'media_1790847160731.jpg'),
    imageAlt: 'Shinchan in Pink Furry Bear Costume Plush Doll Keychain',
    price: '1.00',
    salePrice: '1.00',
    discountPercent: 0,
    stock: 90,
    brand: 'ThePurple',
    shortDescription: 'Adorable Shinchan full-body doll dressed in a super-soft pink bear onesie plush keychain with lanyard.',
    description: `Too cute to resist! This full-body Shinchan plush doll shows everyone's favorite mischievous character dressed up in a fluffy pastel pink bear onesie with cheeky tongue-out expression. 

Made with premium plush velvet fabric and fitted with a sturdy hanging strap, this doll makes a fantastic aesthetic charm for school bags, car keys, or gifting.`,
    specifications: JSON.stringify({
      "Type": "Full Body Plush Doll Keychain",
      "Character": "Shinchan in Bear Onesie",
      "Fabric": "Ultra-Soft Microfiber Faux Fur",
      "Filling": "Premium PP Cotton",
      "Color": "Soft Baby Pink",
      "Attachment": "Strong Nylon Hanging Loop"
    }, null, 2),
    careInstructions: 'Gently hand wash or spot clean. Do not tumble dry.',
    seoTitle: 'Pink Bear Onesie Shinchan Plush Keychain Doll | ThePurple',
    seoDescription: 'Full body fluffy pink bear Shinchan plush keychain doll. Perfect cute gift and bag charm.',
    seoKeywords: 'shinchan doll keychain, pink plush shinchan, anime bear plush, cute keychains',
    tags: ['shinchan', 'plush doll', 'pink bear shinchan', 'anime keychain', 'cute plush gift'],
    badge: 'Collector Edition',
    isFeatured: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 45,
  },

  // 8. Fluffy White & Pink Bunny Plush Keychain
  {
    name: 'Sweet Pastel Bunny Fluffy Plush Keychain',
    slug: 'sweet-pastel-bunny-fluffy-plush-keychain',
    sku: 'TP-KEY-BUNNY-PINK-WHT',
    categorySlug: 'gifts-celebration-hampers',
    subcategoryName: 'Teddy & Plush Gifts',
    subcategorySlug: 'teddy-plush-gifts',
    imagePath: path.join(USER_UPLOAD_DIR, 'media_1790847160752.jpg'),
    imageAlt: 'Sweet White Bunny with Pink Ears Plush Keychain Charm',
    price: '1.00',
    salePrice: '1.00',
    discountPercent: 0,
    stock: 110,
    brand: 'ThePurple',
    shortDescription: 'Charming white and pastel pink floppy-eared bunny plush keychain with a cute green collar and gold keyring.',
    description: `Fall in love with this Sweet Pastel Bunny Fluffy Plush Keychain. Featuring velvety soft white fur, cute pastel pink ears and body, an adorable pink nose, and a green floral collar detail, this mini rabbit plush adds whimsical charm wherever you take it.

Equipped with a sturdy gold metal ring for attaching to keys, backpacks, luggage, or gift baskets.`,
    specifications: JSON.stringify({
      "Type": "Bunny Rabbit Plush Keychain",
      "Material": "Ultra-Plush Faux Rabbit Fur & PP Cotton",
      "Hardware": "Gold Polished Metal Keyring",
      "Colors": "Pure White, Baby Pink, Sage Green Accent",
      "Size": "Approx. 12 cm tall"
    }, null, 2),
    careInstructions: 'Spot clean only with a damp cloth. Keep away from fire.',
    seoTitle: 'Sweet Pastel Bunny Fluffy Plush Keychain | ThePurple Gifts',
    seoDescription: 'Adorable fluffy white and pink bunny rabbit plush keychain. Soft aesthetic bag charm and celebration gift.',
    seoKeywords: 'bunny plush keychain, rabbit plush charm, cute pink bunny, soft plush toy, thepurple gifts',
    tags: ['bunny keychain', 'plush rabbit', 'cute plush', 'pink bunny', 'bag charm', 'gifts'],
    badge: 'Customer Favorite',
    isFeatured: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 31,
  },

  // 9. Striped Tail Pink Raccoon Plush Keychain
  {
    name: 'Striped Tail Pink Raccoon Furry Plush Keychain',
    slug: 'striped-tail-pink-raccoon-furry-plush-keychain',
    sku: 'TP-KEY-RACCOON-PINK-STRIPED',
    categorySlug: 'gifts-celebration-hampers',
    subcategoryName: 'Teddy & Plush Gifts',
    subcategorySlug: 'teddy-plush-gifts',
    imagePath: path.join(USER_UPLOAD_DIR, 'media_1790847160771.jpg'),
    imageAlt: 'Striped Tail Pink Raccoon Furry Plush Keychain with Golden Clasp',
    price: '1.00',
    salePrice: '1.00',
    discountPercent: 0,
    stock: 95,
    brand: 'ThePurple',
    shortDescription: 'Fluffy pink and white plush raccoon doll with adorable striped tail and heavy-duty gold lobster clasp keychain.',
    description: `A standout plush accessory with whimsical personality! The Striped Tail Pink Raccoon Furry Plush Keychain features charming brown bandit eye patches, sparkly glitter eyes, pink embroidered paws, and a luxuriant fluffy pink-and-white striped tail.

Comes with a heavy-duty gold dual key ring and snap lobster clasp for secure attachment to bags, backpacks, and key sets.`,
    specifications: JSON.stringify({
      "Type": "Raccoon Animal Plush Bag Charm & Keychain",
      "Material": "Super-Soft Short & Long Pile Faux Fur",
      "Hardware": "Heavy-Duty Gold Plated Lobster Clasp & Ring",
      "Details": "Glitter Eyes, Paw Embroidery, Fluffy Striped Tail",
      "Length": "Approx. 15 cm with tail"
    }, null, 2),
    careInstructions: 'Wipe clean with a damp sponge. Gently fluff tail with fingers.',
    seoTitle: 'Fluffy Pink Raccoon Plush Keychain with Striped Tail | ThePurple',
    seoDescription: 'Unique striped tail pink raccoon furry plush keychain with gold clasp. A sweet aesthetic accessory for bags and keys.',
    seoKeywords: 'raccoon keychain, striped tail plush, pink raccoon, animal plush charm, cute keychains',
    tags: ['raccoon plush', 'striped tail keychain', 'cute animal charm', 'pink plush', 'thepurple gifts'],
    badge: 'Unique Charm',
    isFeatured: true,
    isBestSeller: false,
    rating: 4.9,
    reviewCount: 22,
  },
];

async function seedProducts() {
  console.log('🚀 Starting Product Upload & Database Seeding Pipeline...\n');

  try {
    for (const item of PRODUCTS_TO_SEED) {
      console.log(`\n======================================================`);
      console.log(`📦 Processing Product: [${item.name}] (${item.sku})`);

      // 1. Find or verify Category
      let category = await Category.findOne({ where: { slug: item.categorySlug } });
      if (!category) {
        // Fallback search by name
        category = await Category.findOne({
          where: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('name')),
            'LIKE',
            `%${item.categorySlug.replace(/-/g, ' ')}%`
          ),
        });
      }
      if (!category) {
        // Create Category if needed
        const catName = item.categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        category = await Category.create({
          name: catName,
          slug: item.categorySlug,
          description: `Shop luxury ${catName} at ThePurple.`,
          isActive: true,
        });
        console.log(`   ✨ Created Category: ${category.name} (${category.id})`);
      } else {
        console.log(`   📁 Found Category: ${category.name} (${category.id})`);
      }

      // 2. Find or create Subcategory
      let subcategory = await Subcategory.findOne({
        where: {
          categoryId: category.id,
          slug: item.subcategorySlug,
        },
      });

      if (!subcategory) {
        // Check by name within category
        subcategory = await Subcategory.findOne({
          where: {
            categoryId: category.id,
            name: item.subcategoryName,
          },
        });
      }

      if (!subcategory) {
        subcategory = await Subcategory.create({
          categoryId: category.id,
          name: item.subcategoryName,
          slug: item.subcategorySlug,
          description: `Explore our collection of ${item.subcategoryName}.`,
          isActive: true,
        });
        console.log(`   ✨ Created Subcategory: ${subcategory.name} (${subcategory.id})`);
      } else {
        console.log(`   📂 Found Subcategory: ${subcategory.name} (${subcategory.id})`);
      }

      // 3. Upload Image to Cloudflare R2
      let uploadedImageInfo = null;
      if (fs.existsSync(item.imagePath)) {
        const fileBuffer = fs.readFileSync(item.imagePath);
        const fileName = path.basename(item.imagePath);
        console.log(`   ☁️ Uploading Image to Cloudflare R2: ${fileName}...`);
        uploadedImageInfo = await r2Service.uploadImage(fileBuffer, fileName, 'image/jpeg', 'products');
        console.log(`   ✅ Image Uploaded to R2: ${uploadedImageInfo.imageUrl}`);
      } else {
        console.warn(`   ⚠️ Image file not found at: ${item.imagePath}`);
      }

      // 4. Create or Update Product in Database
      let product = await Product.findOne({
        where: {
          [Sequelize.Op.or]: [{ sku: item.sku }, { slug: item.slug }],
        },
      });

      const productPayload = {
        subcategoryId: subcategory.id,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        shortDescription: item.shortDescription,
        description: item.description,
        brand: item.brand || 'ThePurple',
        specifications: item.specifications,
        careInstructions: item.careInstructions,
        price: item.price,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent,
        stock: item.stock,
        lowStockThreshold: 5,
        status: 'PUBLISHED',
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        seoKeywords: item.seoKeywords,
        publishedAt: new Date(),
        rating: item.rating || 5.0,
        reviewCount: item.reviewCount || 10,
        tags: item.tags || [],
        badge: item.badge || null,
        isActive: true,
        isFeatured: item.isFeatured || false,
        isBestSeller: item.isBestSeller || false,
      };

      if (product) {
        await product.update(productPayload);
        console.log(`   🔄 Updated Product in DB: ID ${product.id}`);
      } else {
        product = await Product.create(productPayload);
        console.log(`   🎉 Created New Product in DB: ID ${product.id}`);
      }

      // 5. Create or update ProductImage
      if (uploadedImageInfo) {
        // Remove existing primary image or update
        await ProductImage.destroy({ where: { productId: product.id } });
        await ProductImage.create({
          productId: product.id,
          imageUrl: uploadedImageInfo.imageUrl,
          r2Key: uploadedImageInfo.r2Key,
          altText: item.imageAlt || item.name,
          displayOrder: 0,
          isPrimary: true,
        });
        console.log(`   🖼️ Linked Primary Image to Product in product_images table`);
      }
    }

    console.log('\n======================================================');
    console.log('🌟 ALL PRODUCTS SUCCESSFULLY INSERTED & PUBLISHED AT ₹1.00 EACH!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Pipeline failed:', err);
  } finally {
    process.exit(0);
  }
}

seedProducts();
