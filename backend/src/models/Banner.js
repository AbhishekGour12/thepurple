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
    placement: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'HOME_HERO', // 'HOME_HERO' | 'PRODUCTS_HERO' | 'HOME_OFFER' | 'PROMOTIONAL'
    },
    bannerType: {
      type: DataTypes.STRING(50),
      defaultValue: 'HERO_CAROUSEL',
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    highlight: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    subtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    badge: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
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
    primaryBtnText: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    primaryBtnUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    secondaryBtnText: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    secondaryBtnUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    linkUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    accentColor: {
      type: DataTypes.STRING(50),
      defaultValue: '#7E22CE',
    },
    bgGradient: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    discountTag: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isFullImage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
      { fields: ['placement'] },
      { fields: ['bannerType'] },
      { fields: ['isActive'] },
      { fields: ['displayOrder'] },
    ],
  }
);

export default Banner;
