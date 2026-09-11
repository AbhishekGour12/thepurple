import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const ProductAttributeValue = sequelize.define(
  'ProductAttributeValue',
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
    attributeValueId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'attribute_values',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'product_attribute_values',
    timestamps: true,
    indexes: [
      { fields: ['productId'] },
      { fields: ['attributeValueId'] },
      { fields: ['productId', 'attributeValueId'], unique: true },
    ],
  }
);

export default ProductAttributeValue;
