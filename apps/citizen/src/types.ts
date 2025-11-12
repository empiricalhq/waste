export interface User {
  id: string;
  name: string;
  email: string;
  progress?: UserProgress;
}

export interface UserProgress {
  streak: number;
  lastQuizDate: string | null;
  correctAnswers: number;
  totalQuestions: number;
}

export type WasteType = 'general' | 'recycling' | 'organic' | 'hazardous';

export interface Collection {
  id: string;
  type: WasteType;
  date: string;
  time: string;
  completed: boolean;
}

export interface Truck {
  id: string;
  type: WasteType;
  eta: number;
  route: string;
}

export interface TruckWithLocation {
  id: string;
  name: string;
  license_plate: string;
  lat: number;
  lng: number;
  location_updated_at: string;
  assignment_status?: string;
}

export type ReportStatus = 'pending' | 'in-progress' | 'resolved';

export interface Report {
  id: string;
  type: string;
  description: string;
  status: ReportStatus;
  createdAt?: string;
}

export interface ReportType {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  item: string;
  question: string;
  imageUrl: string;
  options: WasteType[];
  correctAnswer: WasteType;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface PendingReport {
  id: string;
  data: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    imageUri?: string;
  };
  timestamp: number;
}
