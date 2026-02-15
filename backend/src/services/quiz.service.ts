import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { QuizInput } from '../validators/teacher.validators';

export class QuizService {
  static async create(input: QuizInput, teacherId: string) {
    // Verify teacher has access to this subject
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: { teacherId, subjectId: input.subjectId },
    });

    if (!teacherSubject) {
      throw new AppError('You are not assigned to this subject', 403);
    }

    return prisma.quiz.create({
      data: {
        name: input.name,
        subjectId: input.subjectId,
        teacherId,
        date: new Date(input.date),
        totalMarks: input.totalMarks,
        description: input.description,
      },
      include: {
        subject: { select: { name: true } },
      },
    });
  }

  static async update(quizId: string, input: Partial<QuizInput>, teacherId: string) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    if (quiz.teacherId !== teacherId) {
      throw new AppError('You can only edit your own quizzes', 403);
    }

    return prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.date && { date: new Date(input.date) }),
        ...(input.totalMarks && { totalMarks: input.totalMarks }),
        ...(input.description !== undefined && { description: input.description }),
      },
      include: {
        subject: { select: { name: true } },
      },
    });
  }

  static async listByTeacher(teacherId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where: { teacherId },
        include: {
          subject: { select: { name: true } },
          _count: { select: { marks: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.quiz.count({ where: { teacherId } }),
    ]);

    return { quizzes, total };
  }

  static async getById(quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        subject: { select: { name: true } },
        teacher: { select: { firstName: true, lastName: true } },
        marks: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    return quiz;
  }
}
