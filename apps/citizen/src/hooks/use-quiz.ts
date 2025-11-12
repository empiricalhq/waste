import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { api } from "@/lib/api";

export function useQuiz() {
  return useQuery({
    queryKey: [QUERY_KEYS.QUIZ],
    queryFn: api.getQuizQuestions,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateProgress,
    onSuccess: (user) => {
      queryClient.setQueryData([QUERY_KEYS.USER], user);
    },
  });
}
