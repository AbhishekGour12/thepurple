import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Size = sequelize.define(
  'Size',
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
    code: {
      type: DataTypes.STRING(20),
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
    tableName: 'sizes',
    timestamps: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['isActive'] },
    ],
  }
);

export default Size;
