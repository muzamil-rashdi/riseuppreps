import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Message, Conversation } from '@/types';

export const messageApi = {
  getConversations: () =>
    apiClient.get<ApiResponse<Conversation[]>>('/messages'),

  getMessagesWith: (userId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Message>>>(`/messages/${userId}`, { params }),

  send: (data: { receiverId: string; subject: string; body: string }) =>
    apiClient.post<ApiResponse<Message>>('/messages', data),

  markAsRead: (id: string) =>
    apiClient.put(`/messages/${id}/read`),
};
