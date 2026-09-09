import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const ProductVariant = sequelize.define(
  'ProductVariant',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sku: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    colorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'colors',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    sizeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'sizes',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    salePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'product_variants',
    timestamps: true,
    indexes: [
      { fields: ['productId'] },
      { fields: ['sku'], unique: true },
      { fields: ['colorId'] },
      { fields: ['sizeId'] },
      { fields: ['isActive'] },
    ],
  }
);

export default ProductVariant;
