// Core domain types
export interface Truck {
  id: string;
  name: string;
  licensePlate: string;
  lat: number;
  lng: number;
  lastUpdate: string;
}

export interface TruckStatus {
  status: 'active' | 'idle' | 'not_scheduled';
  message?: string;
  etaMinutes?: number;
  truckId?: string;
}

export interface QuizQuestion {
  id: string;
  item: string;
  imageUrl: string;
  options: WasteType[];
  correctAnswer: WasteType;
}

export interface QuizProgress {
  streak: number;
  totalAnswered: number;
  correctAnswers: number;
  lastPlayed: string | null;
}

export interface Report {
  id: string;
  type: 'missed_collection' | 'illegal_dumping' | 'other';
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type WasteType = 'general' | 'recycling' | 'organic' | 'hazardous';

// API types
export interface ApiError {
  message: string;
  code?: string;
}

export interface CreateReportInput {
  type: Report['type'];
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
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

// UI types
export interface LocationCoords {
  latitude: number;
  longitude: number;
}
