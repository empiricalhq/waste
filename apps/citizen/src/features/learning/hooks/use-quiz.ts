import { useQuery } from "@tanstack/react-query";
import { learningService } from "../services/learning-service";

export const useQuiz = () => {
  return useQuery({
    queryKey: ["quizQuestions"],
    queryFn: learningService.getQuizQuestions,
  });
};
