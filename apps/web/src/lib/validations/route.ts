import { z } from 'zod';

export const waypointSchema = z.object({
  lat: z.number().min(-90, 'Latitud inválida').max(90, 'Latitud inválida'),

  lng: z.number().min(-180, 'Longitud inválida').max(180, 'Longitud inválida'),

  address: z.string().max(255, 'La dirección es demasiado larga').optional(),

  order: z.number().int('El orden debe ser un número entero').min(0, 'El orden debe ser positivo'),
});

export const routeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es demasiado largo'),

  description: z.string().max(500, 'La descripción es demasiado larga').optional(),

  assignedVehicleId: z.string().uuid('ID de vehículo inválido').optional(),

  assignedDriverId: z.string().uuid('ID de conductor inválido').optional(),

  waypoints: z
    .array(waypointSchema)
    .min(2, 'Se requieren al menos 2 puntos de ruta')
    .max(50, 'Máximo 50 puntos de ruta permitidos'),
});

export const routeUpdateSchema = routeSchema.partial();

export type RouteFormData = z.infer<typeof routeSchema>;
export type RouteUpdateData = z.infer<typeof routeUpdateSchema>;
export type WaypointFormData = z.infer<typeof waypointSchema>;
