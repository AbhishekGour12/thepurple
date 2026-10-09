import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const CartItem = sequelize.define(
  'CartItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    variantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'product_variants',
        key: 'id',
      },
      onDelete: 'SET NULL',
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
    selectedColor: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    selectedSize: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    metaSubtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: { min: 1 },
    },
    priceSnapshot: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'cart_items',
    timestamps: true,
    indexes: [
      { fields: ['cartId'] },
      { fields: ['productId'] },
      { fields: ['variantId'] },
    ],
  }
);

export default CartItem;
