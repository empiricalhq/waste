import { learningGuides } from "@/data/learning-guides";
import { quizQuestions } from "@/data/quiz-questions";
import { apiClient } from "@/lib/api/api-client";
import type { LearningGuide, QuizQuestion, User } from "@/types";

export const learningService = {
  getLearningGuides: async (): Promise<LearningGuide[]> => {
    return Promise.resolve(learningGuides);
  },
  getQuizQuestions: async (): Promise<QuizQuestion[]> => {
    return Promise.resolve(quizQuestions);
  },
  updateUserProgress: async (score: number): Promise<User> => {
    return apiClient.patch<User, { score: number }>("/users/me/progress", {
      score,
    });
  },
};
