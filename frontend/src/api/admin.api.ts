import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Invitation,
  SponsorStudent,
  Subject,
  FinancialRecord,
  Announcement,
  DashboardStats,
  FinanceSummary,
  Role,
} from '@/types';

export const adminApi = {
  // Dashboard
  getDashboard: () =>
    apiClient.get<ApiResponse<{ stats: DashboardStats; recentMarks: unknown[]; recentFinancial: unknown[] }>>('/admin/dashboard'),

  // Users
  listUsers: (params?: { page?: number; limit?: number; role?: Role }) =>
    apiClient.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params }),

  updateUser: (id: string, data: Partial<User>) =>
    apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data),

  deactivateUser: (id: string) =>
    apiClient.delete(`/admin/users/${id}`),

  // Invitations
  sendInvitation: (data: { email: string; role: Role }) =>
    apiClient.post<ApiResponse<Invitation>>('/admin/invitations', data),

  listInvitations: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Invitation>>>('/admin/invitations', { params }),

  // Assignments
  createAssignment: (data: { sponsorId: string; studentId: string }) =>
    apiClient.post<ApiResponse<SponsorStudent>>('/admin/assignments', data),

  removeAssignment: (id: string) =>
    apiClient.delete(`/admin/assignments/${id}`),

  listAssignments: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<SponsorStudent>>>('/admin/assignments', { params }),

  // Subjects
  createSubject: (data: { name: string; description?: string }) =>
    apiClient.post<ApiResponse<Subject>>('/admin/subjects', data),

  updateSubject: (id: string, data: { name: string; description?: string }) =>
    apiClient.put<ApiResponse<Subject>>(`/admin/subjects/${id}`, data),

  deactivateSubject: (id: string) =>
    apiClient.delete(`/admin/subjects/${id}`),

  // Finance
  createFinancialRecord: (data: FormData) =>
    apiClient.post<ApiResponse<FinancialRecord>>('/admin/finance', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateFinancialRecord: (id: string, data: Partial<FinancialRecord>) =>
    apiClient.put<ApiResponse<FinancialRecord>>(`/admin/finance/${id}`, data),

  deleteFinancialRecord: (id: string) =>
    apiClient.delete(`/admin/finance/${id}`),

  listFinancialRecords: (params?: { page?: number; limit?: number; studentId?: string; sponsorId?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<FinancialRecord>>>('/admin/finance', { params }),

  getStudentFinance: (studentId: string) =>
    apiClient.get<ApiResponse<{ records: FinancialRecord[]; summary: FinanceSummary }>>(`/admin/finance/student/${studentId}`),

  getFinancialSummary: () =>
    apiClient.get<ApiResponse<FinanceSummary & { sponsorBreakdown: { sponsorId: string; sponsorName: string; total: number; count: number }[]; monthlyDonations: { month: string; total: number }[] }>>('/admin/finance/summary'),

  getSponsorStudents: (sponsorId: string) =>
    apiClient.get<ApiResponse<Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[]>>(`/admin/sponsors/${sponsorId}/students`),

  // Announcements
  createAnnouncement: (data: { title: string; body: string }) =>
    apiClient.post<ApiResponse<Announcement>>('/admin/announcements', data),

  updateAnnouncement: (id: string, data: { title: string; body: string }) =>
    apiClient.put<ApiResponse<Announcement>>(`/admin/announcements/${id}`, data),

  deleteAnnouncement: (id: string) =>
    apiClient.delete(`/admin/announcements/${id}`),

  // Teacher-Subject
  assignTeacherSubject: (data: { teacherId: string; subjectId: string }) =>
    apiClient.post('/admin/teacher-subjects', data),

  removeTeacherSubject: (data: { teacherId: string; subjectId: string }) =>
    apiClient.delete('/admin/teacher-subjects', { data }),

  // Student-Subject
  enrollStudentSubject: (data: { studentId: string; subjectId: string }) =>
    apiClient.post('/admin/student-subjects', data),

  removeStudentSubject: (data: { studentId: string; subjectId: string }) =>
    apiClient.delete('/admin/student-subjects', { data }),

  // Subject members
  getSubjectMembers: (subjectId: string) =>
    apiClient.get<ApiResponse<{ teachers: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[]; students: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[] }>>(`/admin/subjects/${subjectId}/members`),
};
