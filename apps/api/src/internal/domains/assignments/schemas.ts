import { z } from 'zod';
import { CommonSchemas } from '@/internal/shared/utils/validation';

export const CreateAssignmentSchema = z.object({
  route_id: CommonSchemas.id,
  truck_id: CommonSchemas.id,
  driver_id: CommonSchemas.id,
  scheduled_start_time: CommonSchemas.timestamp,
  scheduled_end_time: CommonSchemas.timestamp,
  notes: CommonSchemas.description,
});
