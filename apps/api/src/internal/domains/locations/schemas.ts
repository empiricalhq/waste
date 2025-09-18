import { z } from 'zod';
import { CommonSchemas } from '@/internal/shared/utils/validation';

export const UpdateLocationSchema = CommonSchemas.location;

export const UpdateDriverLocationSchema = z.object({
  ...CommonSchemas.location.shape,
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
});
