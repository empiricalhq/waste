import { z } from 'zod';

export const truckSchema = z.object({
  id: z.string(),
  name: z.string(),
  license_plate: z.string(),
  is_active: z.boolean(),
  created_at: z.iso.datetime(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  location_updated_at: z.iso.datetime().nullable().optional(),
  driver_name: z.string().nullable().optional(),
  assignment_status: z.string().nullable().optional(),
});

export type Truck = z.infer<typeof truckSchema>;

export const routeStatusSchema = z.enum(['active', 'inactive', 'draft']);

export const routeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  status: routeStatusSchema,
  created_by_name: z.string().optional().nullable(),
  waypoint_count: z.number().optional(),
});

export type Route = z.infer<typeof routeSchema>;
