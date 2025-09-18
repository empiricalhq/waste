import { z } from 'zod';
import { CommonSchemas } from '@/internal/shared/utils/validation';

export const CreateTruckSchema = z.object({
  name: CommonSchemas.name.max(50),
  license_plate: z.string().min(6).max(10),
});
