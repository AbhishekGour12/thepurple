import sequelize from '../config/database.js';
import logger from '../config/logger.js';
import {
  Admin,
  User,
  Category,
  Subcategory,
  Product,
  ProductImage,
  Banner,
} from '../models/index.js';
import { bootstrapSuperAdmin } from './bootstrapAdmin.js';

export const runSeeds = async () => {
  logger.info('Running baseline seeders...');

  try {
    // 1. Sync all models with database
    await sequelize.sync({ alter: false });
    logger.info('Sequelize models synchronized successfully.');

    // 2. Seed / Bootstrap Super Admin
    await bootstrapSuperAdmin();

    // 3. Seed Admin Users in User table if empty
    const existingAdmin = await User.findOne({ where: { role: 'SUPER_ADMIN' } });
    if (!existingAdmin) {
      await User.bulkCreate([
        {
          name: 'Super Admin',
          mobile: '9876543210',
          email: 'admin@thepurple.in',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        },
        {
          name: 'Catalogue Manager',
          mobile: '9876543211',
          email: 'manager@thepurple.in',
          role: 'MANAGER',
          status: 'ACTIVE',
        },
        {
          name: 'Inventory Executive',
          mobile: '9876543212',
          email: 'executive@thepurple.in',
          role: 'EXECUTIVE',
          status: 'ACTIVE',
        },
      ]);
      logger.info('Created default administrative roles & users (Super Admin, Manager, Executive)');
    }

    // 3. Seed Core Categories & Subcategories
    const existingCategory = await Category.findOne({ where: { slug: 'jewellery' } });
    let categoryJewellery;
    if (!existingCategory) {
      categoryJewellery = await Category.create({
        name: 'Jewellery',
        slug: 'jewellery',
        description: 'Exquisite minimal and statement fashion jewellery collection',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
        displayOrder: 1,
        isActive: true,
      });

      const catFashion = await Category.create({
        name: 'Fashion & Apparel',
        slug: 'fashion-apparel',
        description: 'Trendy apparel and contemporary styles',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
        displayOrder: 2,
        isActive: true,
      });

      // Subcategories
      const subChains = await Subcategory.create({
        categoryId: categoryJewellery.id,
        name: 'Chains & Necklaces',
        slug: 'chains-necklaces',
        description: 'Minimal gold chains, pendant necklaces and layered pieces',
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
        displayOrder: 1,
        isActive: true,
      });

      const subEarrings = await Subcategory.create({
        categoryId: categoryJewellery.id,
        name: 'Earrings & Studs',
        slug: 'earrings-studs',
        description: 'Hoops, studs, drops and ethnic earrings',
        displayOrder: 2,
        isActive: true,
      });

      // 4. Seed Products for Search Intent Demonstration (Section 11)
      const productsData = [
        {
          subcategoryId: subChains.id,
          name: 'Minimal Gold Chain',
          slug: 'minimal-gold-chain',
          sku: 'TP-JW-CH001',
          shortDescription: 'Delicate 18k gold-toned daily wear sleek chain',
          description: 'Anti-tarnish, water-resistant daily wear minimalist gold chain.',
          price: 1499.0,
          discountPercent: 20,
          salePrice: 1199.0,
          stock: 50,
          rating: 4.8,
          reviewCount: 38,
          tags: ['gold', 'chain', 'minimal', 'daily wear', '18k'],
          isActive: true,
          isFeatured: true,
          isBestSeller: true,
        },
        {
          subcategoryId: subChains.id,
          name: 'Gold Plated Chain',
          slug: 'gold-plated-chain',
          sku: 'TP-JW-CH002',
          shortDescription: 'Classic polished gold plated chain with secure lobster clasp',
          description: 'Timeless link chain plated in premium micron gold.',
          price: 1899.0,
          discountPercent: 25,
          salePrice: 1424.0,
          stock: 45,
          rating: 4.6,
          reviewCount: 24,
          tags: ['gold', 'plated', 'chain', 'classic'],
          isActive: true,
          isFeatured: false,
          isBestSeller: true,
        },
        {
          subcategoryId: subChains.id,
          name: 'Gold Pendant Chain',
          slug: 'gold-pendant-chain',
          sku: 'TP-JW-CH003',
          shortDescription: 'Sleek chain featuring an embossed celestial pendant',
          description: 'Gleaming gold finish with handcrafted medallion pendant.',
          price: 2199.0,
          discountPercent: 15,
          salePrice: 1869.0,
          stock: 30,
          rating: 4.9,
          reviewCount: 52,
          tags: ['gold', 'pendant', 'chain', 'celestial', 'medallion'],
          isActive: true,
          isFeatured: true,
          isBestSeller: false,
        },
        {
          subcategoryId: subChains.id,
          name: 'Layered Gold Chain',
          slug: 'layered-gold-chain',
          sku: 'TP-JW-CH004',
          shortDescription: 'Double-strand layered necklace with subtle bead accents',
          description: 'Effortless multi-layer statement chain.',
          price: 2499.0,
          discountPercent: 30,
          salePrice: 1749.0,
          stock: 25,
          rating: 4.7,
          reviewCount: 19,
          tags: ['gold', 'layered', 'chain', 'statement', 'beads'],
          isActive: true,
          isFeatured: true,
          isBestSeller: false,
        },
      ];

      for (const prod of productsData) {
        const created = await Product.create(prod);
        await ProductImage.create({
          productId: created.id,
          imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
          altText: created.name,
          displayOrder: 1,
          isPrimary: true,
        });
      }

      logger.info('Created initial Categories, Subcategories, and Catalogue Products');
    }

    // 5. Seed Homepage Hero Banner
    const existingBanner = await Banner.findOne();
    if (!existingBanner) {
      await Banner.create({
        title: 'Elegance in Every Detail',
        subtitle: 'Explore ThePurple Exclusive Summer Jewellery & Apparel Collection',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
        bannerType: 'HERO_CAROUSEL',
        linkUrl: '/products',
        displayOrder: 1,
        isActive: true,
      });
      logger.info('Created initial Homepage Hero Banner');
    }

    logger.info('Seeders executed successfully.');
  } catch (error) {
    logger.error(`Seeder execution failed: ${error.message}`, { stack: error.stack });
  }
};

// If run directly via CLI: `node src/seeders/index.js`
if (process.argv[1] && process.argv[1].endsWith('seeders/index.js')) {
  runSeeds().then(() => {
    process.exit(0);
  });
}

export default runSeeds;
