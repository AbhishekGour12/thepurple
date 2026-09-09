import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Banner = sequelize.define(
  'Banner',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mobileImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    linkUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    bannerType: {
      type: DataTypes.ENUM('HERO_CAROUSEL', 'OFFER_BANNER', 'PROMOTIONAL'),
      defaultValue: 'HERO_CAROUSEL',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'banners',
    timestamps: true,
    indexes: [
      { fields: ['bannerType'] },
      { fields: ['isActive'] },
      { fields: ['displayOrder'] },
    ],
  }
);

export default Banner;
