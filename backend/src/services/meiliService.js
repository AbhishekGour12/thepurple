import { getMeiliClient, INDEX_NAMES, checkMeiliHealth } from '../config/meilisearch.js';
import logger from '../config/logger.js';

export class MeiliService {
  constructor() {
    this.client = null;
  }

  getClient() {
    if (!this.client) {
      this.client = getMeiliClient();
    }
    return this.client;
  }

  async getProductsIndex() {
    const client = this.getClient();
    return client.index(INDEX_NAMES.PRODUCTS);
  }

  /**
   * Configures Meilisearch schema, searchable, filterable, and sortable fields
   */
  async configureProductIndex() {
    try {
      const client = this.getClient();
      // Ensure index exists
      try {
        await client.getIndex(INDEX_NAMES.PRODUCTS);
      } catch {
        await client.createIndex(INDEX_NAMES.PRODUCTS, { primaryKey: 'id' });
      }

      const index = client.index(INDEX_NAMES.PRODUCTS);

      // Configure Searchable Attributes (ordered by priority)
      await index.updateSearchableAttributes([
        'name',
        'tags',
        'subcategory',
        'category',
        'sku',
        'shortDescription',
        'description',
      ]);

      // Configure Filterable Attributes
      await index.updateFilterableAttributes([
        'category',
        'subcategory',
        'price',
        'salePrice',
        'isActive',
        'tags',
        'rating',
        'isFeatured',
        'isBestSeller',
      ]);

      // Configure Sortable Attributes
      await index.updateSortableAttributes([
        'salePrice',
        'rating',
        'createdAt',
        'reviewCount',
      ]);

      logger.info(`Meilisearch index [${INDEX_NAMES.PRODUCTS}] configured successfully`);
      return true;
    } catch (err) {
      logger.warn(`Failed to configure Meilisearch product index: ${err.message}`);
      return false;
    }
  }

  /**
   * Indexes an array of product documents
   */
  async indexProducts(products) {
    try {
      const index = await this.getProductsIndex();
      const task = await index.addDocuments(products);
      logger.info(`Meilisearch indexed ${products.length} products (Task ID: ${task.taskUid})`);
      return task;
    } catch (err) {
      logger.error(`Error indexing products into Meilisearch: ${err.message}`);
      throw err;
    }
  }

  /**
   * Searches products with search intent & related products discovery
   * Section 11: "Search Intent / Related Products"
   */
  async searchWithIntent(query, options = {}) {
    const { limit = 10, offset = 0, filter } = options;
    const client = this.getClient();
    const index = client.index(INDEX_NAMES.PRODUCTS);

    try {
      // 1. Direct search match
      const primaryResults = await index.search(query, {
        limit,
        offset,
        filter: filter || 'isActive = true',
      });

      // 2. Search Intent & Related Terms discovery
      // Identify key semantic tokens (e.g. from "gold chain" -> tokens "gold", "chain")
      const tokens = query.trim().split(/\s+/).filter((t) => t.length > 2);
      let relatedProducts = [];

      if (tokens.length > 0) {
        // Query alternatives matching any individual token or category/tag
        const alternateQuery = tokens.join(' OR ');
        const relatedResults = await index.search(alternateQuery, {
          limit: 6,
          filter: filter ? `${filter} AND isActive = true` : 'isActive = true',
        });

        // Filter out primary hits to yield genuine "related" items
        const primaryIds = new Set(primaryResults.hits.map((h) => h.id));
        relatedProducts = relatedResults.hits.filter((item) => !primaryIds.has(item.id));
      }

      return {
        query,
        totalHits: primaryResults.estimatedTotalHits || primaryResults.hits.length,
        hits: primaryResults.hits,
        relatedProducts,
        intent: {
          analyzedTokens: tokens,
          hasRelatedMatches: relatedProducts.length > 0,
        },
      };
    } catch (err) {
      logger.warn(`Meilisearch search error: ${err.message}`);
      return {
        query,
        totalHits: 0,
        hits: [],
        relatedProducts: [],
        intent: { analyzedTokens: [], hasRelatedMatches: false },
        fallbackError: err.message,
      };
    }
  }

  async healthCheck() {
    return await checkMeiliHealth();
  }
}

export const meiliService = new MeiliService();
export default meiliService;
