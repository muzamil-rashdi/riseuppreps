import { Request, Response, NextFunction } from 'express';
import { MarksService } from '../services/marks.service';
import { AttendanceService } from '../services/attendance.service';
import { updateProfileSchema, achievementSchema, updatePostSchema, documentUploadSchema } from '../validators/student.validators';
import { sendSuccess } from '../utils/helpers';
import { parsePagination, createPaginatedResponse } from '../utils/pagination';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export class StudentController {
  // Profile
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          studentProfile: true,
        },
      });
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateProfileSchema.parse(req.body);

      const profile = await prisma.studentProfile.upsert({
        where: { userId: req.user!.userId },
        update: {
          ...(input.grade !== undefined && { grade: input.grade }),
          ...(input.dateOfBirth && { dateOfBirth: new Date(input.dateOfBirth) }),
          ...(input.address !== undefined && { address: input.address }),
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(input.goals !== undefined && { goals: input.goals }),
          ...(input.thankYouMessage !== undefined && { thankYouMessage: input.thankYouMessage }),
        },
        create: {
          userId: req.user!.userId,
          ...(input.grade && { grade: input.grade }),
          ...(input.dateOfBirth && { dateOfBirth: new Date(input.dateOfBirth) }),
          ...(input.address && { address: input.address }),
          ...(input.bio && { bio: input.bio }),
          ...(input.goals && { goals: input.goals }),
          ...(input.thankYouMessage && { thankYouMessage: input.thankYouMessage }),
        },
      });

      // Handle avatar upload
      if (req.file) {
        await prisma.user.update({
          where: { id: req.user!.userId },
          data: { avatarUrl: `/uploads/${req.file.filename}` },
        });
      }

      return sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  // Marks
  static async getMarks(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as { page?: string; limit?: string });
      const { marks, total } = await MarksService.getStudentMarks(req.user!.userId, page, limit);
      return sendSuccess(res, createPaginatedResponse(marks, total, { page, limit, skip: (page - 1) * limit }));
    } catch (error) {
      next(error);
    }
  }

  static async getPerformanceSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await MarksService.getStudentPerformanceSummary(req.user!.userId);
      return sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  // Attendance
  static async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const subjectId = req.query.subjectId as string | undefined;
      const data = await AttendanceService.getByStudent(req.user!.userId, subjectId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  // Documents
  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('File is required', 400);

      const input = documentUploadSchema.parse(req.body);

      const doc = await prisma.studentDocument.create({
        data: {
          studentId: req.user!.userId,
          title: input.title,
          description: input.description,
          fileUrl: `/uploads/${req.file.filename}`,
          fileType: req.file.mimetype,
        },
      });

      return sendSuccess(res, doc, 201);
    } catch (error) {
      next(error);
    }
  }

  static async listDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await prisma.studentDocument.findMany({
        where: { studentId: req.user!.userId },
        orderBy: { uploadedAt: 'desc' },
      });
      return sendSuccess(res, docs);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await prisma.studentDocument.findFirst({
        where: { id: req.params.id, studentId: req.user!.userId },
      });

      if (!doc) throw new AppError('Document not found', 404);

      await prisma.studentDocument.delete({ where: { id: req.params.id } });
      return sendSuccess(res, { message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Achievements
  static async createAchievement(req: Request, res: Response, next: NextFunction) {
    try {
      const input = achievementSchema.parse(req.body);
      const achievement = await prisma.studentAchievement.create({
        data: {
          studentId: req.user!.userId,
          title: input.title,
          description: input.description,
          date: new Date(input.date),
        },
      });
      return sendSuccess(res, achievement, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateAchievement(req: Request, res: Response, next: NextFunction) {
    try {
      const input = achievementSchema.partial().parse(req.body);
      const existing = await prisma.studentAchievement.findFirst({
        where: { id: req.params.id, studentId: req.user!.userId },
      });

      if (!existing) throw new AppError('Achievement not found', 404);

      const achievement = await prisma.studentAchievement.update({
        where: { id: req.params.id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.date && { date: new Date(input.date) }),
        },
      });
      return sendSuccess(res, achievement);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAchievement(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.studentAchievement.findFirst({
        where: { id: req.params.id, studentId: req.user!.userId },
      });

      if (!existing) throw new AppError('Achievement not found', 404);

      await prisma.studentAchievement.delete({ where: { id: req.params.id } });
      return sendSuccess(res, { message: 'Achievement deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async listAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const achievements = await prisma.studentAchievement.findMany({
        where: { studentId: req.user!.userId },
        orderBy: { date: 'desc' },
      });
      return sendSuccess(res, achievements);
    } catch (error) {
      next(error);
    }
  }

  // Updates/Blog
  static async createUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updatePostSchema.parse(req.body);
      const post = await prisma.studentUpdate.create({
        data: {
          studentId: req.user!.userId,
          title: input.title,
          content: input.content,
        },
      });
      return sendSuccess(res, post, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updatePostSchema.partial().parse(req.body);
      const existing = await prisma.studentUpdate.findFirst({
        where: { id: req.params.id, studentId: req.user!.userId },
      });

      if (!existing) throw new AppError('Post not found', 404);

      const post = await prisma.studentUpdate.update({
        where: { id: req.params.id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.content && { content: input.content }),
        },
      });
      return sendSuccess(res, post);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.studentUpdate.findFirst({
        where: { id: req.params.id, studentId: req.user!.userId },
      });

      if (!existing) throw new AppError('Post not found', 404);

      await prisma.studentUpdate.delete({ where: { id: req.params.id } });
      return sendSuccess(res, { message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async listUpdates(req: Request, res: Response, next: NextFunction) {
    try {
      const updates = await prisma.studentUpdate.findMany({
        where: { studentId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
      });
      return sendSuccess(res, updates);
    } catch (error) {
      next(error);
    }
  }
}
