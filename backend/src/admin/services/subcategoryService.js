import { Op } from 'sequelize';
import { Subcategory, Category, Product, AuditLog } from '../../models/index.js';
import AppError from '../../utils/customError.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const subcategoryService = {
  async listSubcategories({ categoryId, search, isActive }) {
    const where = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.name = { [Op.iLike]: `%${search.trim()}%` };
    }
    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true' || isActive === true;
    }

    const subcategories = await Subcategory.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    return subcategories;
  },

  async getSubcategoryById(id) {
    const subcategory = await Subcategory.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
        },
      ],
    });

    if (!subcategory) {
      throw AppError.notFound('Subcategory not found');
    }

    return subcategory;
  },

  async createSubcategory({ categoryId, name, slug, description, imageUrl, isActive = true, displayOrder = 0, adminId, ipAddress }) {
    if (!categoryId || !name || !name.trim()) {
      throw AppError.badRequest('Category ID and subcategory name are required');
    }

    const parentCategory = await Category.findByPk(categoryId);
    if (!parentCategory) {
      throw AppError.badRequest('Selected category does not exist');
    }

    const subcategorySlug = slug && slug.trim() ? slugify(slug) : slugify(name);

    const existing = await Subcategory.findOne({
      where: {
        categoryId,
        [Op.or]: [{ name: name.trim() }, { slug: subcategorySlug }],
      },
    });

    if (existing) {
      throw AppError.badRequest('A subcategory with this name or slug already exists in this category');
    }

    const subcategory = await Subcategory.create({
      categoryId,
      name: name.trim(),
      slug: subcategorySlug,
      description: description || null,
      imageUrl: imageUrl || null,
      isActive: Boolean(isActive),
      displayOrder: parseInt(displayOrder, 10) || 0,
    });

    await AuditLog.create({
      adminId,
      action: 'SUBCATEGORY_CREATED',
      entity: 'Subcategory',
      entityId: subcategory.id,
      metadata: { name: subcategory.name, categoryId },
      ipAddress: ipAddress || null,
    });

    return subcategory;
  },

  async updateSubcategory(id, { categoryId, name, slug, description, imageUrl, isActive, displayOrder, adminId, ipAddress }) {
    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
      throw AppError.notFound('Subcategory not found');
    }

    const updates = {};
    if (categoryId) {
      const parent = await Category.findByPk(categoryId);
      if (!parent) throw AppError.badRequest('Category not found');
      updates.categoryId = categoryId;
    }
    if (name) {
      updates.name = name.trim();
      if (!slug) updates.slug = slugify(name);
    }
    if (slug) updates.slug = slugify(slug);
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (displayOrder !== undefined) updates.displayOrder = parseInt(displayOrder, 10);

    const targetCategoryId = updates.categoryId || subcategory.categoryId;
    if (updates.name || updates.slug) {
      const existing = await Subcategory.findOne({
        where: {
          id: { [Op.ne]: id },
          categoryId: targetCategoryId,
          [Op.or]: [
            ...(updates.name ? [{ name: updates.name }] : []),
            ...(updates.slug ? [{ slug: updates.slug }] : []),
          ],
        },
      });
      if (existing) {
        throw AppError.badRequest('Another subcategory with this name or slug already exists in this category');
      }
    }

    await subcategory.update(updates);

    await AuditLog.create({
      adminId,
      action: 'SUBCATEGORY_UPDATED',
      entity: 'Subcategory',
      entityId: subcategory.id,
      metadata: updates,
      ipAddress: ipAddress || null,
    });

    return subcategory;
  },

  async deleteSubcategory(id, { adminId, ipAddress }) {
    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
      throw AppError.notFound('Subcategory not found');
    }

    const productsCount = await Product.count({
      where: { subcategoryId: id },
    });

    if (productsCount > 0) {
      throw AppError.badRequest(
        `Cannot delete subcategory "${subcategory.name}" because it has ${productsCount} products assigned. Please reassign or delete the products first.`
      );
    }

    await subcategory.destroy();

    await AuditLog.create({
      adminId,
      action: 'SUBCATEGORY_DELETED',
      entity: 'Subcategory',
      entityId: id,
      metadata: { name: subcategory.name },
      ipAddress: ipAddress || null,
    });

    return { message: 'Subcategory deleted successfully' };
  },

  /**
   * Bulk delete subcategories or delete all subcategories
   */
  async bulkDeleteSubcategories({ ids = [], all = false, adminId, ipAddress }) {
    let targetIds = [];
    if (all) {
      const allSubs = await Subcategory.findAll({ attributes: ['id'] });
      targetIds = allSubs.map((s) => s.id);
    } else if (Array.isArray(ids) && ids.length > 0) {
      targetIds = ids;
    } else {
      throw AppError.badRequest('Must provide subcategory IDs or set all: true');
    }

    if (targetIds.length === 0) {
      return { message: 'No subcategories to delete', count: 0 };
    }

    const count = await Subcategory.destroy({
      where: { id: { [Op.in]: targetIds } },
    });

    AuditLog.create({
      adminId,
      action: 'SUBCATEGORIES_BULK_DELETED',
      entity: 'Subcategory',
      metadata: { count, all },
      ipAddress: ipAddress || null,
    }).catch(() => {});

    return { message: `Successfully deleted ${count} subcategory(ies)`, count };
  },
};

export default subcategoryService;
