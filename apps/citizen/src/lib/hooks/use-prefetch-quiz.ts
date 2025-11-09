import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { learningService } from '@/features/learning/services/learning-service';
import { useConnectionType } from './use-connection-type';

/**
 * Hook to prefetch quiz questions on WiFi only
 * This ensures quiz data is available offline without using cellular data
 */
export const usePrefetchQuiz = () => {
  const { isWifi } = useConnectionType();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only prefetch on WiFi
    if (isWifi) {
      queryClient.prefetchQuery({
        queryKey: ['quizQuestions'],
        queryFn: learningService.getQuizQuestions,
        staleTime: Number.POSITIVE_INFINITY, // Never consider stale
      });
    }
  }, [isWifi, queryClient]);
};
