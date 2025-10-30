import { WasteType as WasteTypeCode } from "@/constants/wasteTypes";

export type WasteType = WasteTypeCode;

export type Truck = {
  id: string;
  type: WasteType;
  latitude: number;
  longitude: number;
  eta: number;
  route: string;
  status: "active" | "idle" | "completed";
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
  location: string;
  imageUri?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
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

export type UserProgress = {
  streak: number;
  lastQuizDate: string | null;
  correctAnswers: number;
  totalQuestions: number;
};

export type UserSettings = {
  notificationsEnabled: boolean;
};

export type User = {
  id: number;
  progress: UserProgress;
  settings: UserSettings;
};
