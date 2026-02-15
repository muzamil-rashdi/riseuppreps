import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quiz.service';
import { MarksService } from '../services/marks.service';
import { AttendanceService } from '../services/attendance.service';
import { quizSchema, markSchema, attendanceSchema } from '../validators/teacher.validators';
import { sendSuccess } from '../utils/helpers';
import { parsePagination, createPaginatedResponse } from '../utils/pagination';
import { prisma } from '../config/prisma';

export class TeacherController {
  // Students - optionally filter by subjectId
  static async listStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const subjectId = req.query.subjectId as string | undefined;

      const where: any = { role: 'STUDENT' as const, isActive: true };
      if (subjectId) {
        where.enrolledSubjects = { some: { subjectId } };
      }

      const students = await prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          studentProfile: { select: { grade: true } },
        },
        orderBy: { firstName: 'asc' },
      });
      return sendSuccess(res, students);
    } catch (error) {
      next(error);
    }
  }

  // Subjects
  static async listSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherSubjects = await prisma.teacherSubject.findMany({
        where: { teacherId: req.user!.userId },
        include: { subject: true },
      });
      const subjects = teacherSubjects.map((ts) => ts.subject);
      return sendSuccess(res, subjects);
    } catch (error) {
      next(error);
    }
  }

  // Quizzes
  static async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const input = quizSchema.parse(req.body);
      const quiz = await QuizService.create(input, req.user!.userId);
      return sendSuccess(res, quiz, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const input = quizSchema.partial().parse(req.body);
      const quiz = await QuizService.update(req.params.id, input, req.user!.userId);
      return sendSuccess(res, quiz);
    } catch (error) {
      next(error);
    }
  }

  static async listQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as { page?: string; limit?: string });
      const { quizzes, total } = await QuizService.listByTeacher(req.user!.userId, page, limit);
      return sendSuccess(res, createPaginatedResponse(quizzes, total, { page, limit, skip: (page - 1) * limit }));
    } catch (error) {
      next(error);
    }
  }

  static async getQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const quiz = await QuizService.getById(req.params.id);
      return sendSuccess(res, quiz);
    } catch (error) {
      next(error);
    }
  }

  // Marks
  static async createMark(req: Request, res: Response, next: NextFunction) {
    try {
      const input = markSchema.parse(req.body);
      const mark = await MarksService.create(input, req.user!.userId);
      return sendSuccess(res, mark, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateMark(req: Request, res: Response, next: NextFunction) {
    try {
      const input = markSchema.partial().parse(req.body);
      const mark = await MarksService.update(req.params.id, input, req.user!.userId);
      return sendSuccess(res, mark);
    } catch (error) {
      next(error);
    }
  }

  // Attendance
  static async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const input = attendanceSchema.parse(req.body);
      const record = await AttendanceService.mark(input, req.user!.userId);
      return sendSuccess(res, record, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as { page?: string; limit?: string });
      const subjectId = req.query.subjectId as string | undefined;
      const date = req.query.date as string | undefined;
      const { records, total } = await AttendanceService.getByTeacher(req.user!.userId, subjectId, date, page, limit);
      return sendSuccess(res, createPaginatedResponse(records, total, { page, limit, skip: (page - 1) * limit }));
    } catch (error) {
      next(error);
    }
  }
}
