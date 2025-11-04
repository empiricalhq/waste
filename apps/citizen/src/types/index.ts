import type { WasteType as WasteTypeCode } from '../constants/waste-types';

export type WasteType = WasteTypeCode;

export interface User {
  id: string;
  name: string;
  email: string;
  progress: UserProgress;
  settings: UserSettings;
}

export interface UserProgress {
  streak: number;
  lastQuizDate: string | null;
  correctAnswers: number;
  totalQuestions: number;
}

export interface UserSettings {
  notificationsEnabled: boolean;
}

export interface Truck {
  id: string;
  type: WasteType;
  eta: number;
  route: string;
}

export interface Collection {
  id: string;
  type: WasteType;
  date: string;
  time: string;
  completed: boolean;
}

export type ReportStatus = 'pending' | 'in-progress' | 'resolved';

export interface Report {
  id: string;
  type: string;
  description: string;
  status: ReportStatus;
}

export interface ReportType {
  id: string;
  label: string;
}

export interface LearningGuide {
  id: string;
  name: string;
  category: WasteType;
  imageUrl: string;
  description: string;
  examples: string[];
}

export interface QuizQuestion {
  id: string;
  item: string;
  question: string;
  imageUrl: string;
  options: WasteType[];
  correctAnswer: WasteType;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
}
