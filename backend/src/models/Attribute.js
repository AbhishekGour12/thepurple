import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Attribute = sequelize.define(
  'Attribute',
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
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'attributes',
    timestamps: true,
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['isActive'] },
    ],
  }
);

export default Attribute;
