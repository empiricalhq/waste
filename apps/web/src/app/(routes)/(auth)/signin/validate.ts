import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 6;

export const SignInSchema = z.object({
  email: z.email({ message: 'Email is required' }),
  password: z.string().min(MIN_PASSWORD_LENGTH, { message: 'Contraseña de al menos 6 caracteres' }),
});

export type SignInValues = z.infer<typeof SignInSchema>;
