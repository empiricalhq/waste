import { z } from 'zod';
import { DISALLOWED_USERNAMES } from '@/lib/constants';

export const signInSchema = z.object({
  email: z.string().email('Invalid email format.').min(1, 'Email is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});
export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Invalid email format.'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters.')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores.')
      .refine(
        (username) => !DISALLOWED_USERNAMES.some((pattern) => username.toLowerCase().includes(pattern)),
        'This username is not allowed.',
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain an uppercase, lowercase, and number.'),
    confirmPassword: z.string(),
    gender: z.enum(['male', 'female'], { required_error: 'Please select a gender.' }),
    role: z.enum(['admin', 'supervisor', 'driver'], { required_error: 'Please select a role.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });
export type SignUpSchema = z.infer<typeof signUpSchema>;
