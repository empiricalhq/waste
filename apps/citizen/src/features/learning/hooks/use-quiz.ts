import { useQuery } from "@tanstack/react-query";
import { learningService } from "../services/learning-service";

export const useQuiz = () => {
  return useQuery({
    queryKey: ["quizQuestions"],
    queryFn: learningService.getQuizQuestions,
    // quiz questions never go stale
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY, // keep in cache indefinitely
    // mark as available offline
    meta: {
      offlineAvailable: true,
    },
  });
};
