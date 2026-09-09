import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Color = sequelize.define(
  'Color',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    hexCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
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
    tableName: 'colors',
    timestamps: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['isActive'] },
    ],
  }
);

export default Color;
