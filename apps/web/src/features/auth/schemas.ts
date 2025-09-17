import { z } from 'zod';
import { DISALLOWED_USERNAMES } from '@/lib/constants';

// Validation constants
const MIN_PASSWORD_LENGTH = 8;
const MIN_SIGNIN_PASSWORD_LENGTH = 6;
const MIN_USERNAME_LENGTH = 3;
const MIN_NAME_LENGTH = 2;

export const signInSchema = z.object({
  email: z.string().email('Invalid email format.').min(1, 'Email is required.'),
  password: z
    .string()
    .min(MIN_SIGNIN_PASSWORD_LENGTH, `Password must be at least ${MIN_SIGNIN_PASSWORD_LENGTH} characters.`),
});
export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z.string().min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters.`),
    email: z.email('Invalid email format.'),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters.`)
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores.')
      .refine(
        (username) => !DISALLOWED_USERNAMES.some((pattern) => username.toLowerCase().includes(pattern)),
        'This username is not allowed.',
      ),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain an uppercase, lowercase, and number.'),
    confirmPassword: z.string(),
    gender: z.enum(['male', 'female'], { error: 'Please select a gender.' }),
    role: z.enum(['admin', 'supervisor', 'driver'], { error: 'Please select a role.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
