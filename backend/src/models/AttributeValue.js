import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const AttributeValue = sequelize.define(
  'AttributeValue',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    attributeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'attributes',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(280),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'attribute_values',
    timestamps: true,
    indexes: [
      { fields: ['attributeId'] },
      { fields: ['attributeId', 'slug'], unique: true },
      { fields: ['isActive'] },
    ],
  }
);

export default AttributeValue;
