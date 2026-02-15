import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth.api';

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  token: string;
  data: {
    firstName: string;
    lastName: string;
    password: string;
    phone?: string;
  };
}

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout: storeLogout, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async ({ email, password }: LoginParams) => {
      setIsLoading(true);
      try {
        const response = await authApi.login(email, password);
        const { user: loggedInUser, accessToken } = response.data.data;
        setAuth(loggedInUser, accessToken);
        return loggedInUser;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth],
  );

  const register = useCallback(
    async ({ token, data }: RegisterParams) => {
      setIsLoading(true);
      try {
        const response = await authApi.register(token, data);
        const { user: registeredUser, accessToken } = response.data.data;
        setAuth(registeredUser, accessToken);
        return registeredUser;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Proceed with local logout even if the API call fails
    } finally {
      storeLogout();
      setIsLoading(false);
    }
  }, [storeLogout]);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getMe();
      const freshUser = response.data.data;
      updateUser(freshUser);
      return freshUser;
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshUser,
  };
}
