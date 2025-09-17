import { zValidator } from '@hono/zod-validator';
import type { z } from 'zod';

export const validateJson = <T extends z.ZodType>(schema: T) => zValidator('json', schema);
export const validateParam = <T extends z.ZodType>(schema: T) => zValidator('param', schema);
