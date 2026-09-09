import { z } from 'zod';

/**
 * Validates request body, query, or params against a Zod schema
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req[source]);
      req[source] = validated;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;
