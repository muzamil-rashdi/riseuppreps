import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { MarkInput } from '../validators/teacher.validators';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';

export class MarksService {
  static async create(input: MarkInput, teacherId: string) {
    // Verify the quiz belongs to this teacher
    const quiz = await prisma.quiz.findUnique({
      where: { id: input.quizId },
      include: { subject: true },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    if (quiz.teacherId !== teacherId) {
      throw new AppError('You can only add marks to your own quizzes', 403);
    }

    if (input.marksObtained > quiz.totalMarks) {
      throw new AppError(`Marks obtained cannot exceed total marks (${quiz.totalMarks})`, 400);
    }

    // Verify the student exists
    const student = await prisma.user.findUnique({
      where: { id: input.studentId },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new AppError('Invalid student ID', 400);
    }

    const mark = await prisma.mark.create({
      data: {
        quizId: input.quizId,
        studentId: input.studentId,
        marksObtained: input.marksObtained,
        remarks: input.remarks,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        quiz: { select: { name: true, totalMarks: true } },
      },
    });

    // Notify sponsors
    const studentName = `${student.firstName} ${student.lastName}`;
    const sponsorIds = await NotificationService.notifySponsorsOfMarks(
      input.studentId,
      studentName,
      quiz.name,
      input.marksObtained,
      quiz.totalMarks
    );

    // Send email notifications to sponsors
    if (sponsorIds.length > 0) {
      const sponsors = await prisma.user.findMany({
        where: { id: { in: sponsorIds } },
        select: { email: true, firstName: true },
      });

      for (const sponsor of sponsors) {
        EmailService.sendMarksNotification(
          sponsor.email,
          sponsor.firstName,
          studentName,
          quiz.name,
          input.marksObtained,
          quiz.totalMarks
        ).catch(console.error);
      }
    }

    return mark;
  }

  static async update(markId: string, input: Partial<MarkInput>, teacherId: string) {
    const mark = await prisma.mark.findUnique({
      where: { id: markId },
      include: { quiz: true },
    });

    if (!mark) {
      throw new AppError('Mark not found', 404);
    }

    if (mark.quiz.teacherId !== teacherId) {
      throw new AppError('You can only edit marks for your own quizzes', 403);
    }

    if (input.marksObtained !== undefined && input.marksObtained > mark.quiz.totalMarks) {
      throw new AppError(`Marks obtained cannot exceed total marks (${mark.quiz.totalMarks})`, 400);
    }

    return prisma.mark.update({
      where: { id: markId },
      data: {
        ...(input.marksObtained !== undefined && { marksObtained: input.marksObtained }),
        ...(input.remarks !== undefined && { remarks: input.remarks }),
      },
    });
  }

  static async getStudentMarks(studentId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [marks, total] = await Promise.all([
      prisma.mark.findMany({
        where: { studentId },
        include: {
          quiz: {
            include: {
              subject: { select: { name: true } },
              teacher: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { quiz: { date: 'desc' } },
        skip,
        take: limit,
      }),
      prisma.mark.count({ where: { studentId } }),
    ]);

    return { marks, total };
  }

  static async getStudentPerformanceSummary(studentId: string) {
    const marks = await prisma.mark.findMany({
      where: { studentId },
      include: {
        quiz: {
          include: { subject: { select: { id: true, name: true } } },
        },
      },
    });

    // Group by subject
    const subjectMap = new Map<string, { name: string; totalObtained: number; totalMax: number; count: number }>();

    for (const mark of marks) {
      const subjectId = mark.quiz.subject.id;
      const existing = subjectMap.get(subjectId) || {
        name: mark.quiz.subject.name,
        totalObtained: 0,
        totalMax: 0,
        count: 0,
      };

      existing.totalObtained += mark.marksObtained;
      existing.totalMax += mark.quiz.totalMarks;
      existing.count += 1;

      subjectMap.set(subjectId, existing);
    }

    const subjectWise = Array.from(subjectMap.entries()).map(([subjectId, data]) => ({
      subjectId,
      subjectName: data.name,
      averagePercentage: data.totalMax > 0 ? Math.round((data.totalObtained / data.totalMax) * 100) : 0,
      totalQuizzes: data.count,
      totalObtained: data.totalObtained,
      totalMax: data.totalMax,
    }));

    const overallObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const overallMax = marks.reduce((sum, m) => sum + m.quiz.totalMarks, 0);

    return {
      overallPercentage: overallMax > 0 ? Math.round((overallObtained / overallMax) * 100) : 0,
      totalQuizzes: marks.length,
      subjectWise,
    };
  }
}
