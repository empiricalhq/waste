import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@/lib/utils/error-handler';
import { authService } from '../services/auth-service';

export const useLogin = () => {
  const queryClient = useQueryClient();

  const {
    mutate: login,
    isPending,
    error,
  } = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);
    },
    onError: (err) => handleApiError(err),
  });

  return { login, isPending, error };
};
