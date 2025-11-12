import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const reportSchema = z.object({
  type: z.string().min(1, "Selecciona un tipo de reporte"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  imageUri: z.url().optional(),
});

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return (
    !(Number.isNaN(lat) || Number.isNaN(lng)) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
