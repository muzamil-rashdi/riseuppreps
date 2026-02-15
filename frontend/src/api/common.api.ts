import apiClient from './client';
import type { ApiResponse, Subject, Announcement, Notification } from '@/types';

export const commonApi = {
  listSubjects: () =>
    apiClient.get<ApiResponse<Subject[]>>('/subjects'),

  listAnnouncements: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ announcements: Announcement[]; total: number }>>('/announcements', { params }),

  getNotifications: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ notifications: Notification[]; total: number; unreadCount: number }>>('/notifications', { params }),

  markNotificationRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    apiClient.put('/notifications/read-all'),
};
