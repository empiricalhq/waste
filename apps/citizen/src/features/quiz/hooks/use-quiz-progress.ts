import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quizQuestions } from "@/features/quiz/data/quiz-questions";
import { storage } from "@/lib/storage";
import type { QuizProgress } from "@/types";

/**
 * Calculate days between two ISO date strings (YYYY-MM-DD)
 */
function calculateDaysDifference(
  lastPlayed: string | null,
  today: string,
): number {
  if (!lastPlayed) return -1;

  const last = new Date(lastPlayed);
  const current = new Date(today);

  // Reset time to midnight for accurate day comparison
  last.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Manages quiz progress with correct streak logic
 */
export function useQuizProgress() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["quizProgress"],
    queryFn: storage.getQuizProgress,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const mutation = useMutation({
    mutationFn: async (finalScore: number): Promise<QuizProgress> => {
      // Get current progress (from cache or storage)
      const currentProgress =
        queryClient.getQueryData<QuizProgress>(["quizProgress"]) ??
        (await storage.getQuizProgress());

      const today = new Date().toISOString().split("T")[0];
      const daysSinceLastPlayed = calculateDaysDifference(
        currentProgress.lastPlayed,
        today,
      );

      // Calculate new streak
      let newStreak: number;
      if (daysSinceLastPlayed === 0) {
        // Same day - keep streak
        newStreak = currentProgress.streak;
      } else if (daysSinceLastPlayed === 1) {
        // Next day - increment streak
        newStreak = currentProgress.streak + 1;
      } else {
        // Missed days - reset to 1
        newStreak = 1;
      }

      const newProgress: QuizProgress = {
        streak: newStreak,
        totalAnswered: currentProgress.totalAnswered + quizQuestions.length,
        correctAnswers: currentProgress.correctAnswers + finalScore,
        lastPlayed: today,
      };

      await storage.setQuizProgress(newProgress);
      return newProgress;
    },
    onSuccess: (newProgress, finalScore) => {
      queryClient.setQueryData(["quizProgress"], newProgress);
    },
    onError: (error) => {
      console.error("Failed to save quiz progress:", error);
    },
  });

  return {
    progress: query.data,
    isLoadingProgress: query.isLoading,
    updateProgress: mutation.mutateAsync,
    isUpdatingProgress: mutation.isPending,
  };
}
