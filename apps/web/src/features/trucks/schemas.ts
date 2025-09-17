import { z } from 'zod';

export const truckSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  licensePlate: z
    .string()
    .min(1, 'License plate is required.')
    .max(10)
    .regex(/^[A-Z0-9-]+$/, 'Plate must be uppercase letters, numbers, and hyphens.'),
});
export type TruckSchema = z.infer<typeof truckSchema>;
