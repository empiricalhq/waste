import { z } from 'zod';

export const routeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.').max(100),
  description: z.string().max(500).optional(),
});
export type RouteSchema = z.infer<typeof routeSchema>;
