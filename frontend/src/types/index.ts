export type Role = 'ADMIN' | 'SPONSOR' | 'TEACHER' | 'STUDENT';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type NotificationType = 'MARKS_POSTED' | 'FINANCIAL_UPDATE' | 'ANNOUNCEMENT' | 'MESSAGE' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentProfile?: StudentProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  grade?: string;
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  goals?: string;
  thankYouMessage?: string;
  enrollmentDate: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  token: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
  inviter: { firstName: string; lastName: string };
}

export interface SponsorStudent {
  id: string;
  sponsorId: string;
  studentId: string;
  startDate: string;
  isActive: boolean;
  sponsor: { id: string; firstName: string; lastName: string; email: string };
  student: { id: string; firstName: string; lastName: string; email: string };
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Quiz {
  id: string;
  name: string;
  subjectId: string;
  teacherId: string;
  date: string;
  totalMarks: number;
  description?: string;
  createdAt: string;
  subject: { name: string };
  _count?: { marks: number };
}

export interface Mark {
  id: string;
  quizId: string;
  studentId: string;
  marksObtained: number;
  remarks?: string;
  createdAt: string;
  quiz: Quiz & { teacher: { firstName: string; lastName: string } };
  student?: { id: string; firstName: string; lastName: string };
}

export interface Attendance {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  student?: { id: string; firstName: string; lastName: string };
  subject: { name: string };
}

export interface FinancialRecord {
  id: string;
  studentId: string;
  sponsorId: string;
  amount: number;
  description?: string;
  date: string;
  receiptUrl?: string;
  createdAt: string;
  student: { id: string; firstName: string; lastName: string };
  sponsor: { id: string; firstName: string; lastName: string };
  admin?: { firstName: string; lastName: string };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  receiver?: { firstName: string; lastName: string; role: string };
}

export interface Conversation {
  partner: { id: string; firstName: string; lastName: string; role: string; avatarUrl?: string };
  lastMessage: Message;
  unreadCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  admin: { firstName: string; lastName: string };
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface StudentDocument {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface StudentAchievement {
  id: string;
  title: string;
  description?: string;
  date: string;
  createdAt: string;
}

export interface StudentUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalSponsors: number;
  totalTeachers: number;
  activeAssignments: number;
  totalQuizzes: number;
  totalFinancialAmount: number;
}

export interface PerformanceSummary {
  overallPercentage: number;
  totalQuizzes: number;
  subjectWise: {
    subjectId: string;
    subjectName: string;
    averagePercentage: number;
    totalQuizzes: number;
    totalObtained: number;
    totalMax: number;
  }[];
}

export interface AttendanceSummary {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  attendancePercentage: number;
}

export interface FinanceSummary {
  totalAmount: number;
}
