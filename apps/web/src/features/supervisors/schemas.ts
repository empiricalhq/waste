import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;

export const createSupervisorSchema = z
  .object({
    name: z.string().min(MIN_NAME_LENGTH, `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`),
    email: z.email('Formato de correo electrónico inválido'),
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

export type CreateSupervisorSchema = z.infer<typeof createSupervisorSchema>;

export const updateSupervisorSchema = z
  .object({
    id: z.string(),
    name: z.string().min(MIN_NAME_LENGTH, `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`),
    email: z.email('Formato de correo electrónico inválido'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener una mayúscula, una minúscula y un número')
      .optional()
      .or(z.literal('')),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type UpdateSupervisorSchema = z.infer<typeof updateSupervisorSchema>;
