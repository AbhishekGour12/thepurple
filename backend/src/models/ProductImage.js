import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const ProductImage = sequelize.define(
  'ProductImage',
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
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    r2Key: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'product_images',
    timestamps: true,
    indexes: [
      { fields: ['productId'] },
      { fields: ['productId', 'isPrimary'] },
      { fields: ['displayOrder'] },
    ],
  }
);

export default ProductImage;
