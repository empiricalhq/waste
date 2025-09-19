import { z } from 'zod';

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_TYPE_LENGTH = 100;

export const createIssueSchema = z.object({
  type: z.string().min(1, 'El tipo de incidencia es obligatorio.').max(MAX_TYPE_LENGTH),
  description: z.string().min(MIN_DESCRIPTION_LENGTH, 'La descripción debe tener al menos 10 caracteres.'),
  lat: z.coerce.number().min(MIN_LATITUDE).max(MAX_LATITUDE),
  lng: z.coerce.number().min(MIN_LONGITUDE).max(MAX_LONGITUDE),
});

export type CreateIssueSchema = z.infer<typeof createIssueSchema>;
