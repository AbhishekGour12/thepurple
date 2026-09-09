import { meiliService } from '../services/meiliService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const testSearchWithIntent = asyncHandler(async (req, res) => {
  const { q = 'gold chain', limit = 10, offset = 0 } = req.query;

  const results = await meiliService.searchWithIntent(q, {
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  });

  return ApiResponse.success(
    res,
    results,
    `Search results and intent matches for '${q}'`
  );
});

export const setupSearchIndex = asyncHandler(async (req, res) => {
  const configured = await meiliService.configureProductIndex();
  return ApiResponse.success(
    res,
    { configured },
    configured ? 'Product search index configured' : 'Product search index configuration failed'
  );
});

export default { testSearchWithIntent, setupSearchIndex };
