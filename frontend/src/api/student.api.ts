import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Mark,
  StudentDocument,
  StudentAchievement,
  StudentUpdate,
  StudentProfile,
  PerformanceSummary,
  AttendanceSummary,
} from '@/types';

export const studentApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/student/profile'),

  updateProfile: (data: FormData) =>
    apiClient.put<ApiResponse<StudentProfile>>('/student/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMarks: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Mark>>>('/student/marks', { params }),

  getPerformance: () =>
    apiClient.get<ApiResponse<PerformanceSummary>>('/student/performance'),

  getAttendance: (params?: { subjectId?: string }) =>
    apiClient.get<ApiResponse<{ records: unknown[]; total: number; summary: AttendanceSummary }>>('/student/attendance', { params }),

  uploadDocument: (data: FormData) =>
    apiClient.post<ApiResponse<StudentDocument>>('/student/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  listDocuments: () =>
    apiClient.get<ApiResponse<StudentDocument[]>>('/student/documents'),

  deleteDocument: (id: string) =>
    apiClient.delete(`/student/documents/${id}`),

  createAchievement: (data: { title: string; description?: string; date: string }) =>
    apiClient.post<ApiResponse<StudentAchievement>>('/student/achievements', data),

  updateAchievement: (id: string, data: Partial<{ title: string; description: string; date: string }>) =>
    apiClient.put<ApiResponse<StudentAchievement>>(`/student/achievements/${id}`, data),

  deleteAchievement: (id: string) =>
    apiClient.delete(`/student/achievements/${id}`),

  listAchievements: () =>
    apiClient.get<ApiResponse<StudentAchievement[]>>('/student/achievements'),

  createUpdate: (data: { title: string; content: string }) =>
    apiClient.post<ApiResponse<StudentUpdate>>('/student/updates', data),

  updatePost: (id: string, data: Partial<{ title: string; content: string }>) =>
    apiClient.put<ApiResponse<StudentUpdate>>(`/student/updates/${id}`, data),

  deleteUpdate: (id: string) =>
    apiClient.delete(`/student/updates/${id}`),

  listUpdates: () =>
    apiClient.get<ApiResponse<StudentUpdate[]>>('/student/updates'),
};
