import { z } from 'zod';

// Validation constants
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;

export const createDriverSchema = z
  .object({
    name: z.string().min(MIN_NAME_LENGTH, `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`),
    email: z.string().email('Formato de correo electrónico inválido'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener una mayúscula, una minúscula y un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type CreateDriverSchema = z.infer<typeof createDriverSchema>;
