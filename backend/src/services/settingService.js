import { Setting } from '../models/index.js';
import logger from '../config/logger.js';

export const SETTING_KEYS = {
  MIN_CART_VALUE: 'MIN_CART_VALUE',
};

const DEFAULT_MIN_CART = {
  enabled: true,
  minCartValue: 500,
  presets: [500, 1000, 1500, 2000, 2500],
  message: 'Minimum order amount is ₹{minCartValue}. Please add more items to proceed.',
};

// In-memory cache for ultra-fast checks during cart & checkout requests
let minCartCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds

let isTableVerified = false;
const ensureTableExists = async () => {
  if (isTableVerified) return;
  try {
    await Setting.sync();
    isTableVerified = true;
  } catch (err) {
    logger.warn(`Setting table sync note: ${err.message}`);
  }
};

export const settingService = {
  /**
   * Fetch current global Minimum Cart Value setting
   */
  getMinCartSetting: async () => {
    const now = Date.now();
    if (minCartCache && now - lastCacheTime < CACHE_TTL_MS) {
      return { ...minCartCache };
    }

    try {
      await ensureTableExists();
      let record = await Setting.findByPk(SETTING_KEYS.MIN_CART_VALUE);
      if (!record) {
        // Create initial default setting if not present
        record = await Setting.create({
          key: SETTING_KEYS.MIN_CART_VALUE,
          value: DEFAULT_MIN_CART,
          description: 'Global minimum cart order value restriction and preset values',
        });
      }

      const val = record.value || {};
      const parsed = {
        enabled: val.enabled !== undefined ? Boolean(val.enabled) : true,
        minCartValue: val.minCartValue !== undefined && !isNaN(parseFloat(val.minCartValue))
          ? Math.max(0, parseFloat(val.minCartValue))
          : 500,
        presets: Array.isArray(val.presets) && val.presets.length > 0
          ? val.presets.map((p) => parseFloat(p)).filter((p) => !isNaN(p) && p > 0).sort((a, b) => a - b)
          : [500, 1000, 1500, 2000, 2500],
        message: val.message || DEFAULT_MIN_CART.message,
        updatedAt: record.updatedAt || new Date(),
      };

      minCartCache = parsed;
      lastCacheTime = now;
      return { ...parsed };
    } catch (err) {
      logger.error(`Error reading min cart setting: ${err.message}`);
      return { ...DEFAULT_MIN_CART };
    }
  },

  /**
   * Update Minimum Cart Value setting
   */
  updateMinCartSetting: async ({ enabled, minCartValue, presets, message }) => {
    const existing = await settingService.getMinCartSetting();

    const newEnabled = enabled !== undefined ? Boolean(enabled) : existing.enabled;
    const newMinCartValue = minCartValue !== undefined && !isNaN(parseFloat(minCartValue))
      ? Math.max(0, parseFloat(minCartValue))
      : existing.minCartValue;

    let newPresets = existing.presets;
    if (Array.isArray(presets)) {
      newPresets = Array.from(
        new Set(
          presets
            .map((p) => parseFloat(p))
            .filter((p) => !isNaN(p) && p > 0)
        )
      ).sort((a, b) => a - b);
    }

    const newMessage = message !== undefined ? String(message).trim() : existing.message;

    const updatedValue = {
      enabled: newEnabled,
      minCartValue: newMinCartValue,
      presets: newPresets,
      message: newMessage,
    };

    const [record] = await Setting.upsert({
      key: SETTING_KEYS.MIN_CART_VALUE,
      value: updatedValue,
      description: 'Global minimum cart order value restriction and preset values',
    });

    minCartCache = {
      ...updatedValue,
      updatedAt: record?.updatedAt || new Date(),
    };
    lastCacheTime = Date.now();

    return minCartCache;
  },

  /**
   * Disable / Reset minimum cart requirement to zero
   */
  deleteMinCartSetting: async () => {
    const existing = await settingService.getMinCartSetting();
    const updatedValue = {
      ...existing,
      enabled: false,
      minCartValue: 0,
    };

    await Setting.upsert({
      key: SETTING_KEYS.MIN_CART_VALUE,
      value: updatedValue,
      description: 'Global minimum cart order value restriction and preset values',
    });

    minCartCache = {
      ...updatedValue,
      updatedAt: new Date(),
    };
    lastCacheTime = Date.now();

    return minCartCache;
  },

  /**
   * Add a new preset value
   */
  addPreset: async (amount) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Preset amount must be a positive number');
    }

    const current = await settingService.getMinCartSetting();
    const updatedPresets = Array.from(new Set([...current.presets, parsedAmount])).sort((a, b) => a - b);

    return settingService.updateMinCartSetting({
      presets: updatedPresets,
    });
  },

  /**
   * Remove an existing preset value
   */
  removePreset: async (amount) => {
    const parsedAmount = parseFloat(amount);
    const current = await settingService.getMinCartSetting();
    const updatedPresets = current.presets.filter((p) => Math.abs(p - parsedAmount) > 0.01);

    return settingService.updateMinCartSetting({
      presets: updatedPresets,
    });
  },
};

export default settingService;
