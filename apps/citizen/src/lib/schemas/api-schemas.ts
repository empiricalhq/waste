import { z } from 'zod';

/**
 * API Response Validation Schemas
 * Using Zod for runtime type safety
 */

// User schema
export const UserProgressSchema = z.object({
  streak: z.number(),
  lastQuizDate: z.string().nullable(),
  correctAnswers: z.number(),
  totalQuestions: z.number(),
});

export const UserSettingsSchema = z.object({
  notificationsEnabled: z.boolean(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  progress: UserProgressSchema,
  settings: UserSettingsSchema,
});

export type User = z.infer<typeof UserSchema>;

// Collection schema
export const CollectionSchema = z.object({
  id: z.string(),
  type: z.enum(['general', 'recycling', 'organic', 'hazardous']),
  date: z.string(),
  time: z.string(),
  completed: z.boolean(),
});

export type Collection = z.infer<typeof CollectionSchema>;

// Truck schema
export const TruckSchema = z.object({
  id: z.string(),
  type: z.enum(['general', 'recycling', 'organic', 'hazardous']),
  eta: z.number(),
  route: z.string(),
});

export type Truck = z.infer<typeof TruckSchema>;

// Report schema
export const ReportSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'in-progress', 'resolved']),
});

export type Report = z.infer<typeof ReportSchema>;

// Auth response schema
export const BetterAuthSessionSchema = z.object({
  id: z.string(),
  token: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  userId: z.string(),
});

export const BetterAuthResponseSchema = z.object({
  user: UserSchema,
  session: BetterAuthSessionSchema,
});

export type BetterAuthResponse = z.infer<typeof BetterAuthResponseSchema>;

/**
 * Validate API response with Zod schema
 * Throws error if validation fails
 */
export function validateApiResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid API response: ${error.errors.map((e) => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Safely validate API response
 * Returns null if validation fails instead of throwing
 */
export function safeValidateApiResponse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
}
