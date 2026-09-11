import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const AdminSession = sequelize.define(
  'AdminSession',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: 'admin_sessions',
    timestamps: true,
    indexes: [
      { fields: ['adminId'] },
      { fields: ['tokenHash'] },
      { fields: ['expiresAt'] },
    ],
  }
);

export default AdminSession;
