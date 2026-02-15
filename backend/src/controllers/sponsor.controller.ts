import { Request, Response, NextFunction } from 'express';
import { MarksService } from '../services/marks.service';
import { AttendanceService } from '../services/attendance.service';
import { FinanceService } from '../services/finance.service';
import { sendSuccess } from '../utils/helpers';
import { parsePagination, createPaginatedResponse } from '../utils/pagination';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export class SponsorController {
  // Verify sponsor has access to this student
  private static async verifyAccess(sponsorId: string, studentId: string) {
    const assignment = await prisma.sponsorStudent.findFirst({
      where: { sponsorId, studentId, isActive: true },
    });
    if (!assignment) {
      throw new AppError('You do not have access to this student', 403);
    }
  }

  static async listStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const sponsorStudents = await prisma.sponsorStudent.findMany({
        where: { sponsorId: req.user!.userId, isActive: true },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              studentProfile: { select: { grade: true, bio: true } },
            },
          },
        },
      });

      const students = sponsorStudents.map((ss) => ss.student);
      return sendSuccess(res, students);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentDetail(req: Request, res: Response, next: NextFunction) {
    try {
      await SponsorController.verifyAccess(req.user!.userId, req.params.id);

      const student = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          studentProfile: true,
        },
      });

      if (!student) throw new AppError('Student not found', 404);

      const performance = await MarksService.getStudentPerformanceSummary(req.params.id);
      const attendance = await AttendanceService.getByStudent(req.params.id);
      const finance = await FinanceService.getStudentFinance(req.params.id, req.user!.userId);

      // Get student updates and achievements
      const updates = await prisma.studentUpdate.findMany({
        where: { studentId: req.params.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const achievements = await prisma.studentAchievement.findMany({
        where: { studentId: req.params.id },
        orderBy: { date: 'desc' },
        take: 5,
      });

      return sendSuccess(res, {
        student,
        performance,
        attendance: attendance.summary,
        finance: finance.summary,
        recentUpdates: updates,
        recentAchievements: achievements,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentMarks(req: Request, res: Response, next: NextFunction) {
    try {
      await SponsorController.verifyAccess(req.user!.userId, req.params.id);
      const { page, limit } = parsePagination(req.query as { page?: string; limit?: string });
      const { marks, total } = await MarksService.getStudentMarks(req.params.id, page, limit);
      return sendSuccess(res, createPaginatedResponse(marks, total, { page, limit, skip: (page - 1) * limit }));
    } catch (error) {
      next(error);
    }
  }

  static async getStudentAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      await SponsorController.verifyAccess(req.user!.userId, req.params.id);
      const data = await AttendanceService.getByStudent(req.params.id);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentFinance(req: Request, res: Response, next: NextFunction) {
    try {
      await SponsorController.verifyAccess(req.user!.userId, req.params.id);
      const data = await FinanceService.getStudentFinance(req.params.id, req.user!.userId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const sponsorStudents = await prisma.sponsorStudent.findMany({
        where: { sponsorId: req.user!.userId, isActive: true },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              studentProfile: { select: { grade: true } },
            },
          },
        },
      });

      const studentsWithPerformance = await Promise.all(
        sponsorStudents.map(async (ss) => {
          const performance = await MarksService.getStudentPerformanceSummary(ss.studentId);
          return {
            ...ss.student,
            overallPercentage: performance.overallPercentage,
            totalQuizzes: performance.totalQuizzes,
          };
        })
      );

      // Total donations made by this sponsor
      const totalFinance = await prisma.financialRecord.aggregate({
        where: { sponsorId: req.user!.userId },
        _sum: { amount: true },
      });

      // Unread messages
      const unreadMessages = await prisma.message.count({
        where: { receiverId: req.user!.userId, isRead: false },
      });

      return sendSuccess(res, {
        students: studentsWithPerformance,
        totalStudents: sponsorStudents.length,
        totalFinanceSpent: Number(totalFinance._sum.amount || 0),
        unreadMessages,
      });
    } catch (error) {
      next(error);
    }
  }
}
