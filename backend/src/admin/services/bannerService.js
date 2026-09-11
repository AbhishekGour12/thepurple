import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { Banner } from '../../models/index.js';
import AppError from '../../utils/customError.js';

export const bannerService = {
  async listBanners({ placement, bannerType, isActive, search }) {
    const where = {};

    if (placement) {
      where.placement = placement;
    }
    if (bannerType) {
      where.bannerType = bannerType;
    }
    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true' || isActive === true;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { subtitle: { [Op.iLike]: `%${search.trim()}%` } },
        { badge: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const banners = await Banner.findAll({
      where,
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    return banners;
  },

  async getBannerById(id) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw AppError.notFound('Banner not found');
    }
    return banner;
  },

  async createBanner(data) {
    if (!data.imageUrl) {
      throw AppError.badRequest('Banner image URL is required');
    }

    // Default placement if not provided
    const placement = data.placement || 'HOME_HERO';

    // Calculate next displayOrder if not specified
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const maxOrder = await Banner.max('displayOrder', { where: { placement } });
      displayOrder = (maxOrder || 0) + 1;
    }

    const banner = await Banner.create({
      placement,
      bannerType: data.bannerType || 'HERO_CAROUSEL',
      title: data.title || null,
      highlight: data.highlight || null,
      subtitle: data.subtitle || null,
      badge: data.badge || null,
      description: data.description || null,
      imageUrl: data.imageUrl,
      mobileImageUrl: data.mobileImageUrl || null,
      primaryBtnText: data.primaryBtnText || null,
      primaryBtnUrl: data.primaryBtnUrl || null,
      secondaryBtnText: data.secondaryBtnText || null,
      secondaryBtnUrl: data.secondaryBtnUrl || null,
      linkUrl: data.linkUrl || data.primaryBtnUrl || null,
      accentColor: data.accentColor || '#7E22CE',
      bgGradient: data.bgGradient || null,
      couponCode: data.couponCode || null,
      discountTag: data.discountTag || null,
      isFullImage: !!data.isFullImage,
      displayOrder,
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    });

    return banner;
  },

  async updateBanner(id, data) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw AppError.notFound('Banner not found');
    }

    const updateFields = {};
    const allowed = [
      'placement',
      'bannerType',
      'title',
      'highlight',
      'subtitle',
      'badge',
      'description',
      'imageUrl',
      'mobileImageUrl',
      'primaryBtnText',
      'primaryBtnUrl',
      'secondaryBtnText',
      'secondaryBtnUrl',
      'linkUrl',
      'accentColor',
      'bgGradient',
      'couponCode',
      'discountTag',
      'isFullImage',
      'displayOrder',
      'isActive',
      'startDate',
      'endDate',
    ];

    allowed.forEach((field) => {
      if (data[field] !== undefined) {
        updateFields[field] = data[field];
      }
    });

    if (data.primaryBtnUrl && !data.linkUrl) {
      updateFields.linkUrl = data.primaryBtnUrl;
    }

    await banner.update(updateFields);
    return banner;
  },

  async updateBannerStatus(id, isActive) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw AppError.notFound('Banner not found');
    }

    await banner.update({ isActive });
    return banner;
  },

  async reorderBanners(items = []) {
    // items: [{ id, displayOrder }]
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('Items array is required for reordering');
    }

    await sequelize.transaction(async (t) => {
      for (const item of items) {
        if (item.id && typeof item.displayOrder === 'number') {
          await Banner.update(
            { displayOrder: item.displayOrder },
            { where: { id: item.id }, transaction: t }
          );
        }
      }
    });

    return { message: 'Banners reordered successfully' };
  },

  async deleteBanner(id) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw AppError.notFound('Banner not found');
    }

    await banner.destroy();
    return { message: 'Banner deleted successfully' };
  },
};

export default bannerService;
