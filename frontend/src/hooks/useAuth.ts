import { useAuthStore } from '../store/auth';
import * as authApi from '../api/auth';
import { useMutation } from '@tanstack/react-query';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, isLoading, setUser, setTokens, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setTokens(data.access_token);
      setUser(data.user);
    }
  });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    logout();
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: handleLogout
  };
};
