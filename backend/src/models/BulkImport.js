import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const BULK_IMPORT_STATUS = {
  UPLOADED: 'UPLOADED',
  VALIDATING: 'VALIDATING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  PARTIALLY_COMPLETED: 'PARTIALLY_COMPLETED',
};

export const BulkImport = sequelize.define(
  'BulkImport',
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
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        BULK_IMPORT_STATUS.UPLOADED,
        BULK_IMPORT_STATUS.VALIDATING,
        BULK_IMPORT_STATUS.PROCESSING,
        BULK_IMPORT_STATUS.COMPLETED,
        BULK_IMPORT_STATUS.FAILED,
        BULK_IMPORT_STATUS.PARTIALLY_COMPLETED
      ),
      allowNull: false,
      defaultValue: BULK_IMPORT_STATUS.UPLOADED,
    },
    totalRows: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    validRows: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    errorRows: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    processedRows: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    errors: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    warnings: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: 'bulk_imports',
    timestamps: true,
    indexes: [
      { fields: ['adminId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default BulkImport;
