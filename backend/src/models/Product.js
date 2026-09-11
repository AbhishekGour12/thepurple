import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const PRODUCT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
};

export const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subcategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subcategories',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true },
    },
    slug: {
      type: DataTypes.STRING(280),
      allowNull: false,
      unique: true,
    },
    sku: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'ThePurple',
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    careInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    discountPercent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    salePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    hsnCode: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    status: {
      type: DataTypes.ENUM(
        PRODUCT_STATUS.DRAFT,
        PRODUCT_STATUS.PUBLISHED,
        PRODUCT_STATUS.UNPUBLISHED
      ),
      allowNull: false,
      defaultValue: PRODUCT_STATUS.DRAFT,
    },
    seoTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    seoDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    seoKeywords: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    weightGrams: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    lengthCm: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    widthCm: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    heightCm: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0.0,
      validate: { min: 0, max: 5 },
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    badge: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBestSeller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBulk: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    minOrderQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: { min: 1 },
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    paranoid: true, // soft-deletes using deletedAt column
    deletedAt: 'deletedAt',
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['sku'], unique: true },
      { fields: ['subcategoryId'] },
      { fields: ['status'] },
      { fields: ['isActive'] },
      { fields: ['salePrice'] },
      { fields: ['rating'] },
      { fields: ['isFeatured'] },
      { fields: ['isBestSeller'] },
      { fields: ['deletedAt'] },
    ],
  }
);

export default Product;
