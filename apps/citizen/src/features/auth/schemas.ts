import { z } from 'zod';

// Validation constants
const MIN_PASSWORD_LENGTH = 8;
const MIN_SIGNIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

export const loginSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido').min(1, 'El correo electrónico es obligatorio'),
  password: z
    .string()
    .min(MIN_SIGNIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_SIGNIN_PASSWORD_LENGTH} caracteres`),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const signUpSchema = z.object({
  name: z.string().min(MIN_NAME_LENGTH, `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`),
  email: z.string().email('Formato de correo electrónico inválido'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener una mayúscula, una minúscula y un número'),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
