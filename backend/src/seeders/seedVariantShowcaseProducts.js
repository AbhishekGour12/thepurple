import sequelize from '../config/database.js';
import {
  Category,
  Subcategory,
  Product,
  ProductImage,
  ProductVariant,
  Color,
  Size,
} from '../models/index.js';
import logger from '../config/logger.js';

export const seedVariantShowcaseProducts = async () => {
  try {
    logger.info('Starting Variant Showcase Products Seeder with 5 images per product & color-specific variant images...');

    // 1. Ensure required Colors exist
    const [silverColor] = await Color.findOrCreate({
      where: { name: 'Pure Sterling Silver' },
      defaults: { hexCode: '#CBD5E1', displayOrder: 1, isActive: true },
    });
    const [yellowGoldColor] = await Color.findOrCreate({
      where: { name: '22K Royal Yellow Gold' },
      defaults: { hexCode: '#EAB308', displayOrder: 2, isActive: true },
    });
    const [roseGoldColor] = await Color.findOrCreate({
      where: { name: 'Rose Gold' },
      defaults: { hexCode: '#FB7185', displayOrder: 3, isActive: true },
    });
    const [platinumColor] = await Color.findOrCreate({
      where: { name: 'Platinum / 18K White Gold' },
      defaults: { hexCode: '#94A3B8', displayOrder: 4, isActive: true },
    });
    const [mochaBrownColor] = await Color.findOrCreate({
      where: { name: 'Classic Mocha Brown' },
      defaults: { hexCode: '#78350F', displayOrder: 5, isActive: true },
    });
    const [blushPinkColor] = await Color.findOrCreate({
      where: { name: 'Blush Pink' },
      defaults: { hexCode: '#F472B6', displayOrder: 6, isActive: true },
    });
    const [snowWhiteColor] = await Color.findOrCreate({
      where: { name: 'Snow White' },
      defaults: { hexCode: '#F8FAFC', displayOrder: 7, isActive: true },
    });
    const [teakWoodColor] = await Color.findOrCreate({
      where: { name: 'Teak Wood Frame' },
      defaults: { hexCode: '#9A3412', displayOrder: 8, isActive: true },
    });
    const [matteBlackColor] = await Color.findOrCreate({
      where: { name: 'Matte Black Frame' },
      defaults: { hexCode: '#1E293B', displayOrder: 9, isActive: true },
    });
    const [antiqueGoldFrameColor] = await Color.findOrCreate({
      where: { name: 'Antique Gold Frame' },
      defaults: { hexCode: '#CA8A04', displayOrder: 10, isActive: true },
    });

    // 2. Ensure required Sizes exist
    const [size16In] = await Size.findOrCreate({
      where: { name: '16" / 40.6 cm (Choker)' },
      defaults: { code: '16IN', displayOrder: 1, isActive: true },
    });
    const [size18In] = await Size.findOrCreate({
      where: { name: '18" / 45.7 cm (Princess - Standard)' },
      defaults: { code: '18IN', displayOrder: 2, isActive: true },
    });
    const [size20In] = await Size.findOrCreate({
      where: { name: '20" / 50.8 cm (Matinee)' },
      defaults: { code: '20IN', displayOrder: 3, isActive: true },
    });
    const [size24In] = await Size.findOrCreate({
      where: { name: '24" / 61.0 cm (Opera Length)' },
      defaults: { code: '24IN', displayOrder: 4, isActive: true },
    });

    // Plush Sizes
    const [size30cm] = await Size.findOrCreate({
      where: { name: '30 cm / 11.8" (Standard)' },
      defaults: { code: '30CM', displayOrder: 5, isActive: true },
    });
    const [size50cm] = await Size.findOrCreate({
      where: { name: '50 cm / 19.7" (Hug Size)' },
      defaults: { code: '50CM', displayOrder: 6, isActive: true },
    });
    const [size100cm] = await Size.findOrCreate({
      where: { name: '100 cm / 1 Metre (Giant Size)' },
      defaults: { code: '100CM', displayOrder: 7, isActive: true },
    });
    const [size150cm] = await Size.findOrCreate({
      where: { name: '150 cm / 1.5 Metre (Life Size)' },
      defaults: { code: '150CM', displayOrder: 8, isActive: true },
    });

    // 2D Frame Sizes (Length x Width)
    const [frame4x6] = await Size.findOrCreate({
      where: { name: '4" × 6" (10.2 × 15.2 cm)' },
      defaults: { code: '4X6IN', displayOrder: 9, isActive: true },
    });
    const [frame8x10] = await Size.findOrCreate({
      where: { name: '8" × 10" (20.3 × 25.4 cm)' },
      defaults: { code: '8X10IN', displayOrder: 10, isActive: true },
    });
    const [frame12x18] = await Size.findOrCreate({
      where: { name: '12" × 18" (30.5 × 45.7 cm)' },
      defaults: { code: '12X18IN', displayOrder: 11, isActive: true },
    });
    const [frame18x24] = await Size.findOrCreate({
      where: { name: '18" × 24" (45.7 × 61.0 cm)' },
      defaults: { code: '18X24IN', displayOrder: 12, isActive: true },
    });

    // 3. Ensure Categories & Subcategories exist
    let [chainsCat] = await Category.findOrCreate({
      where: { slug: 'chains-necklaces' },
      defaults: {
        name: 'Chains & Necklaces',
        description: 'Pure silver, 22K gold, and layered chains in multiple lengths.',
        imageUrl: '/images/storefront/cat-chains.jpg',
        isFeatured: true,
      },
    });

    let [chainsSub] = await Subcategory.findOrCreate({
      where: { name: 'Italian Chains', categoryId: chainsCat.id },
      defaults: {
        slug: 'italian-chains',
        description: 'Italian snake and rope chains with various lengths.',
      },
    });

    let [giftsCat] = await Category.findOrCreate({
      where: { slug: 'gifts-celebration-hampers' },
      defaults: {
        name: 'Gifts & Celebration Hampers',
        description: 'Plush bears, hampers, and personalized frames.',
        imageUrl: '/images/storefront/cat-hampers-luxury.jpg',
        isFeatured: true,
      },
    });

    let [giftsSub] = await Subcategory.findOrCreate({
      where: { name: 'Teddy & Plush Gifts', categoryId: giftsCat.id },
      defaults: {
        slug: 'teddy-plush-gifts',
        description: 'Giant huggable teddy bears across multiple height dimensions.',
      },
    });

    let [decorSub] = await Subcategory.findOrCreate({
      where: { name: 'Personalized Wall Frames', categoryId: giftsCat.id },
      defaults: {
        slug: 'personalized-wall-frames',
        description: 'Custom photo frames in various Length x Width dimensions.',
      },
    });

    // =========================================================================
    // PRODUCT 1: SAME COLOR + MULTI-LENGTH SIZES & DIFFERENT OFFERS
    // =========================================================================
    let [prod1] = await Product.findOrCreate({
      where: { slug: 'pure-925-silver-italian-snake-chain' },
      defaults: {
        subcategoryId: chainsSub.id,
        name: 'Pure 925 Sterling Silver Italian Snake Chain',
        slug: 'pure-925-silver-italian-snake-chain',
        sku: 'SLV-SNAKE-CHN',
        shortDescription: 'Premium Italian crafted 925 sterling silver flexible snake chain. Available in 16", 18", 20", and 24" lengths with anti-tarnish coating.',
        description: 'Crafted with precision in Italy, this solid 925 sterling silver snake chain lays gracefully flat on the collarbone. Featuring a high-polish mirror finish and a secure lobster lock. Choose your preferred chain length.',
        price: 1499,
        salePrice: 749,
        discountPercent: 50,
        stock: 115,
        rating: 4.9,
        reviewCount: 48,
        badge: 'BESTSELLER',
        isFeatured: true,
        isBestSeller: true,
        status: 'PUBLISHED',
        isActive: true,
      },
    });

    // 5 High Quality Images for Product 1 Gallery
    await ProductImage.destroy({ where: { productId: prod1.id } });
    const prod1GalleryImages = [
      { url: '/images/storefront/prod-cuban-chain.jpg', alt: 'Pure 925 Silver Snake Chain Flat Lay' },
      { url: '/images/storefront/cat-chains.jpg', alt: 'Pure 925 Silver Chain on Collarbone Neck Display' },
      { url: '/images/storefront/prod-layered-chain.jpg', alt: 'Italian Chain Close-up Lock & Polish Detail' },
      { url: '/images/storefront/prod-gold-rope.jpg', alt: 'Silver Snake Chain Multi-Length Comparison' },
      { url: '/images/storefront/cat-necklaces.jpg', alt: 'Silver Chain Luxury Velvet Gift Box' },
    ];
    for (let i = 0; i < prod1GalleryImages.length; i++) {
      await ProductImage.create({
        productId: prod1.id,
        imageUrl: prod1GalleryImages[i].url,
        isPrimary: i === 0,
        displayOrder: i + 1,
        altText: prod1GalleryImages[i].alt,
      });
    }

    // Variants for Product 1 (Same Color: Silver, Different Lengths & Prices)
    await ProductVariant.destroy({ where: { productId: prod1.id } });
    const prod1Variants = [
      { sizeId: size16In.id, sku: 'SLV-SNAKE-16IN', name: 'Silver Snake Chain - 16" (40.6 cm)', mrp: 1199, salePrice: 599, stock: 30, img: '/images/storefront/prod-cuban-chain.jpg' },
      { sizeId: size18In.id, sku: 'SLV-SNAKE-18IN', name: 'Silver Snake Chain - 18" (45.7 cm)', mrp: 1499, salePrice: 749, stock: 40, img: '/images/storefront/cat-chains.jpg' },
      { sizeId: size20In.id, sku: 'SLV-SNAKE-20IN', name: 'Silver Snake Chain - 20" (50.8 cm)', mrp: 1799, salePrice: 899, stock: 25, img: '/images/storefront/prod-layered-chain.jpg' },
      { sizeId: size24In.id, sku: 'SLV-SNAKE-24IN', name: 'Silver Snake Chain - 24" (61.0 cm)', mrp: 2199, salePrice: 1099, stock: 20, img: '/images/storefront/prod-gold-rope.jpg' },
    ];
    for (const v of prod1Variants) {
      await ProductVariant.create({
        productId: prod1.id,
        sku: v.sku,
        colorId: silverColor.id,
        sizeId: v.sizeId,
        name: v.name,
        mrp: v.mrp,
        salePrice: v.salePrice,
        stock: v.stock,
        imageUrl: v.img,
        isActive: true,
        displayOrder: 1,
      });
    }

    // =========================================================================
    // PRODUCT 2: SAME SIZE (18") + MULTIPLE COLORS (Gold, Rose Gold, Platinum)
    // =========================================================================
    let [prod2] = await Product.findOrCreate({
      where: { slug: 'royal-solitaire-heart-pendant-necklace' },
      defaults: {
        subcategoryId: chainsSub.id,
        name: 'Royal Solitaire Heart Pendant Necklace (18 Inch)',
        slug: 'royal-solitaire-heart-pendant-necklace',
        sku: 'SOL-HEART-18IN',
        shortDescription: 'Exquisite 1 Carat Heart Solitaire pendant on an 18-inch delicate chain. Available in 22K Yellow Gold, Rose Gold, and Platinum.',
        description: 'A timeless love expression featuring a brilliant cut VVS-grade lab solitaire heart gemstone. Set in a four-prong setting with an 18-inch matching link chain.',
        price: 2999,
        salePrice: 1499,
        discountPercent: 50,
        stock: 55,
        rating: 4.8,
        reviewCount: 36,
        badge: 'TRENDING',
        isFeatured: true,
        isBestSeller: false,
        status: 'PUBLISHED',
        isActive: true,
      },
    });

    // 5 High Quality Gallery Images for Product 2
    await ProductImage.destroy({ where: { productId: prod2.id } });
    const prod2GalleryImages = [
      { url: '/images/storefront/prod-heart-pendant.jpg', alt: 'Royal Solitaire Heart Pendant in Gold' },
      { url: '/images/storefront/hero-rosegold.jpg', alt: 'Rose Gold Heart Pendant Edition' },
      { url: '/images/storefront/prod-diamond-ring.jpg', alt: 'Platinum / White Gold Diamond Pendant Edition' },
      { url: '/images/storefront/hero-gold.jpg', alt: '22K Gold Handcrafted Setting Close-up' },
      { url: '/images/storefront/hero-diamond.jpg', alt: 'Brilliant Solitaire Heart Cut Certified Gem' },
    ];
    for (let i = 0; i < prod2GalleryImages.length; i++) {
      await ProductImage.create({
        productId: prod2.id,
        imageUrl: prod2GalleryImages[i].url,
        isPrimary: i === 0,
        displayOrder: i + 1,
        altText: prod2GalleryImages[i].alt,
      });
    }

    // Variants for Product 2 (Each color gets its own dedicated image!)
    await ProductVariant.destroy({ where: { productId: prod2.id } });
    const prod2Variants = [
      {
        colorId: yellowGoldColor.id,
        sku: 'SOL-HEART-GOLD-18',
        name: '22K Royal Yellow Gold - 18"',
        mrp: 2999,
        salePrice: 1499,
        stock: 20,
        imageUrl: '/images/storefront/hero-gold.jpg', // Dedicated Gold Image
      },
      {
        colorId: roseGoldColor.id,
        sku: 'SOL-HEART-ROSE-18',
        name: 'Rose Gold - 18"',
        mrp: 2999,
        salePrice: 1499,
        stock: 20,
        imageUrl: '/images/storefront/hero-rosegold.jpg', // Dedicated Rose Gold Image
      },
      {
        colorId: platinumColor.id,
        sku: 'SOL-HEART-PLAT-18',
        name: 'Platinum / White Gold - 18"',
        mrp: 3499,
        salePrice: 1749,
        stock: 15,
        imageUrl: '/images/storefront/hero-diamond.jpg', // Dedicated Platinum / White Gold Image
      },
    ];
    for (const v of prod2Variants) {
      await ProductVariant.create({
        productId: prod2.id,
        sku: v.sku,
        colorId: v.colorId,
        sizeId: size18In.id,
        name: v.name,
        mrp: v.mrp,
        salePrice: v.salePrice,
        stock: v.stock,
        imageUrl: v.imageUrl,
        isActive: true,
        displayOrder: 1,
      });
    }

    // =========================================================================
    // PRODUCT 3: MULTI-COLOR X MULTI-HEIGHT PLUSH TEDDY BEAR MATRIX
    // =========================================================================
    let [prod3] = await Product.findOrCreate({
      where: { slug: 'huggable-velvet-celebration-teddy-bear' },
      defaults: {
        subcategoryId: giftsSub.id,
        name: 'Huggable Velvet Celebration Teddy Bear',
        slug: 'huggable-velvet-celebration-teddy-bear',
        sku: 'PLUSH-BEAR-HUGE',
        shortDescription: 'Ultra-soft premium velvet teddy bear available from 30 cm pocket size up to 150 cm / 1.5 Metre life-size giant bear.',
        description: 'Bring immense joy to loved ones with our ultra-cuddly velvet celebration teddy bears. Handcrafted with hypo-allergenic plush filling and velvet bow tie. Choose from Mocha Brown, Blush Pink, and Snow White across 4 giant height sizes.',
        price: 1999,
        salePrice: 999,
        discountPercent: 50,
        stock: 80,
        rating: 5.0,
        reviewCount: 64,
        badge: 'HOT DEAL',
        isFeatured: true,
        isBestSeller: true,
        status: 'PUBLISHED',
        isActive: true,
      },
    });

    // 5 High Quality Gallery Images for Product 3
    await ProductImage.destroy({ where: { productId: prod3.id } });
    const prod3GalleryImages = [
      { url: '/images/storefront/prod-teddy-gift.jpg', alt: 'Classic Mocha Brown Velvet Teddy Bear' },
      { url: '/images/storefront/cat-hampers-luxury.jpg', alt: 'Blush Pink Celebration Bear in Luxury Box' },
      { url: '/images/storefront/cat-teddy.jpg', alt: 'Snow White Pure Plush Teddy Bear' },
      { url: '/images/storefront/hero-gifts.jpg', alt: 'Giant 150cm Life Size Teddy Bear Display' },
      { url: '/images/storefront/prod-rose-bangle.jpg', alt: 'Teddy Bear Velvet Bow Ribbon & Soft Texture Detail' },
    ];
    for (let i = 0; i < prod3GalleryImages.length; i++) {
      await ProductImage.create({
        productId: prod3.id,
        imageUrl: prod3GalleryImages[i].url,
        isPrimary: i === 0,
        displayOrder: i + 1,
        altText: prod3GalleryImages[i].alt,
      });
    }

    // Color-specific images for Product 3 variants
    const bearColorImages = {
      BRN: '/images/storefront/prod-teddy-gift.jpg', // Brown Bear Image
      PNK: '/images/storefront/cat-hampers-luxury.jpg', // Pink Bear Image
      WHT: '/images/storefront/cat-teddy.jpg', // White Bear Image
    };

    await ProductVariant.destroy({ where: { productId: prod3.id } });
    const bearColors = [
      { id: mochaBrownColor.id, code: 'BRN', name: 'Mocha Brown' },
      { id: blushPinkColor.id, code: 'PNK', name: 'Blush Pink' },
      { id: snowWhiteColor.id, code: 'WHT', name: 'Snow White' },
    ];
    const bearSizes = [
      { id: size30cm.id, code: '30CM', name: '30 cm / 11.8"', mrp: 999, salePrice: 499, stock: 10 },
      { id: size50cm.id, code: '50CM', name: '50 cm / 19.7"', mrp: 1999, salePrice: 999, stock: 10 },
      { id: size100cm.id, code: '100CM', name: '100 cm / 1 Metre', mrp: 3999, salePrice: 1999, stock: 5 },
      { id: size150cm.id, code: '150CM', name: '150 cm / 1.5 Metre', mrp: 6999, salePrice: 3499, stock: 3 },
    ];

    for (const c of bearColors) {
      for (const s of bearSizes) {
        await ProductVariant.create({
          productId: prod3.id,
          sku: `BEAR-${c.code}-${s.code}`,
          colorId: c.id,
          sizeId: s.id,
          name: `${c.name} - ${s.name}`,
          mrp: s.mrp,
          salePrice: s.salePrice,
          stock: s.stock,
          imageUrl: bearColorImages[c.code], // Dedicated image per color!
          isActive: true,
          displayOrder: 1,
        });
      }
    }

    // =========================================================================
    // PRODUCT 4: 2D LENGTH X WIDTH DIMENSIONS WITH AUTO-CONVERTED SIZES
    // =========================================================================
    let [prod4] = await Product.findOrCreate({
      where: { slug: 'custom-engraved-royal-heritage-wall-frame' },
      defaults: {
        subcategoryId: decorSub.id,
        name: 'Custom Engraved Royal Heritage Wall Frame',
        slug: 'custom-engraved-royal-heritage-wall-frame',
        sku: 'FRAME-ROYAL-DIM',
        shortDescription: 'Premium handcrafted wooden wall photo frame available in 4"×6", 8"×10", 12"×18", and 18"×24" with museum-grade acrylic glass.',
        description: 'Preserve cherished milestones with our handcrafted solid wood picture frames. Featuring precision laser engraved borders, moisture-resistant backing, and dual hanging hardware. Available in Teak Wood, Matte Black, and Antique Gold.',
        price: 1499,
        salePrice: 749,
        discountPercent: 50,
        stock: 90,
        rating: 4.9,
        reviewCount: 42,
        badge: 'POPULAR',
        isFeatured: true,
        isBestSeller: true,
        status: 'PUBLISHED',
        isActive: true,
      },
    });

    // 5 High Quality Gallery Images for Product 4
    await ProductImage.destroy({ where: { productId: prod4.id } });
    const prod4GalleryImages = [
      { url: '/images/storefront/cat-temple-jewellery.jpg', alt: 'Teak Wood Heritage Wall Photo Frame' },
      { url: '/images/storefront/cat-mens-jewellery.jpg', alt: 'Matte Black Modern Minimalist Frame Finish' },
      { url: '/images/storefront/cat-chandbali-earrings.jpg', alt: 'Antique Gold Ornate Laser Engraved Frame Finish' },
      { url: '/images/storefront/cat-bangles.jpg', alt: 'Wall Art Multi-Frame Living Room Arrangement' },
      { url: '/images/storefront/hero-gifts.jpg', alt: 'Museum Grade Acrylic Glass & Corner Joint Detail' },
    ];
    for (let i = 0; i < prod4GalleryImages.length; i++) {
      await ProductImage.create({
        productId: prod4.id,
        imageUrl: prod4GalleryImages[i].url,
        isPrimary: i === 0,
        displayOrder: i + 1,
        altText: prod4GalleryImages[i].alt,
      });
    }

    // Color-specific images for Product 4 frame finishes
    const frameColorImages = {
      TEAK: '/images/storefront/cat-temple-jewellery.jpg', // Teak Wood Frame Image
      BLK: '/images/storefront/cat-mens-jewellery.jpg', // Matte Black Frame Image
      GLD: '/images/storefront/cat-chandbali-earrings.jpg', // Antique Gold Frame Image
    };

    await ProductVariant.destroy({ where: { productId: prod4.id } });
    const frameColors = [
      { id: teakWoodColor.id, code: 'TEAK', name: 'Teak Wood' },
      { id: matteBlackColor.id, code: 'BLK', name: 'Matte Black' },
      { id: antiqueGoldFrameColor.id, code: 'GLD', name: 'Antique Gold' },
    ];
    const frameSizes = [
      { id: frame4x6.id, code: '4X6IN', name: '4" × 6" (10.2 × 15.2 cm)', mrp: 799, salePrice: 399, stock: 15 },
      { id: frame8x10.id, code: '8X10IN', name: '8" × 10" (20.3 × 25.4 cm)', mrp: 1499, salePrice: 749, stock: 15 },
      { id: frame12x18.id, code: '12X18IN', name: '12" × 18" (30.5 × 45.7 cm)', mrp: 2499, salePrice: 1199, stock: 10 },
      { id: frame18x24.id, code: '18X24IN', name: '18" × 24" (45.7 × 61.0 cm)', mrp: 3999, salePrice: 1899, stock: 8 },
    ];

    for (const c of frameColors) {
      for (const s of frameSizes) {
        await ProductVariant.create({
          productId: prod4.id,
          sku: `FRAME-${c.code}-${s.code}`,
          colorId: c.id,
          sizeId: s.id,
          name: `${c.name} - ${s.name}`,
          mrp: s.mrp,
          salePrice: s.salePrice,
          stock: s.stock,
          imageUrl: frameColorImages[c.code], // Dedicated image per color finish!
          isActive: true,
          displayOrder: 1,
        });
      }
    }

    logger.info('Variant Showcase Products Seeder with 5 images per product & color-specific variant images completed successfully!');
  } catch (err) {
    logger.error('Error seeding showcase products:', err);
    throw err;
  }
};

export default seedVariantShowcaseProducts;
