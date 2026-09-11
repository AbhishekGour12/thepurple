import { z } from 'zod';

export const queueTestJobSchema = z.object({
  jobName: z.string().min(1, 'Job name is required').default('test-task'),
  data: z.record(z.any()).optional().default({}),
  priority: z.number().int().min(1).max(5).optional(),
  delayMs: z.number().int().min(0).optional(),
});

export const searchTestQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().int().positive().max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  category: z.string().optional(),
});
