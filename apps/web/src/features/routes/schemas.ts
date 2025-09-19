import { z } from 'zod';

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;
const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;
const MIN_SEQUENCE_ORDER = 1;
const MIN_WAYPOINTS = 1;
const MAX_WAYPOINTS = 50;
const MIN_DURATION_MINUTES = 1;
const MAX_DURATION_MINUTES = 1440; // 24 hours

export const waypointSchema = z.object({
  lat: z.coerce.number().min(MIN_LATITUDE).max(MAX_LATITUDE),
  lng: z.coerce.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE),
  sequence_order: z.coerce.number().int().min(MIN_SEQUENCE_ORDER),
});

export const createRouteSchema = z.object({
  name: z
    .string()
    .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters.`)
    .max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters.`),
  description: z.string().max(DESCRIPTION_MAX_LENGTH).optional(),
  start_lat: z.coerce.number().min(MIN_LATITUDE).max(MAX_LATITUDE),
  start_lng: z.coerce.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE),
  estimated_duration_minutes: z.coerce.number().int().positive().min(MIN_DURATION_MINUTES).max(MAX_DURATION_MINUTES),
  waypoints: z.array(waypointSchema).min(MIN_WAYPOINTS).max(MAX_WAYPOINTS),
});

export type CreateRouteSchema = z.infer<typeof createRouteSchema>;
