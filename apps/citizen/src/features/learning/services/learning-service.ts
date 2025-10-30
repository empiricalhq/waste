import { apiClient } from "@/lib/api/api-client";
import { LearningGuide, QuizQuestion, User } from "@/types";

export const learningService = {
  getLearningGuides: async (): Promise<LearningGuide[]> => {
    return apiClient.get<LearningGuide[]>("/learning-guides");
  },
  getQuizQuestions: async (): Promise<QuizQuestion[]> => {
    return apiClient.get<QuizQuestion[]>("/quiz-questions");
  },
  updateUserProgress: async (score: number): Promise<User> => {
    return apiClient.patch<User, { score: number }>("/users/me/progress", { score });
  },
};
