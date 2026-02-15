import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Quiz, Mark, Attendance, Subject, User } from '@/types';

export const teacherApi = {
  listStudents: (params?: { subjectId?: string }) =>
    apiClient.get<ApiResponse<(User & { studentProfile?: { grade: string } })[]>>('/teacher/students', { params }),

  listSubjects: () =>
    apiClient.get<ApiResponse<Subject[]>>('/teacher/subjects'),

  createQuiz: (data: { name: string; subjectId: string; date: string; totalMarks: number; description?: string }) =>
    apiClient.post<ApiResponse<Quiz>>('/teacher/quizzes', data),

  updateQuiz: (id: string, data: Partial<{ name: string; date: string; totalMarks: number; description: string }>) =>
    apiClient.put<ApiResponse<Quiz>>(`/teacher/quizzes/${id}`, data),

  listQuizzes: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Quiz>>>('/teacher/quizzes', { params }),

  getQuiz: (id: string) =>
    apiClient.get<ApiResponse<Quiz & { marks: Mark[] }>>(`/teacher/quizzes/${id}`),

  createMark: (data: { quizId: string; studentId: string; marksObtained: number; remarks?: string }) =>
    apiClient.post<ApiResponse<Mark>>('/teacher/marks', data),

  updateMark: (id: string, data: { marksObtained?: number; remarks?: string }) =>
    apiClient.put<ApiResponse<Mark>>(`/teacher/marks/${id}`, data),

  markAttendance: (data: { studentId: string; subjectId: string; date: string; status: string; remarks?: string }) =>
    apiClient.post<ApiResponse<Attendance>>('/teacher/attendance', data),

  getAttendance: (params?: { page?: number; limit?: number; subjectId?: string; date?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Attendance>>>('/teacher/attendance', { params }),
};
