import { z } from 'zod';

// Validation constants
const MIN_PASSWORD_LENGTH = 8;
const MIN_SIGNIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

export const signInSchema = z.object({
  email: z.email('Invalid email format.').min(1, 'Email is required.'),
  password: z
    .string()
    .min(MIN_SIGNIN_PASSWORD_LENGTH, `Password must be at least ${MIN_SIGNIN_PASSWORD_LENGTH} characters.`),
});
export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z.string().min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters.`),
    email: z.email('Invalid email format.'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain an uppercase, lowercase, and number.'),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'supervisor', 'driver'], { error: 'Please select a role.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
