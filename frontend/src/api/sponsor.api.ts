import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Mark,
  FinancialRecord,
  PerformanceSummary,
  AttendanceSummary,
  FinanceSummary,
  StudentAchievement,
  StudentUpdate,
} from '@/types';

export const sponsorApi = {
  getDashboard: () =>
    apiClient.get<ApiResponse<{
      students: (User & { overallPercentage: number; totalQuizzes: number })[];
      totalStudents: number;
      totalFinanceSpent: number;
      unreadMessages: number;
    }>>('/sponsor/dashboard'),

  listStudents: () =>
    apiClient.get<ApiResponse<User[]>>('/sponsor/students'),

  getStudentDetail: (id: string) =>
    apiClient.get<ApiResponse<{
      student: User;
      performance: PerformanceSummary;
      attendance: AttendanceSummary;
      finance: FinanceSummary;
      recentUpdates: StudentUpdate[];
      recentAchievements: StudentAchievement[];
    }>>(`/sponsor/students/${id}`),

  getStudentMarks: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Mark>>>(`/sponsor/students/${id}/marks`, { params }),

  getStudentAttendance: (id: string) =>
    apiClient.get<ApiResponse<{ records: unknown[]; total: number; summary: AttendanceSummary }>>(`/sponsor/students/${id}/attendance`),

  getStudentFinance: (id: string) =>
    apiClient.get<ApiResponse<{ records: FinancialRecord[]; summary: FinanceSummary }>>(`/sponsor/students/${id}/finance`),
};
