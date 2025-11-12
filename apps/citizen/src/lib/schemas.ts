import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  progress: z.object({
    streak: z.number(),
    lastQuizDate: z.string().nullable(),
    correctAnswers: z.number(),
    totalQuestions: z.number(),
  }),
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

export const ReportSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  status: z.enum(["pending", "in-progress", "resolved"]),
  createdAt: z.string().optional(),
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
export type Report = z.infer<typeof ReportSchema>;
export type ReportType = z.infer<typeof ReportTypeSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
