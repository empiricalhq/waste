import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { quizQuestions } from "@/features/quiz/data/quiz-questions";
import { storage } from "@/lib/storage";
import type { QuizProgress } from "@/types";

const QUIZ_PROGRESS_KEY = ["quizProgress"];

/**
 * Manages the state and business logic for the user's quiz progress.
 * This hook is the single source of truth for quiz stats.
 */
export function useQuizProgress() {
    const queryClient = useQueryClient();
    const { show } = useToast();
    // const { isAuthenticated } = useAuth();

    // READ Operation (fetching quiz progress)
    const query = useQuery({
        queryKey: QUIZ_PROGRESS_KEY,
        queryFn: storage.getQuizProgress,
        staleTime: Infinity,
    });

    // WRITE Operation (updating quiz progress after a game)
    const mutation = useMutation({
        mutationFn: async (finalScore: number): Promise<QuizProgress> => {
            const currentProgress = query.data ?? await storage.getQuizProgress();
            const today = new Date().toISOString().split("T")[0];
            const isNewDay = currentProgress.lastPlayed !== today;

            const newProgress: QuizProgress = {
                streak: isNewDay ? currentProgress.streak + 1 : currentProgress.streak,
                totalAnswered: currentProgress.totalAnswered + quizQuestions.length,
                correctAnswers: currentProgress.correctAnswers + finalScore,
                lastPlayed: today,
            };

            await storage.setQuizProgress(newProgress);
            return newProgress;
        },
        onSuccess: (newProgress) => {
            queryClient.setQueryData(QUIZ_PROGRESS_KEY, newProgress);

            const isNewDay = newProgress.streak > (query.data?.streak ?? 0);
            if (isNewDay) {
                show("¡Racha actualizada! 🔥", {
                    type: "success",
                    position: "top",
                });
            }
        },
        onError: (error) => {
            console.error("Failed to save quiz progress:", error);
            show("Error al guardar tu progreso", { type: "error" });
        },
    });

    return {
        progress: query.data,
        isLoadingProgress: query.isLoading,
        updateProgress: mutation.mutateAsync,
        isUpdatingProgress: mutation.isPending,
    };
}
