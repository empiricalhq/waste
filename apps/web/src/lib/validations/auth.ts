import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;
const MIN_USERNAME_LENGTH = 3;

const disallowedUsernamePatterns = [
  'admin',
  'superuser',
  'superadmin',
  'root',
  'system',
  'api',
  'www',
  'mail',
  'ftp',
  'localhost',
  'undefined',
  'null',
];

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .max(255, 'El correo electrónico es demasiado largo'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
    .max(128, 'La contraseña es demasiado larga'),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(MIN_NAME_LENGTH, `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`)
      .max(100, 'El nombre es demasiado largo')
      .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'El nombre solo puede contener letras y espacios'),

    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Formato de correo electrónico inválido')
      .max(255, 'El correo electrónico es demasiado largo'),

    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, `El nombre de usuario debe tener al menos ${MIN_USERNAME_LENGTH} caracteres`)
      .max(30, 'El nombre de usuario es demasiado largo')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Solo se permiten letras, números, guiones y guiones bajos')
      .refine((username) => {
        const lowerUsername = username.toLowerCase();
        return !disallowedUsernamePatterns.some((pattern) => lowerUsername.includes(pattern));
      }, 'El nombre de usuario contiene palabras no permitidas'),

    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
      .max(128, 'La contraseña es demasiado larga')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'La contraseña debe contener al menos una minúscula, una mayúscula y un número',
      ),

    confirmPassword: z.string(),

    gender: z.enum(['male', 'female'], {
      errorMap: () => ({ message: 'Debe seleccionar un género válido' }),
    }),

    role: z.enum(['admin', 'supervisor', 'driver'], {
      errorMap: () => ({ message: 'Debe seleccionar un rol válido' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
