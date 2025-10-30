import { WasteType as WasteTypeCode } from "../constants/waste-types";

export type WasteType = WasteTypeCode;

export type User = {
  id: string;
  name: string;
  email: string;
  progress: UserProgress;
  settings: UserSettings;
};

export type UserProgress = {
  streak: number;
  lastQuizDate: string | null;
  correctAnswers: number;
  totalQuestions: number;
};

export type UserSettings = {
  notificationsEnabled: boolean;
};

export type Truck = {
  id: string;
  type: WasteType;
  eta: number;
  route: string;
};

export type Collection = {
  id: string;
  type: WasteType;
  date: string;
  time: string;
  completed: boolean;
};

export type ReportStatus = "pending" | "in-progress" | "resolved";

export type Report = {
  id: string;
  type: string;
  description: string;
  status: ReportStatus;
};

export type ReportType = {
  id: string;
  label: string;
};

export type LearningGuide = {
  id: string;
  name: string;
  category: WasteType;
  imageUrl: string;
  description: string;
  examples: string[];
};

export type QuizQuestion = {
  id: string;
  item: string;
  question: string;
  imageUrl: string;
  options: WasteType[];
  correctAnswer: WasteType;
};

export type ApiErrorResponse = {
  message: string;
  code?: string;
};
