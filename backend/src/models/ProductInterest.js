import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const ProductInterest = sequelize.define(
  'ProductInterest',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
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
    guestId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: 'product_interests',
    timestamps: true,
    indexes: [
      { fields: ['userId', 'productId'] },
      { fields: ['guestId', 'productId'] },
      { fields: ['productId'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default ProductInterest;
