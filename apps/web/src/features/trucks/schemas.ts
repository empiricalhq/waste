import { z } from 'zod';

export const truckSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  licensePlate: z
    .string()
    .min(1, 'La placa es obligatoria.')
    .max(10)
    .regex(/^[A-Z0-9-]+$/, 'La placa debe contener letras mayúsculas, números y guiones.'),
});
export type TruckSchema = z.infer<typeof truckSchema>;
