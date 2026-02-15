import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AttendanceInput } from '../validators/teacher.validators';

export class AttendanceService {
  static async mark(input: AttendanceInput, teacherId: string) {
    // Verify teacher is assigned to this subject
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: { teacherId, subjectId: input.subjectId },
    });

    if (!teacherSubject) {
      throw new AppError('You are not assigned to this subject', 403);
    }

    // Verify the student exists
    const student = await prisma.user.findUnique({
      where: { id: input.studentId },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new AppError('Invalid student ID', 400);
    }

    return prisma.attendance.upsert({
      where: {
        studentId_subjectId_date: {
          studentId: input.studentId,
          subjectId: input.subjectId,
          date: new Date(input.date),
        },
      },
      update: {
        status: input.status,
        remarks: input.remarks,
        markedBy: teacherId,
      },
      create: {
        studentId: input.studentId,
        subjectId: input.subjectId,
        date: new Date(input.date),
        status: input.status,
        markedBy: teacherId,
        remarks: input.remarks,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        subject: { select: { name: true } },
      },
    });
  }

  static async getByTeacher(teacherId: string, subjectId?: string, date?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { markedBy: teacherId };
    if (subjectId) where.subjectId = subjectId;
    if (date) where.date = new Date(date);

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          subject: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return { records, total };
  }

  static async getByStudent(studentId: string, subjectId?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { studentId };
    if (subjectId) where.subjectId = subjectId;

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          subject: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    // Calculate summary
    const summary = await prisma.attendance.groupBy({
      by: ['status'],
      where: { studentId },
      _count: true,
    });

    const totalClasses = summary.reduce((sum, s) => sum + s._count, 0);
    const present = summary.find((s) => s.status === 'PRESENT')?._count || 0;
    const late = summary.find((s) => s.status === 'LATE')?._count || 0;
    const attendancePercentage = totalClasses > 0 ? Math.round(((present + late) / totalClasses) * 100) : 0;

    return {
      records,
      total,
      summary: {
        totalClasses,
        present,
        absent: summary.find((s) => s.status === 'ABSENT')?._count || 0,
        late,
        attendancePercentage,
      },
    };
  }
}
