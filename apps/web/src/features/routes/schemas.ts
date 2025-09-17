import { z } from 'zod';

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

export const routeSchema = z.object({
  name: z
    .string()
    .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters.`)
    .max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters.`),
  description: z.string().max(DESCRIPTION_MAX_LENGTH).optional(),
});

export type RouteSchema = z.infer<typeof routeSchema>;
