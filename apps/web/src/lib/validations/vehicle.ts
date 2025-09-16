import { z } from 'zod';

export const vehicleSchema = z.object({
  license_plate: z
    .string()
    .min(1, 'La placa es requerida')
    .max(10, 'La placa es demasiado larga')
    .regex(/^[A-Z0-9-]+$/, 'La placa solo puede contener letras mayúsculas, números y guiones'),

  model: z.string().max(50, 'El modelo es demasiado largo').optional(),

  year: z
    .number()
    .int('El año debe ser un número entero')
    .min(1950, 'Año mínimo: 1950')
    .max(new Date().getFullYear() + 1, 'El año no puede ser futuro')
    .optional(),

  capacity: z.number().positive('La capacidad debe ser positiva').max(50_000, 'Capacidad máxima: 50,000 kg').optional(),

  assignedDriverId: z.string().uuid('ID de conductor inválido').optional(),
});

export const vehicleUpdateSchema = vehicleSchema.partial();

export type VehicleFormData = z.infer<typeof vehicleSchema>;
export type VehicleUpdateData = z.infer<typeof vehicleUpdateSchema>;
