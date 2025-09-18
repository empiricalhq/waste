import { z } from 'zod';
import { CommonSchemas } from '@/internal/shared/utils/validation';

export const CreateCitizenIssueSchema = z.object({
  type: z.enum(['missed_collection', 'illegal_dumping']),
  description: CommonSchemas.description,
  photo_url: z.url().optional(),
  ...CommonSchemas.location.shape,
});

export const CreateDriverIssueSchema = z.object({
  type: z.enum(['mechanical_failure', 'road_blocked', 'truck_full', 'other']),
  notes: CommonSchemas.description,
  ...CommonSchemas.location.shape,
});
