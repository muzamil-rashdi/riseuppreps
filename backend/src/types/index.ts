import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  role: Role;
  email: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalSponsors: number;
  totalTeachers: number;
  activeAssignments: number;
  totalQuizzes: number;
  totalFinancialAmount: number;
}
