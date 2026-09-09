import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { Category, Subcategory, Product, AuditLog } from '../../models/index.js';
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

export const categoryService = {
  async listCategories({ search, isActive }) {
    const where = {};
    if (search) {
      where.name = { [Op.iLike]: `%${search.trim()}%` };
    }
    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true' || isActive === true;
    }

    const categories = await Category.findAll({
      where,
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name', 'slug', 'description', 'isActive', 'displayOrder'],
        },
      ],
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC'],
        [{ model: Subcategory, as: 'subcategories' }, 'displayOrder', 'ASC'],
        [{ model: Subcategory, as: 'subcategories' }, 'name', 'ASC'],
      ],
    });

    return categories;
  },

  async getCategoryById(id) {
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
        },
      ],
    });

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    return category;
  },

  async createCategory({ name, slug, description, imageUrl, isActive = true, displayOrder = 0, adminId, ipAddress }) {
    if (!name || !name.trim()) {
      throw AppError.badRequest('Category name is required');
    }

    const categorySlug = slug && slug.trim() ? slugify(slug) : slugify(name);

    const existing = await Category.findOne({
      where: {
        [Op.or]: [{ name: name.trim() }, { slug: categorySlug }],
      },
    });

    if (existing) {
      throw AppError.badRequest('A category with this name or slug already exists');
    }

    const category = await Category.create({
      name: name.trim(),
      slug: categorySlug,
      description: description || null,
      imageUrl: imageUrl || null,
      isActive: Boolean(isActive),
      displayOrder: parseInt(displayOrder, 10) || 0,
    });

    await AuditLog.create({
      adminId,
      action: 'CATEGORY_CREATED',
      entity: 'Category',
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
      ipAddress: ipAddress || null,
    });

    return category;
  },

  /**
   * Bulk create categories and subcategories at once (e.g. Jewellery with 10+ subcategories)
   */
  async bulkCreateCategories({ items = [], adminId, ipAddress }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('Items array is required for bulk category creation');
    }

    const createdCategories = [];
    const transaction = await sequelize.transaction();

    try {
      for (const item of items) {
        if (!item.name || !item.name.trim()) continue;

        const catName = item.name.trim();
        let catSlug = item.slug && item.slug.trim() ? slugify(item.slug) : slugify(catName);

        // Find or create category
        let category = await Category.findOne({
          where: {
            [Op.or]: [{ name: catName }, { slug: catSlug }],
          },
          transaction,
        });

        if (!category) {
          category = await Category.create(
            {
              name: catName,
              slug: catSlug,
              description: item.description || null,
              imageUrl: item.imageUrl || null,
              isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
              displayOrder: parseInt(item.displayOrder, 10) || 0,
            },
            { transaction }
          );
        }

        // Create subcategories if provided
        const subList = Array.isArray(item.subcategories) ? item.subcategories : [];
        for (let i = 0; i < subList.length; i++) {
          const subItem = subList[i];
          const subName = typeof subItem === 'string' ? subItem.trim() : subItem.name?.trim();
          if (!subName) continue;

          let subSlug = typeof subItem === 'object' && subItem.slug ? slugify(subItem.slug) : slugify(subName);

          const existingSub = await Subcategory.findOne({
            where: {
              categoryId: category.id,
              [Op.or]: [{ name: subName }, { slug: subSlug }],
            },
            transaction,
          });

          if (!existingSub) {
            await Subcategory.create(
              {
                categoryId: category.id,
                name: subName,
                slug: subSlug,
                description: typeof subItem === 'object' ? subItem.description || null : null,
                imageUrl: typeof subItem === 'object' ? subItem.imageUrl || null : null,
                isActive: true,
                displayOrder: i,
              },
              { transaction }
            );
          }
        }

        createdCategories.push(category);
      }

      await transaction.commit();

      await AuditLog.create({
        adminId,
        action: 'CATEGORIES_BULK_CREATED',
        entity: 'Category',
        metadata: { count: createdCategories.length },
        ipAddress: ipAddress || null,
      });

      return await this.listCategories({});
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async updateCategory(id, { name, slug, description, imageUrl, isActive, displayOrder, adminId, ipAddress }) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    const updates = {};
    if (name) {
      updates.name = name.trim();
      if (!slug) updates.slug = slugify(name);
    }
    if (slug) updates.slug = slugify(slug);
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (displayOrder !== undefined) updates.displayOrder = parseInt(displayOrder, 10);

    if (updates.name || updates.slug) {
      const existing = await Category.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            ...(updates.name ? [{ name: updates.name }] : []),
            ...(updates.slug ? [{ slug: updates.slug }] : []),
          ],
        },
      });
      if (existing) {
        throw AppError.badRequest('Another category with this name or slug already exists');
      }
    }

    await category.update(updates);

    await AuditLog.create({
      adminId,
      action: 'CATEGORY_UPDATED',
      entity: 'Category',
      entityId: category.id,
      metadata: updates,
      ipAddress: ipAddress || null,
    });

    return category;
  },

  async deleteCategory(id, { adminId, ipAddress }) {
    const category = await Category.findByPk(id, {
      include: [{ model: Subcategory, as: 'subcategories' }],
    });

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    if (category.subcategories && category.subcategories.length > 0) {
      throw AppError.badRequest(
        `Cannot delete category "${category.name}" because it contains ${category.subcategories.length} subcategories. Please reassign or delete the subcategories first.`
      );
    }

    await category.destroy();

    await AuditLog.create({
      adminId,
      action: 'CATEGORY_DELETED',
      entity: 'Category',
      entityId: id,
      metadata: { name: category.name },
      ipAddress: ipAddress || null,
    });

    return { message: 'Category deleted successfully' };
  },

  /**
   * Bulk delete categories or delete all categories
   */
  async bulkDeleteCategories({ ids = [], all = false, cascade = true, adminId, ipAddress }) {
    let targetCategories = [];
    if (all) {
      targetCategories = await Category.findAll({ attributes: ['id', 'name'] });
    } else if (Array.isArray(ids) && ids.length > 0) {
      targetCategories = await Category.findAll({
        where: { id: { [Op.in]: ids } },
        attributes: ['id', 'name'],
      });
    } else {
      throw AppError.badRequest('Must provide category IDs or set all: true');
    }

    if (targetCategories.length === 0) {
      return { message: 'No categories to delete', count: 0 };
    }

    const targetIds = targetCategories.map((c) => c.id);

    if (cascade) {
      // Remove subcategories belonging to these categories
      await Subcategory.destroy({
        where: { categoryId: { [Op.in]: targetIds } },
      });
    }

    const count = await Category.destroy({
      where: { id: { [Op.in]: targetIds } },
    });

    AuditLog.create({
      adminId,
      action: 'CATEGORIES_BULK_DELETED',
      entity: 'Category',
      metadata: { count, all },
      ipAddress: ipAddress || null,
    }).catch(() => {});

    return { message: `Successfully deleted ${count} category(ies)`, count };
  },
};

export default categoryService;
