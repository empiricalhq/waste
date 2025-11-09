import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@/lib/utils/error-handler';
import { authService } from '../services/auth-service';

export const useSignUp = () => {
  const queryClient = useQueryClient();

  const {
    mutate: signUp,
    isPending,
    error,
  } = useMutation({
    mutationFn: authService.signUp,
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);
    },
    onError: (err) => handleApiError(err),
  });

  return { signUp, isPending, error };
};
