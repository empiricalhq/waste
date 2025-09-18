import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const CommonSchemas = {
  id: z.union([z.uuid(), z.string().regex(/^[a-zA-Z0-9]{20,40}$/, 'Invalid ID format')]),

  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),

  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),

  pagination: z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }),

  timestamp: z.iso.datetime(),
} as const;

export const validateJson = <T extends z.ZodType>(schema: T) => zValidator('json', schema);
export const validateParam = <T extends z.ZodType>(schema: T) => zValidator('param', schema);
export const validateQuery = <T extends z.ZodType>(schema: T) => zValidator('query', schema);
