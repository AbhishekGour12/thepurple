import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import {
  Product,
  ProductImage,
  ProductVariant,
  Category,
  Subcategory,
  Color,
  Size,
} from '../models/index.js';
import { PRODUCT_STATUS } from '../models/Product.js';
import r2Service from '../services/r2Service.js';
import meiliService from '../services/meiliService.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function uploadLocalImageToR2(localPath, filename) {
  try {
    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      const res = await r2Service.uploadImage(buffer, filename, 'image/jpeg', 'products');
      const url = res?.imageUrl || res?.publicUrl || res?.url;
      console.log(`[R2 Upload] ${filename} -> ${url}`);
      return url;
    }
  } catch (err) {
    console.warn(`[R2 Upload Warning] Could not upload ${filename} to R2:`, err.message);
  }
  return null;
}

export async function seedDiverseProducts() {
  try {
    console.log('--- Starting Diverse Product Seeding ---');

    const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\1817420b-ac9f-45de-9e24-9262a90c61ea';

    // 1. Upload the generated photos to Cloudflare R2
    const chokerImg = await uploadLocalImageToR2(
      path.join(artifactDir, 'kundan_choker_set_1791114571640.jpg'),
      'royal-kundan-meenakari-choker.jpg'
    );
    const braceletImg = await uploadLocalImageToR2(
      path.join(artifactDir, 'butterfly_bracelet_1791114590182.jpg'),
      'crystal-butterfly-charm-bracelet.jpg'
    );
    const ringImg = await uploadLocalImageToR2(
      path.join(artifactDir, 'solitaire_ring_1791114608007.jpg'),
      'solitaire-crown-princess-ring.jpg'
    );
    const teddyImg = await uploadLocalImageToR2(
      path.join(artifactDir, 'lavender_teddy_1791114625301.jpg'),
      'huggable-lavender-plush-teddy.jpg'
    );
    const hairClipsImg = await uploadLocalImageToR2(
      path.join(artifactDir, 'pearl_hair_clips_1791114644625.jpg'),
      'korean-pearl-bow-hair-accessory-set.jpg'
    );

    // 2. Fetch or create Categories and Subcategories
    let jewelleryCat = await Category.findOne({ where: { name: 'Jewellery & Ornaments' } });
    if (!jewelleryCat) jewelleryCat = await Category.findOne({ where: { name: 'Fine Jewellery' } });

    let chokerSub = await Subcategory.findOne({ where: { name: 'Chokers' } });
    if (!chokerSub && jewelleryCat) {
      chokerSub = await Subcategory.create({
        categoryId: jewelleryCat.id,
        name: 'Chokers & Sets',
        slug: 'chokers-sets',
        isActive: true,
      });
    }

    let braceletCat = await Category.findOne({ where: { name: 'Bangles, Kadas & Bracelets' } });
    let braceletSub = await Subcategory.findOne({ where: { categoryId: braceletCat?.id || jewelleryCat?.id } });
    if (!braceletSub && braceletCat) {
      braceletSub = await Subcategory.create({
        categoryId: braceletCat.id,
        name: 'Charm Bracelets',
        slug: 'charm-bracelets',
        isActive: true,
      });
    }

    let ringCat = await Category.findOne({ where: { name: 'Rings & Bands' } });
    if (!ringCat) ringCat = await Category.findOne({ where: { name: 'Ring' } });
    let ringSub = await Subcategory.findOne({ where: { categoryId: ringCat?.id } });
    if (!ringSub && ringCat) {
      ringSub = await Subcategory.create({
        categoryId: ringCat.id,
        name: 'Cocktail & Solitaire Rings',
        slug: 'cocktail-solitaire-rings',
        isActive: true,
      });
    }

    let hamperCat = await Category.findOne({ where: { name: 'Gifts & Celebration Hampers' } });
    if (!hamperCat) hamperCat = await Category.findOne({ where: { name: 'Gifts & Hampers' } });
    let teddySub = await Subcategory.findOne({ where: { name: 'Soft Toys' } });
    if (!teddySub && hamperCat) {
      teddySub = await Subcategory.create({
        categoryId: hamperCat.id,
        name: 'Plush Toys & Teddies',
        slug: 'plush-toys-teddies',
        isActive: true,
      });
    }

    let hairCat = await Category.findOne({ where: { name: 'Hair Accesseries' } });
    if (!hairCat) hairCat = await Category.findOne({ where: { name: 'Fashion Accessories' } });
    let hairSub = await Subcategory.findOne({ where: { categoryId: hairCat?.id } });
    if (!hairSub && hairCat) {
      hairSub = await Subcategory.create({
        categoryId: hairCat.id,
        name: 'Claw Clips & Pins',
        slug: 'claw-clips-pins',
        isActive: true,
      });
    }

    // Colors & Sizes map
    const colors = await Color.findAll();
    const colorMap = new Map(colors.map((c) => [c.name.toLowerCase().trim(), c.id]));
    const sizes = await Size.findAll();
    const sizeMap = new Map(sizes.map((s) => [s.name.toLowerCase().trim(), s.id]));

    // Products payload definitions
    const productsData = [
      // 1. Multi-Color Variant Product: Royal Kundan Choker
      {
        name: 'Royal Heritage Kundan & Meenakari Choker Set with Jhumkas',
        sku: 'ROYAL-KUNDAN-CHOKER-01',
        subcategoryId: chokerSub?.id || jewelleryCat?.subcategories?.[0]?.id,
        price: 5999,
        salePrice: 3499,
        discountPercent: 42,
        stock: 45,
        brand: 'ThePurple Royal Collection',
        badge: 'BESTSELLER',
        isFeatured: true,
        isBestSeller: true,
        isBulk: false,
        minOrderQuantity: 1,
        shortDescription: 'Intricate 22K gold-plated handcrafted Kundan Meenakari bridal choker necklace with hanging pearls and matching jhumkas.',
        description: 'Immerse in timeless royalty with our handcrafted Kundan Meenakari choker necklace. Designed with precision setting of faceted stones, enamelled Meenakari work on reverse, and cascading high-lustre faux pearls. Includes matching jhumka earrings and maang tikka.',
        specifications: 'Material: Brass with 22K Gold Micron Plating\nStones: Uncut Kundan, Hydro Emerald Beads, Faux Pearls\nNecklace Length: Adjustable Dori\nEarring Style: Hanging Jhumka with Push Back\nWeight: 140 grams',
        careInstructions: 'Keep away from water, perfumes, and hairsprays. Store in an airtight pouch or box when not in use.',
        tags: ['Kundan', 'Choker Set', 'Bridal', 'Meenakari', 'Necklace', 'Wedding'],
        imageUrl: chokerImg,
        variants: [
          { name: 'Emerald Green', colorName: 'Emerald Green', mrp: 5999, salePrice: 3499, stock: 15, sku: 'ROYAL-KUNDAN-EMERALD' },
          { name: 'Ruby Red', colorName: 'Ruby Red', mrp: 5999, salePrice: 3499, stock: 12, sku: 'ROYAL-KUNDAN-RUBY' },
          { name: 'Sapphire Blue', colorName: 'Sapphire Blue', mrp: 5999, salePrice: 3499, stock: 10, sku: 'ROYAL-KUNDAN-SAPPHIRE' },
          { name: 'Rose Gold', colorName: 'Rose Gold', mrp: 5999, salePrice: 3499, stock: 8, sku: 'ROYAL-KUNDAN-ROSEGOLD' },
        ],
      },

      // 2. Wholesale / Bulk Selling Product (MOQ: 50 pcs)
      {
        name: 'Crystal Butterfly Charm Link Bracelet Set (Bulk Pack of 50 Pcs)',
        sku: 'WHOLESALE-BUTTERFLY-50PCS',
        subcategoryId: braceletSub?.id || braceletCat?.id,
        price: 24950, // ₹499 * 50
        salePrice: 7450, // ₹149 * 50
        discountPercent: 70,
        stock: 300,
        brand: 'ThePurple Wholesale',
        badge: 'WHOLESALE',
        isFeatured: true,
        isBestSeller: true,
        isBulk: true,
        minOrderQuantity: 50,
        shortDescription: 'Wholesale lot of 50 units crystal butterfly link charm bracelets in 18K gold plating. Ideal for boutiques, resellers, and corporate hampers.',
        description: 'Premium wholesale bundle containing 50 individual luxury crystal butterfly charm link bracelets. Each bracelet is crafted from anti-tarnish stainless steel with 18K gold PVD plating, micro-pave cubic zirconia stones, and lobster clasp closure with extension chain.',
        specifications: 'Pack Quantity: 50 Units\nMaterial: Stainless Steel + 18K Gold PVD\nLength: 17 cm + 4 cm Extension\nPlating: Anti-Tarnish, Water-Resistant\nPackaging: Individual Header Cards',
        careInstructions: 'Wipe with a soft dry cloth. Safe for daily wear and resistant to sweat.',
        tags: ['Wholesale', 'Bulk Selling', 'Charm Bracelet', 'Butterfly', 'Gold Plated', 'Boutique Lot'],
        imageUrl: braceletImg,
      },

      // 3. Size-Variant Product: Solitaire Crown Ring
      {
        name: 'Princess Crown Solitaire AAA+ Zirconia Ring in 925 Silver Finish',
        sku: 'CROWN-SOLITAIRE-RING-925',
        subcategoryId: ringSub?.id || ringCat?.id,
        price: 1999,
        salePrice: 999,
        discountPercent: 50,
        stock: 80,
        brand: 'ThePurple Solitaire',
        badge: 'TRENDING',
        isFeatured: true,
        isBestSeller: false,
        isBulk: false,
        minOrderQuantity: 1,
        shortDescription: 'Regal crown solitaire ring featuring a 2.0 carat equivalent brilliant round AAA+ cubic zirconia in an ornate silver setting.',
        description: 'Feel like royalty with our handcrafted Princess Crown Solitaire Ring. The centrepiece features an ultra-clear, brilliant round cut zirconia diamond nestled within an intricately carved tiara motif crown basket.',
        specifications: 'Material: 925 Sterling Silver Overlay\nMain Stone: 8mm Brilliant Round AAA+ Cubic Zirconia\nSetting: Crown Prong Mount\nFinish: Rhodium Anti-Tarnish Polish',
        careInstructions: 'Store in soft velvet pouch. Clean gently with microfiber cloth.',
        tags: ['Solitaire', 'Ring', 'Crown Ring', 'Zirconia', 'Silver', 'Princess'],
        imageUrl: ringImg,
        variants: [
          { name: 'Ring Size 6', sizeName: 'Ring Size 6', mrp: 1999, salePrice: 999, stock: 25, sku: 'CROWN-RING-SZ6' },
          { name: 'Ring Size 7', sizeName: 'Ring Size 7', mrp: 1999, salePrice: 999, stock: 35, sku: 'CROWN-RING-SZ7' },
          { name: 'Free Size / Adjustable', sizeName: 'Free Size / One Size', mrp: 1999, salePrice: 999, stock: 20, sku: 'CROWN-RING-ADJ' },
        ],
      },

      // 4. Gift & Hamper Product with Dimensions/Sizes: Huggable Lavender Teddy Bear
      {
        name: 'Giant Huggable Lavender Plush Teddy Bear with Luxury Satin Ribbon',
        sku: 'LAVENDER-PLUSH-TEDDY-GIFT',
        subcategoryId: teddySub?.id || hamperCat?.id,
        price: 2499,
        salePrice: 1299,
        discountPercent: 48,
        stock: 60,
        brand: 'ThePurple Gifts',
        badge: 'GIFT SPECIAL',
        isFeatured: true,
        isBestSeller: true,
        isBulk: false,
        minOrderQuantity: 1,
        shortDescription: 'Fluffy, ultra-soft lavender purple plush teddy bear adorned with a luxury satin bow ribbon. Ideal for anniversaries, birthdays, and surprise gift boxes.',
        description: 'Made from high-density, cloud-soft micro-plush velvet fabric, this lavender teddy bear offers the warmest hugs. Stuffed with hypoallergenic PP cotton and completed with an elegant deep purple satin bow.',
        specifications: 'Material: Super Soft Korean Plush\nFilling: 100% Virgin Siliconized PP Cotton\nColor: Pastel Lavender Purple\nSafety: Non-toxic, Child-Safe Tested',
        careInstructions: 'Surface washable with mild detergent sponge. Do not machine dry.',
        tags: ['Teddy Bear', 'Plush Toy', 'Lavender', 'Gift Hamper', 'Birthday Gift', 'Romantic'],
        imageUrl: teddyImg,
        variants: [
          { name: '30 cm / Standard', sizeName: '30 cm / 11.8" (Standard)', mrp: 2499, salePrice: 1299, stock: 30, sku: 'TEDDY-LAV-30CM' },
          { name: '50 cm / Hug Size', sizeName: '50 cm / 19.7" (Hug Size)', mrp: 3999, salePrice: 1999, stock: 20, sku: 'TEDDY-LAV-50CM' },
          { name: '100 cm / Giant Size', sizeName: '100 cm / 1 Metre (Giant Size)', mrp: 5999, salePrice: 2999, stock: 10, sku: 'TEDDY-LAV-100CM' },
        ],
      },

      // 5. Fashion Hair Accessories Set: Korean Pearl Bow Floral Clips Pack
      {
        name: 'Korean Aesthetic Pearl Bow & Floral Hairpins Claw Clip Set (4 Pcs)',
        sku: 'KOREAN-PEARL-HAIR-SET-4',
        subcategoryId: hairSub?.id || hairCat?.id,
        price: 1199,
        salePrice: 599,
        discountPercent: 50,
        stock: 120,
        brand: 'ThePurple Accessories',
        badge: 'NEW ARRIVAL',
        isFeatured: true,
        isBestSeller: false,
        isBulk: false,
        minOrderQuantity: 1,
        shortDescription: 'Pack of 4 elegant Korean style hair accessories including velvet bow clip, golden floral claw clips, and crystal pearl U-pins.',
        description: 'Elevate your daily hairstyles with this 4-piece French & Korean aesthetic hair styling set. Includes a luxury black velvet pearl bow barrette, gold-tone floral blossom mini claw clip, transparent crystal claw, and hand-twisted pearl branch hairpins.',
        specifications: 'Pack Contains: 1 Bow Barrette + 2 Claw Clips + 1 Pair Floral U-Pins\nMaterial: Alloy Metal, Velvet Fabric, Faux Freshwater Pearls\nClip Mechanism: High-Tension Steel Spring Grip',
        careInstructions: 'Wipe clean with a soft dry cloth. Store separately to prevent tangling.',
        tags: ['Hair Accessories', 'Claw Clip', 'Korean Style', 'Pearl Bow', 'Hairpins', 'Velvet'],
        imageUrl: hairClipsImg,
      },
    ];

    const createdProductIds = [];

    for (const pData of productsData) {
      // Purge any existing product with same SKU/slug permanently
      await Product.destroy({
        where: {
          [sequelize.Sequelize.Op.or]: [{ sku: pData.sku }, { slug: slugify(pData.name) }],
        },
        force: true,
      }).catch(() => {});

      const product = await Product.create({
        name: pData.name,
        sku: pData.sku,
        slug: slugify(pData.name),
        subcategoryId: pData.subcategoryId,
        price: pData.price,
        salePrice: pData.salePrice,
        discountPercent: pData.discountPercent,
        stock: pData.stock,
        lowStockThreshold: 5,
        brand: pData.brand,
        badge: pData.badge,
        shortDescription: pData.shortDescription,
        description: pData.description,
        specifications: pData.specifications,
        careInstructions: pData.careInstructions,
        tags: pData.tags,
        status: PRODUCT_STATUS.PUBLISHED,
        isActive: true,
        isFeatured: pData.isFeatured,
        isBestSeller: pData.isBestSeller,
        isBulk: Boolean(pData.isBulk),
        minOrderQuantity: pData.minOrderQuantity || 1,
        publishedAt: new Date(),
        seoTitle: pData.name,
        seoDescription: pData.shortDescription,
        seoKeywords: pData.tags.join(', '),
      });

      // Attach Image
      if (pData.imageUrl) {
        await ProductImage.create({
          productId: product.id,
          imageUrl: pData.imageUrl,
          isPrimary: true,
          displayOrder: 0,
          altText: product.name,
        });
      }

      // Attach Variants if any
      if (pData.variants && pData.variants.length > 0) {
        for (let vIdx = 0; vIdx < pData.variants.length; vIdx++) {
          const v = pData.variants[vIdx];
          let colorId = null;
          let sizeId = null;

          if (v.colorName && colorMap.has(v.colorName.toLowerCase().trim())) {
            colorId = colorMap.get(v.colorName.toLowerCase().trim());
          }
          if (v.sizeName && sizeMap.has(v.sizeName.toLowerCase().trim())) {
            sizeId = sizeMap.get(v.sizeName.toLowerCase().trim());
          }

          await ProductVariant.create({
            productId: product.id,
            sku: v.sku,
            name: `${product.name} - ${v.name}`,
            colorId,
            sizeId,
            mrp: v.mrp || product.price,
            salePrice: v.salePrice || product.salePrice,
            stock: v.stock || 10,
            imageUrl: pData.imageUrl,
            isActive: true,
            displayOrder: vIdx,
          });
        }
      }

      createdProductIds.push(product.id);
      console.log(`✓ Created Product [${product.sku}]: ${product.name}`);
    }

    // Sync all new products to Meilisearch search index
    if (createdProductIds.length > 0) {
      console.log(`Indexing ${createdProductIds.length} products to Meilisearch...`);
      const allNewProds = await Product.findAll({
        where: { id: { [sequelize.Sequelize.Op.in]: createdProductIds } },
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

      await meiliService.indexProducts(docs).catch((e) => console.warn('Meilisearch index warning:', e.message));
      console.log('✓ Successfully synced with Meilisearch!');
    }

    console.log('--- All 5 Diverse Products Successfully Seeded! ---');
    return { success: true, count: createdProductIds.length };
  } catch (err) {
    console.error('Error seeding diverse products:', err);
    throw err;
  }
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDiverseProducts()
    .then(() => {
      console.log('Seeding script completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding script failed:', err);
      process.exit(1);
    });
}
