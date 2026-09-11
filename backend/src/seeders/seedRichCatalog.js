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

export const seedRichCatalog = async () => {
  try {
    logger.info('Starting Rich Catalog Seeder (Categories + Subcategories + 12 Products with 4 images each)...');

    // 1. Ensure Standard Colors and Sizes exist
    const [goldColor] = await Color.findOrCreate({
      where: { name: '22K Royal Gold' },
      defaults: { hexCode: '#EAB308', displayOrder: 1, isActive: true },
    });
    const [roseGoldColor] = await Color.findOrCreate({
      where: { name: 'Rose Gold' },
      defaults: { hexCode: '#FB7185', displayOrder: 2, isActive: true },
    });
    const [whiteGoldColor] = await Color.findOrCreate({
      where: { name: '18K White Gold / Platinum' },
      defaults: { hexCode: '#E2E8F0', displayOrder: 3, isActive: true },
    });

    const [stdSize] = await Size.findOrCreate({
      where: { name: 'Standard' },
      defaults: { code: 'STD', displayOrder: 1, isActive: true },
    });
    const [size18] = await Size.findOrCreate({
      where: { name: '18 Inch' },
      defaults: { code: '18IN', displayOrder: 2, isActive: true },
    });
    const [size22] = await Size.findOrCreate({
      where: { name: '22 Inch' },
      defaults: { code: '22IN', displayOrder: 3, isActive: true },
    });

    // 2. Define 8 Comprehensive Categories with Images
    const CATEGORIES_DATA = [
      {
        name: 'Gifts & Celebration Hampers',
        slug: 'gifts-celebration-hampers',
        description: 'Curated luxury celebration gift boxes, plush velvet teddy bears, chocolates, and celebration sets.',
        imageUrl: '/images/storefront/cat-hampers-luxury.jpg',
        isFeatured: true,
        displayOrder: 1,
        subcategories: ['Celebration Hampers', 'Teddy & Pendant Gift Sets', 'Luxury Celebration Boxes'],
      },
      {
        name: 'Diamond & Solitaire Jewellery',
        slug: 'diamond-solitaire-jewellery',
        description: 'Certified VVS-VS brilliant diamond solitaires, engagement rings, and platinum bands.',
        imageUrl: '/images/storefront/cat-solitaires-diamonds.jpg',
        isFeatured: true,
        displayOrder: 2,
        subcategories: ['Solitaire Rings', 'Diamond Eternity Bands', 'Diamond Studs'],
      },
      {
        name: 'Royal Earrings & Jhumkas',
        slug: 'royal-earrings-jhumkas',
        description: 'Heritage Indian bridal Chandbali, Kundan pearls, and 22K gold drop earrings.',
        imageUrl: '/images/storefront/cat-chandbali-earrings.jpg',
        isFeatured: true,
        displayOrder: 3,
        subcategories: ['Chandbali Earrings', 'Kundan Jhumkas', 'Gold Studs & Drops'],
      },
      {
        name: 'Temple & Antique Gold',
        slug: 'temple-antique-gold',
        description: 'Authentic South Indian 22K temple jewellery with Goddess Lakshmi engraving and ruby gemstones.',
        imageUrl: '/images/storefront/cat-temple-jewellery.jpg',
        isFeatured: true,
        displayOrder: 4,
        subcategories: ['Temple Necklaces', 'Lakshmi Pendants', 'Antique Gold Kadas'],
      },
      {
        name: "Men's Luxury Jewellery",
        slug: 'mens-luxury-jewellery',
        description: "Bold 22K gold Cuban link chains, signet rings, and luxury timepieces for gentlemen.",
        imageUrl: '/images/storefront/cat-mens-jewellery.jpg',
        isFeatured: true,
        displayOrder: 5,
        subcategories: ['Cuban Chains', 'Signet Rings', 'Luxury Chronographs'],
      },
      {
        name: 'Chains & Necklaces',
        slug: 'chains-necklaces',
        description: 'Handcrafted 22K rope chains, floral chokers, and multi-layered gold necklaces.',
        imageUrl: '/images/storefront/cat-chains.jpg',
        isFeatured: true,
        displayOrder: 6,
        subcategories: ['Rope Chains', 'Chokers & Collars', 'Layered Necklaces'],
      },
      {
        name: 'Bangles, Kadas & Bracelets',
        slug: 'bangles-kadas-bracelets',
        description: 'Artisanal 22K gold bangles, peacock motif kadas, and rose gold charm bracelets.',
        imageUrl: '/images/storefront/cat-bangles.jpg',
        isFeatured: true,
        displayOrder: 7,
        subcategories: ['Peacock Bangles', 'Rose Gold Bracelets', 'Bridal Kadas'],
      },
      {
        name: 'Rings & Bands',
        slug: 'rings-bands',
        description: 'Fine 18K & 22K gold rings, diamond cocktail rings, and couple promise bands.',
        imageUrl: '/images/storefront/cat-rings.jpg',
        isFeatured: true,
        displayOrder: 8,
        subcategories: ['Cocktail Rings', 'Couple Bands', 'Gemstone Rings'],
      },
    ];

    const subcategoryMap = {};

    for (const catData of CATEGORIES_DATA) {
      let [cat] = await Category.findOrCreate({
        where: { slug: catData.slug },
        defaults: {
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          imageUrl: catData.imageUrl,
          isFeatured: catData.isFeatured,
          displayOrder: catData.displayOrder,
          isActive: true,
        },
      });

      // Always update image and description if exists
      await cat.update({
        imageUrl: catData.imageUrl,
        description: catData.description,
        isFeatured: catData.isFeatured,
      });

      for (let i = 0; i < catData.subcategories.length; i++) {
        const subName = catData.subcategories[i];
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let [sub] = await Subcategory.findOrCreate({
          where: { slug: subSlug },
          defaults: {
            categoryId: cat.id,
            name: subName,
            slug: subSlug,
            description: `${subName} under ${cat.name}`,
            imageUrl: catData.imageUrl,
            displayOrder: i + 1,
            isActive: true,
          },
        });
        subcategoryMap[subName] = sub.id;
      }
    }

    // 3. Define 12 High-Value Products with 4 Detailed Images Each
    const PRODUCTS_DATA = [
      {
        name: '22K Handcrafted Golden Rope Chain',
        slug: '22k-handcrafted-golden-rope-chain',
        sku: 'TP-CHN-001',
        subcategoryName: 'Rope Chains',
        price: 899,
        salePrice: 899,
        mrp: 1499,
        discountPercent: 40,
        shortDescription: 'Classic 22K hallmarked gold rope chain with intricate spiral twisting.',
        description: 'Engineered with master craftsmanship, this 22K yellow gold rope chain offers unmatched shine and durability. Perfect for daily styling or festive occasions.',
        badge: 'BESTSELLER',
        isFeatured: true,
        isBestSeller: true,
        stock: 50,
        rating: 4.9,
        reviewCount: 148,
        images: [
          '/images/storefront/prod-gold-rope.jpg',
          '/images/storefront/cat-chains.jpg',
          '/images/storefront/prod-cuban-chain.jpg',
          '/images/storefront/prod-layered-chain.jpg',
        ],
      },
      {
        name: 'Royal Solitaire Diamond Ring (18K White Gold)',
        slug: 'royal-solitaire-diamond-ring-18k-white-gold',
        sku: 'TP-RNG-002',
        subcategoryName: 'Solitaire Rings',
        price: 1299,
        salePrice: 1299,
        mrp: 2199,
        discountPercent: 41,
        shortDescription: '18K White Gold band with a 2-carat certified brilliant solitaire diamond.',
        description: 'A timeless symbol of love, featuring a conflict-free brilliant-cut solitaire diamond set in an elegant 6-prong platinum crown.',
        badge: 'EXCLUSIVE',
        isFeatured: true,
        isBestSeller: false,
        stock: 35,
        rating: 5.0,
        reviewCount: 92,
        images: [
          '/images/storefront/prod-diamond-ring.jpg',
          '/images/storefront/cat-solitaires-diamonds.jpg',
          '/images/storefront/cat-rings.jpg',
          '/images/storefront/hero-diamond.jpg',
        ],
      },
      {
        name: 'Teddy Bear & Crystal Heart Pendant Celebration Hamper',
        slug: 'teddy-bear-crystal-heart-pendant-celebration-hamper',
        sku: 'TP-HMP-003',
        subcategoryName: 'Teddy & Pendant Gift Sets',
        price: 1499,
        salePrice: 1499,
        mrp: 2499,
        discountPercent: 40,
        shortDescription: 'Luxury hamper with plush velvet teddy, crystal heart pendant, and chocolates.',
        description: 'The ultimate romantic celebration box. Comes in a royal purple velvet box complete with a Swarovski crystal heart necklace, premium Godiva chocolates, and greeting card.',
        badge: 'GIFT CHOICE',
        isFeatured: true,
        isBestSeller: true,
        stock: 60,
        rating: 4.9,
        reviewCount: 184,
        images: [
          '/images/storefront/cat-hampers-luxury.jpg',
          '/images/storefront/prod-teddy-gift.jpg',
          '/images/storefront/prod-heart-pendant.jpg',
          '/images/storefront/hero-gifts.jpg',
        ],
      },
      {
        name: 'Emerald Sparkle Royal Gold Choker Necklace',
        slug: 'emerald-sparkle-royal-gold-choker-necklace',
        sku: 'TP-NCK-004',
        subcategoryName: 'Chokers & Collars',
        price: 1799,
        salePrice: 1799,
        mrp: 2999,
        discountPercent: 40,
        shortDescription: 'Royal 22K gold collar choker embedded with Colombian emeralds & pearls.',
        description: 'Inspired by royal Mughal bridal heirlooms, this choker features deep green emeralds flanked by lustrous Basra pearls in 22K gold filigree.',
        badge: 'TRENDING',
        isFeatured: true,
        isBestSeller: false,
        stock: 25,
        rating: 4.8,
        reviewCount: 64,
        images: [
          '/images/storefront/prod-pearl-necklace.jpg',
          '/images/storefront/prod-emerald-earrings.jpg',
          '/images/storefront/cat-necklaces.jpg',
          '/images/storefront/hero-gold.jpg',
        ],
      },
      {
        name: 'Handcrafted 22K Peacock Gold Bangles Set',
        slug: 'handcrafted-22k-peacock-gold-bangles-set',
        sku: 'TP-BNG-005',
        subcategoryName: 'Peacock Bangles',
        price: 1599,
        salePrice: 1599,
        mrp: 2799,
        discountPercent: 43,
        shortDescription: 'Pair of artisanal 22K yellow gold bangles with intricate peacock carvings.',
        description: 'Exquisitely carved with peacock motifs, these traditional gold bangles elevate any celebratory attire with timeless Indian elegance.',
        badge: 'LIMITED EDITION',
        isFeatured: true,
        isBestSeller: false,
        stock: 30,
        rating: 4.9,
        reviewCount: 52,
        images: [
          '/images/storefront/prod-rose-bangle.jpg',
          '/images/storefront/cat-bangles.jpg',
          '/images/storefront/cat-temple-jewellery.jpg',
          '/images/storefront/hero-rosegold.jpg',
        ],
      },
      {
        name: 'Royal Kundan & Pearl Chandbali Bridal Earrings',
        slug: 'royal-kundan-pearl-chandbali-bridal-earrings',
        sku: 'TP-EAR-006',
        subcategoryName: 'Chandbali Earrings',
        price: 999,
        salePrice: 999,
        mrp: 1799,
        discountPercent: 44,
        shortDescription: 'Crescent moon Kundan Chandbali earrings with ruby drops & freshwater pearls.',
        description: 'Dramatic bridal Chandbali earrings handcrafted in 22K antique gold with uncut polki diamonds, rubies, and delicate hanging pearl clusters.',
        badge: 'BRIDAL SPECIAL',
        isFeatured: true,
        isBestSeller: true,
        stock: 45,
        rating: 5.0,
        reviewCount: 110,
        images: [
          '/images/storefront/cat-chandbali-earrings.jpg',
          '/images/storefront/prod-gold-studs.jpg',
          '/images/storefront/prod-emerald-earrings.jpg',
          '/images/storefront/cat-earrings.jpg',
        ],
      },
      {
        name: "Solid 22K Men's Heavy Cuban Link Gold Chain",
        slug: 'solid-22k-mens-heavy-cuban-link-gold-chain',
        sku: 'TP-MEN-007',
        subcategoryName: 'Cuban Chains',
        price: 1999,
        salePrice: 1999,
        mrp: 3499,
        discountPercent: 43,
        shortDescription: "Heavyweight 22K yellow gold 8mm Cuban curb chain with secure box lock.",
        description: "Statement men's chain designed with interlocking diamond-cut links for a bold, radiant aesthetic.",
        badge: 'HOT DEAL',
        isFeatured: true,
        isBestSeller: true,
        stock: 40,
        rating: 4.9,
        reviewCount: 95,
        images: [
          '/images/storefront/prod-cuban-chain.jpg',
          '/images/storefront/cat-mens-jewellery.jpg',
          '/images/storefront/prod-gold-rope.jpg',
          '/images/storefront/cat-chains.jpg',
        ],
      },
      {
        name: 'Rose Gold Luxury Chronograph Timepiece & Ring Set',
        slug: 'rose-gold-luxury-chronograph-timepiece-ring-set',
        sku: 'TP-WAT-008',
        subcategoryName: 'Luxury Chronographs',
        price: 2499,
        salePrice: 2499,
        mrp: 4499,
        discountPercent: 44,
        shortDescription: 'Precision Swiss quartz chronograph watch with black onyx signet ring in rose gold.',
        description: 'Masterpiece timepiece crafted with sapphire crystal glass, 18K rose gold PVD coating, and matching black onyx signet cocktail ring.',
        badge: 'PREMIUM',
        isFeatured: true,
        isBestSeller: false,
        stock: 20,
        rating: 5.0,
        reviewCount: 38,
        images: [
          '/images/storefront/cat-mens-jewellery.jpg',
          '/images/storefront/prod-rose-bangle.jpg',
          '/images/storefront/hero-rosegold.jpg',
          '/images/storefront/hero-gold.jpg',
        ],
      },
      {
        name: 'Antique 22K Temple Goddess Lakshmi Haram & Jhumkas Set',
        slug: 'antique-22k-temple-goddess-lakshmi-haram-jhumkas-set',
        sku: 'TP-TMP-009',
        subcategoryName: 'Temple Necklaces',
        price: 2899,
        salePrice: 2899,
        mrp: 4999,
        discountPercent: 42,
        shortDescription: 'Grand temple jewellery long necklace with Goddess Lakshmi pendant & matching jhumkas.',
        description: 'Hand-engraved by temple jewellery artisans in Madurai, this grand set showcases sacred Lakshmi and elephant iconography with natural Burmese rubies.',
        badge: 'HERITAGE',
        isFeatured: true,
        isBestSeller: true,
        stock: 18,
        rating: 5.0,
        reviewCount: 88,
        images: [
          '/images/storefront/cat-temple-jewellery.jpg',
          '/images/storefront/prod-pearl-necklace.jpg',
          '/images/storefront/cat-necklaces.jpg',
          '/images/storefront/prod-gold-studs.jpg',
        ],
      },
      {
        name: 'Crystal Heart Solitaire Gold Pendant Necklace',
        slug: 'crystal-heart-solitaire-gold-pendant-necklace',
        sku: 'TP-PDN-010',
        subcategoryName: 'Pendants & Lockets',
        price: 799,
        salePrice: 799,
        mrp: 1399,
        discountPercent: 43,
        shortDescription: 'Sparkling heart-cut Austrian crystal in 18K gold dainty cable chain.',
        description: 'Dazzling heart solitaire pendant capturing prismatic light reflections, suspended from a delicate 18-inch gold chain.',
        badge: 'VALENTINE SPECIAL',
        isFeatured: true,
        isBestSeller: true,
        stock: 80,
        rating: 4.8,
        reviewCount: 132,
        images: [
          '/images/storefront/prod-heart-pendant.jpg',
          '/images/storefront/cat-hampers-luxury.jpg',
          '/images/storefront/prod-layered-chain.jpg',
          '/images/storefront/prod-diamond-ring.jpg',
        ],
      },
      {
        name: 'Triple-Layered 18K Yellow Gold Dainty Chain',
        slug: 'triple-layered-18k-yellow-gold-dainty-chain',
        sku: 'TP-LAY-011',
        subcategoryName: 'Layered Necklaces',
        price: 949,
        salePrice: 949,
        mrp: 1699,
        discountPercent: 44,
        shortDescription: 'Chic 3-tier gold chain necklace with satellite beads and bar charm.',
        description: 'Effortless everyday glamour featuring three tiered gold chains with delicate disc and bead accents.',
        badge: 'NEW ARRIVAL',
        isFeatured: true,
        isBestSeller: false,
        stock: 55,
        rating: 4.7,
        reviewCount: 46,
        images: [
          '/images/storefront/prod-layered-chain.jpg',
          '/images/storefront/prod-gold-rope.jpg',
          '/images/storefront/cat-chains.jpg',
          '/images/storefront/prod-cuban-chain.jpg',
        ],
      },
      {
        name: 'Pure Diamond Cluster Gold Stud Earrings',
        slug: 'pure-diamond-cluster-gold-stud-earrings',
        sku: 'TP-STD-012',
        subcategoryName: 'Gold Studs & Drops',
        price: 849,
        salePrice: 849,
        mrp: 1499,
        discountPercent: 43,
        shortDescription: '18K Yellow Gold floral studs set with 14 sparkling diamond accents.',
        description: 'Luminous diamond floral stud earrings crafted with secure screw backs for comfortable all-day luxury wear.',
        badge: 'BESTSELLER',
        isFeatured: true,
        isBestSeller: true,
        stock: 65,
        rating: 4.9,
        reviewCount: 120,
        images: [
          '/images/storefront/prod-gold-studs.jpg',
          '/images/storefront/prod-diamond-ring.jpg',
          '/images/storefront/cat-earrings.jpg',
          '/images/storefront/hero-diamond.jpg',
        ],
      },
    ];

    for (const prodData of PRODUCTS_DATA) {
      const subId = subcategoryMap[prodData.subcategoryName] || Object.values(subcategoryMap)[0];

      let [product] = await Product.findOrCreate({
        where: { slug: prodData.slug },
        defaults: {
          subcategoryId: subId,
          name: prodData.name,
          slug: prodData.slug,
          sku: prodData.sku,
          shortDescription: prodData.shortDescription,
          description: prodData.description,
          price: prodData.price,
          salePrice: prodData.salePrice,
          discountPercent: prodData.discountPercent,
          mrp: prodData.mrp,
          stock: prodData.stock,
          rating: prodData.rating,
          reviewCount: prodData.reviewCount,
          badge: prodData.badge,
          isFeatured: prodData.isFeatured,
          isBestSeller: prodData.isBestSeller,
          status: 'PUBLISHED',
          isActive: true,
        },
      });

      // Update product info
      await product.update({
        subcategoryId: subId,
        name: prodData.name,
        price: prodData.price,
        salePrice: prodData.salePrice,
        discountPercent: prodData.discountPercent,
        badge: prodData.badge,
        isFeatured: prodData.isFeatured,
        isBestSeller: prodData.isBestSeller,
        rating: prodData.rating,
        reviewCount: prodData.reviewCount,
        isActive: true,
      });

      // Clear existing images and re-insert 4 clean images per product
      await ProductImage.destroy({ where: { productId: product.id } });

      for (let i = 0; i < prodData.images.length; i++) {
        await ProductImage.create({
          productId: product.id,
          imageUrl: prodData.images[i],
          isPrimary: i === 0,
          displayOrder: i + 1,
          altText: `${prodData.name} Angle ${i + 1}`,
        });
      }

      // Add default product variant
      await ProductVariant.findOrCreate({
        where: { productId: product.id, sku: `${prodData.sku}-STD` },
        defaults: {
          productId: product.id,
          sku: `${prodData.sku}-STD`,
          colorId: goldColor.id,
          sizeId: stdSize.id,
          name: `${prodData.name} - Standard`,
          mrp: prodData.mrp,
          salePrice: prodData.salePrice,
          stock: prodData.stock,
          imageUrl: prodData.images[0],
          isActive: true,
          displayOrder: 1,
        },
      });
    }

    logger.info('Rich Catalog Seeder completed successfully!');
  } catch (err) {
    logger.error('Error seeding rich catalog:', err);
    throw err;
  }
};

export default seedRichCatalog;
