import { z } from 'zod';

const MIN_USERNAME_LENGTH = 4;
const MIN_PASSWORD_LENGTH = 6;

export const SignInSchema = z.object({
  username: z.string().min(MIN_USERNAME_LENGTH, { message: 'Username is required' }),
  password: z.string().min(MIN_PASSWORD_LENGTH, { message: 'Contraseña de al menos 6 caracteres' }),
});

export type SignInValues = z.infer<typeof SignInSchema>;
