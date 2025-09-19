import { z } from 'zod';
import { CommonSchemas } from '@/internal/shared/utils/validation';

export const WaypointSchema = z.object({
  ...CommonSchemas.location.shape,
  sequence_order: z.number().int().min(1),
});

export const CreateRouteSchema = z.object({
  name: CommonSchemas.name,
  description: CommonSchemas.description,
  start_lat: z.number().min(-90).max(90),
  start_lng: z.number().min(-180).max(180),
  estimated_duration_minutes: z.number().int().positive().max(1440),
  waypoints: z.array(WaypointSchema).min(1).max(50),
});
