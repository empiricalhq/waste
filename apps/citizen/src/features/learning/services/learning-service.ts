import { learningGuides } from "@/data/learning-guides";
import { quizQuestions } from "@/data/quiz-questions";
import { apiClient } from "@/lib/api/api-client";
import type { LearningGuide, QuizQuestion, User } from "@/types";

export const learningService = {
  getLearningGuides: (): Promise<LearningGuide[]> => {
    return Promise.resolve(learningGuides);
  },
  getQuizQuestions: (): Promise<QuizQuestion[]> => {
    return Promise.resolve(quizQuestions);
  },
  updateUserProgress: (score: number): Promise<User> => {
    return apiClient.patch<User, { score: number }>("/users/me/progress", {
      score,
    });
  },
};
