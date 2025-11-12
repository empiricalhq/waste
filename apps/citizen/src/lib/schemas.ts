import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  // better-auth user might not have progress, so make it optional
  progress: z
    .object({
      streak: z.number(),
      lastQuizDate: z.string().nullable(),
      correctAnswers: z.number(),
      totalQuestions: z.number(),
    })
    .optional(),
});

export const CollectionSchema = z.object({
  id: z.string(),
  type: z.enum(["general", "recycling", "organic", "hazardous"]),
  date: z.string(),
  time: z.string(),
  completed: z.boolean(),
});

export const TruckSchema = z.object({
  id: z.string(),
  type: z.enum(["general", "recycling", "organic", "hazardous"]),
  eta: z.number(),
  route: z.string(),
});

export const TruckWithLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  license_plate: z.string(),
  lat: z.number(),
  lng: z.number(),
  location_updated_at: z.string(),
  assignment_status: z.string().optional(),
});

// API response format for truck status
export const TruckStatusSchema = z.object({
  status: z.enum(["LOCATION_NOT_SET", "NEARBY", "ON_THE_WAY", "NOT_SCHEDULED"]),
  message: z.string().optional(),
  etaMinutes: z.number().optional(),
  truck: z.string().optional(),
});

export const ReportSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  status: z.enum(["pending", "in-progress", "resolved"]),
  createdAt: z.string().optional(),
});

// API response format for issues
export const IssueSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.enum(["missed_collection", "illegal_dumping"]),
  status: z.enum(["open", "in_progress", "resolved"]),
  description: z.string().optional(),
  photo_url: z.string().url().optional(),
  lat: z.number(),
  lng: z.number(),
  created_at: z.union([z.string(), z.date()]),
});

export const ReportTypeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  item: z.string(),
  question: z.string(),
  imageUrl: z.string(),
  options: z.array(z.enum(["general", "recycling", "organic", "hazardous"])),
  correctAnswer: z.enum(["general", "recycling", "organic", "hazardous"]),
});

export const LoginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const SignUpSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type User = z.infer<typeof UserSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type Truck = z.infer<typeof TruckSchema>;
export type TruckWithLocation = z.infer<typeof TruckWithLocationSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type ReportType = z.infer<typeof ReportTypeSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
