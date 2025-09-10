import { z } from 'zod';

export const roleSchema = z.enum(['admin', 'supervisor', 'driver', 'citizen']);
export type Role = z.infer<typeof roleSchema>;

export const uuidSchema = z.uuid();
export const uuidParamSchema = z.object({ id: uuidSchema });

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const waypointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  sequence_order: z.number().int().positive(),
});

export const createRouteSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  start_lat: z.number().min(-90).max(90),
  start_lng: z.number().min(-180).max(180),
  estimated_duration_minutes: z.number().int().positive().max(480),
  waypoints: z.array(waypointSchema).min(1).max(50),
});

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const createIssueSchema = z.object({
  type: z.enum(['missed_collection', 'illegal_dumping']),
  description: z.string().max(500).optional(),
  photo_url: z.url().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const updateDriverLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
});

export const createDriverIssueSchema = z.object({
  type: z.enum(['mechanical_failure', 'road_blocked', 'truck_full', 'other']),
  notes: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const createTruckSchema = z.object({
  name: z.string().min(3).max(50),
  license_plate: z.string().min(6).max(10),
});

export const createAssignmentSchema = z.object({
  route_id: uuidSchema,
  truck_id: uuidSchema,
  driver_id: uuidSchema,
  scheduled_start_time: z.iso.datetime(),
  scheduled_end_time: z.iso.datetime(),
  notes: z.string().max(500).optional(),
});
