import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    googleId: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    authProvider: {
      type: DataTypes.ENUM('LOCAL', 'GOOGLE'),
      defaultValue: 'GOOGLE',
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('SUPER_ADMIN', 'MANAGER', 'EXECUTIVE', 'WORKER', 'CUSTOMER'),
      defaultValue: 'CUSTOMER',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BLOCKED'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['mobile'], unique: true },
      { fields: ['email'], unique: true },
      { fields: ['googleId'], unique: true },
      { fields: ['role'] },
    ],
  }
);

export default User;
