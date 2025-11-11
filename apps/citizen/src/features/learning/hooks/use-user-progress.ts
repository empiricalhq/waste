import { useMutation, useQueryClient } from "@tanstack/react-query";
import { learningService } from "../services/learning-service";

export const useUpdateUserProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (score: number) => learningService.updateUserProgress(score),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["currentUser"], updatedUser);
    },
  });
};
