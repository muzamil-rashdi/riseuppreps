import apiClient from './client';
import type { User, ApiResponse } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', { email, password }),

  register: (token: string, data: { firstName: string; lastName: string; password: string; phone?: string }) =>
    apiClient.post<ApiResponse<{ user: User; accessToken: string }>>(`/auth/register/${token}`, data),

  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

  logout: () =>
    apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password }),
};
