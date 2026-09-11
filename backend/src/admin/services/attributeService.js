import { Op } from 'sequelize';
import { Color, Size, Attribute, AttributeValue, AuditLog } from '../../models/index.js';
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

export const attributeService = {
  // ─── Colors ────────────────────────────────────────────────────────
  async listColors() {
    return await Color.findAll({
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });
  },

  async createColor({ name, hexCode, isActive = true, displayOrder = 0, adminId, ipAddress }) {
    if (!name || !hexCode) {
      throw AppError.badRequest('Color name and hex code are required');
    }

    const color = await Color.create({
      name: name.trim(),
      hexCode: hexCode.trim(),
      isActive: Boolean(isActive),
      displayOrder: parseInt(displayOrder, 10) || 0,
    });

    await AuditLog.create({
      adminId,
      action: 'COLOR_CREATED',
      entity: 'Color',
      entityId: color.id,
      metadata: { name: color.name, hexCode: color.hexCode },
      ipAddress: ipAddress || null,
    });

    return color;
  },

  async updateColor(id, { name, hexCode, isActive, displayOrder, adminId, ipAddress }) {
    const color = await Color.findByPk(id);
    if (!color) throw AppError.notFound('Color not found');

    const updates = {};
    if (name) updates.name = name.trim();
    if (hexCode) updates.hexCode = hexCode.trim();
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (displayOrder !== undefined) updates.displayOrder = parseInt(displayOrder, 10);

    await color.update(updates);

    await AuditLog.create({
      adminId,
      action: 'COLOR_UPDATED',
      entity: 'Color',
      entityId: color.id,
      metadata: updates,
      ipAddress: ipAddress || null,
    });

    return color;
  },

  async deleteColor(id, { adminId, ipAddress }) {
    const color = await Color.findByPk(id);
    if (!color) throw AppError.notFound('Color not found');

    await color.destroy();

    await AuditLog.create({
      adminId,
      action: 'COLOR_DELETED',
      entity: 'Color',
      entityId: id,
      metadata: { name: color.name },
      ipAddress: ipAddress || null,
    });

    return { message: 'Color deleted successfully' };
  },

  // ─── Sizes ─────────────────────────────────────────────────────────
  async listSizes() {
    return await Size.findAll({
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });
  },

  async createSize({ name, code, isActive = true, displayOrder = 0, adminId, ipAddress }) {
    if (!name) {
      throw AppError.badRequest('Size name is required');
    }

    const size = await Size.create({
      name: name.trim(),
      code: code ? code.trim() : null,
      isActive: Boolean(isActive),
      displayOrder: parseInt(displayOrder, 10) || 0,
    });

    await AuditLog.create({
      adminId,
      action: 'SIZE_CREATED',
      entity: 'Size',
      entityId: size.id,
      metadata: { name: size.name },
      ipAddress: ipAddress || null,
    });

    return size;
  },

  async updateSize(id, { name, code, isActive, displayOrder, adminId, ipAddress }) {
    const size = await Size.findByPk(id);
    if (!size) throw AppError.notFound('Size not found');

    const updates = {};
    if (name) updates.name = name.trim();
    if (code !== undefined) updates.code = code ? code.trim() : null;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (displayOrder !== undefined) updates.displayOrder = parseInt(displayOrder, 10);

    await size.update(updates);

    await AuditLog.create({
      adminId,
      action: 'SIZE_UPDATED',
      entity: 'Size',
      entityId: size.id,
      metadata: updates,
      ipAddress: ipAddress || null,
    });

    return size;
  },

  async deleteSize(id, { adminId, ipAddress }) {
    const size = await Size.findByPk(id);
    if (!size) throw AppError.notFound('Size not found');

    await size.destroy();

    await AuditLog.create({
      adminId,
      action: 'SIZE_DELETED',
      entity: 'Size',
      entityId: id,
      metadata: { name: size.name },
      ipAddress: ipAddress || null,
    });

    return { message: 'Size deleted successfully' };
  },

  // ─── Attributes & Values ───────────────────────────────────────────
  async listAttributes() {
    return await Attribute.findAll({
      include: [
        {
          model: AttributeValue,
          as: 'values',
          attributes: ['id', 'value', 'slug', 'isActive'],
        },
      ],
      order: [['name', 'ASC']],
    });
  },

  async createAttribute({ name, slug, isActive = true, values = [], adminId, ipAddress }) {
    if (!name || !name.trim()) throw AppError.badRequest('Attribute name is required');
    const attrSlug = slug ? slugify(slug) : slugify(name);

    const attribute = await Attribute.create({
      name: name.trim(),
      slug: attrSlug,
      isActive: Boolean(isActive),
    });

    if (Array.isArray(values) && values.length > 0) {
      for (const val of values) {
        if (typeof val === 'string' && val.trim()) {
          await AttributeValue.create({
            attributeId: attribute.id,
            value: val.trim(),
            slug: slugify(val.trim()),
            isActive: true,
          });
        } else if (val && val.value) {
          await AttributeValue.create({
            attributeId: attribute.id,
            value: val.value.trim(),
            slug: val.slug ? slugify(val.slug) : slugify(val.value.trim()),
            isActive: val.isActive !== undefined ? Boolean(val.isActive) : true,
          });
        }
      }
    }

    await AuditLog.create({
      adminId,
      action: 'ATTRIBUTE_CREATED',
      entity: 'Attribute',
      entityId: attribute.id,
      metadata: { name: attribute.name },
      ipAddress: ipAddress || null,
    });

    return await Attribute.findByPk(attribute.id, {
      include: [{ model: AttributeValue, as: 'values' }],
    });
  },

  async addAttributeValue(attributeId, { value, slug, isActive = true, adminId, ipAddress }) {
    if (!value || !value.trim()) throw AppError.badRequest('Value is required');
    const attribute = await Attribute.findByPk(attributeId);
    if (!attribute) throw AppError.notFound('Attribute not found');

    const valSlug = slug ? slugify(slug) : slugify(value);
    const attrValue = await AttributeValue.create({
      attributeId,
      value: value.trim(),
      slug: valSlug,
      isActive: Boolean(isActive),
    });

    return attrValue;
  },

  async bulkCreateColors({ items = [], adminId, ipAddress }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('Items array is required for bulk color creation');
    }

    const createdColors = [];
    for (const item of items) {
      if (!item.name || !item.hexCode) continue;
      const [color] = await Color.findOrCreate({
        where: { name: item.name.trim() },
        defaults: {
          name: item.name.trim(),
          hexCode: item.hexCode.trim(),
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          displayOrder: parseInt(item.displayOrder, 10) || 0,
        },
      });
      createdColors.push(color);
    }

    await AuditLog.create({
      adminId,
      action: 'COLORS_BULK_CREATED',
      entity: 'Color',
      metadata: { count: createdColors.length },
      ipAddress: ipAddress || null,
    });

    return await this.listColors();
  },

  async bulkCreateSizes({ items = [], adminId, ipAddress }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('Items array is required for bulk size creation');
    }

    const createdSizes = [];
    for (const item of items) {
      if (!item.name) continue;
      const [size] = await Size.findOrCreate({
        where: { name: item.name.trim() },
        defaults: {
          name: item.name.trim(),
          code: item.code ? item.code.trim() : null,
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          displayOrder: parseInt(item.displayOrder, 10) || 0,
        },
      });
      createdSizes.push(size);
    }

    await AuditLog.create({
      adminId,
      action: 'SIZES_BULK_CREATED',
      entity: 'Size',
      metadata: { count: createdSizes.length },
      ipAddress: ipAddress || null,
    });

    return await this.listSizes();
  },

  async deleteAttribute(id, { adminId, ipAddress }) {
    const attribute = await Attribute.findByPk(id);
    if (!attribute) throw AppError.notFound('Attribute not found');

    await AttributeValue.destroy({ where: { attributeId: id } });
    await attribute.destroy();

    await AuditLog.create({
      adminId,
      action: 'ATTRIBUTE_DELETED',
      entity: 'Attribute',
      entityId: id,
      metadata: { name: attribute.name },
      ipAddress: ipAddress || null,
    });

    return { message: 'Attribute deleted successfully' };
  },

  async deleteAttributeValue(attributeId, valueId, { adminId, ipAddress }) {
    const attrValue = await AttributeValue.findOne({
      where: { id: valueId, attributeId },
    });
    if (!attrValue) throw AppError.notFound('Attribute value not found');

    await attrValue.destroy();

    await AuditLog.create({
      adminId,
      action: 'ATTRIBUTE_VALUE_DELETED',
      entity: 'AttributeValue',
      entityId: valueId,
      metadata: { value: attrValue.value },
      ipAddress: ipAddress || null,
    });

    return { message: 'Attribute value deleted successfully' };
  },

  async bulkDeleteColors({ ids = [], all = false, adminId, ipAddress }) {
    let targetIds = [];
    if (all) {
      const allColors = await Color.findAll({ attributes: ['id'] });
      targetIds = allColors.map((c) => c.id);
    } else if (Array.isArray(ids) && ids.length > 0) {
      targetIds = ids;
    } else {
      throw AppError.badRequest('Must provide color IDs or set all: true');
    }

    if (targetIds.length === 0) return { message: 'No colors to delete', count: 0 };

    const count = await Color.destroy({ where: { id: { [Op.in]: targetIds } } });

    AuditLog.create({
      adminId,
      action: 'COLORS_BULK_DELETED',
      entity: 'Color',
      metadata: { count, all },
      ipAddress: ipAddress || null,
    }).catch(() => {});

    return { message: `Successfully deleted ${count} color(s)`, count };
  },

  async bulkDeleteSizes({ ids = [], all = false, adminId, ipAddress }) {
    let targetIds = [];
    if (all) {
      const allSizes = await Size.findAll({ attributes: ['id'] });
      targetIds = allSizes.map((s) => s.id);
    } else if (Array.isArray(ids) && ids.length > 0) {
      targetIds = ids;
    } else {
      throw AppError.badRequest('Must provide size IDs or set all: true');
    }

    if (targetIds.length === 0) return { message: 'No sizes to delete', count: 0 };

    const count = await Size.destroy({ where: { id: { [Op.in]: targetIds } } });

    AuditLog.create({
      adminId,
      action: 'SIZES_BULK_DELETED',
      entity: 'Size',
      metadata: { count, all },
      ipAddress: ipAddress || null,
    }).catch(() => {});

    return { message: `Successfully deleted ${count} size(s)`, count };
  },

  async bulkDeleteAttributes({ ids = [], all = false, adminId, ipAddress }) {
    let targetIds = [];
    if (all) {
      const allAttrs = await Attribute.findAll({ attributes: ['id'] });
      targetIds = allAttrs.map((a) => a.id);
    } else if (Array.isArray(ids) && ids.length > 0) {
      targetIds = ids;
    } else {
      throw AppError.badRequest('Must provide attribute IDs or set all: true');
    }

    if (targetIds.length === 0) return { message: 'No attributes to delete', count: 0 };

    await AttributeValue.destroy({ where: { attributeId: { [Op.in]: targetIds } } });
    const count = await Attribute.destroy({ where: { id: { [Op.in]: targetIds } } });

    AuditLog.create({
      adminId,
      action: 'ATTRIBUTES_BULK_DELETED',
      entity: 'Attribute',
      metadata: { count, all },
      ipAddress: ipAddress || null,
    }).catch(() => {});

    return { message: `Successfully deleted ${count} attribute(s)`, count };
  },
};

export default attributeService;
