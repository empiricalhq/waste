import { useQuery } from '@tanstack/react-query';
import { learningService } from '../services/learning-service';

export const useQuiz = () => {
  return useQuery({
    queryKey: ['quizQuestions'],
    queryFn: learningService.getQuizQuestions,
    // Quiz questions never go stale - they're educational content
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY, // Keep in cache indefinitely
    // Mark as available offline
    meta: {
      offlineAvailable: true,
    },
  });
};
