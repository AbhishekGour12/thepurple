import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Setting = sequelize.define(
  'Setting',
  {
    key: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'settings',
    timestamps: true,
  }
);

export default Setting;
