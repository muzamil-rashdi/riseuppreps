import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { generateInviteToken } from '../utils/jwt';
import { InvitationInput, UpdateUserInput, AssignmentInput, SubjectInput, AnnouncementInput } from '../validators/admin.validators';

export class UserService {
  static async listUsers(role?: Role, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  static async createInvitation(input: InvitationInput, adminId: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists', 409);
    }

    // Check if there's already a pending invitation
    const existingInvite = await prisma.invitation.findFirst({
      where: {
        email: input.email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new AppError('A pending invitation already exists for this email', 409);
    }

    const token = generateInviteToken(input.email, input.role);

    const invitation = await prisma.invitation.create({
      data: {
        email: input.email,
        role: input.role,
        token,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
        invitedBy: adminId,
      },
    });

    return { invitation, token };
  }

  static async updateUser(userId: string, input: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Cannot modify admin account', 403);
    }

    return prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  static async deactivateUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Cannot deactivate admin account', 403);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  static async createAssignment(input: AssignmentInput) {
    // Verify sponsor and student roles
    const [sponsor, student] = await Promise.all([
      prisma.user.findUnique({ where: { id: input.sponsorId } }),
      prisma.user.findUnique({ where: { id: input.studentId } }),
    ]);

    if (!sponsor || sponsor.role !== 'SPONSOR') {
      throw new AppError('Invalid sponsor ID', 400);
    }

    if (!student || student.role !== 'STUDENT') {
      throw new AppError('Invalid student ID', 400);
    }

    return prisma.sponsorStudent.create({
      data: {
        sponsorId: input.sponsorId,
        studentId: input.studentId,
      },
      include: {
        sponsor: { select: { id: true, firstName: true, lastName: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  static async removeAssignment(assignmentId: string) {
    return prisma.sponsorStudent.delete({
      where: { id: assignmentId },
    });
  }

  static async listAssignments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      prisma.sponsorStudent.findMany({
        include: {
          sponsor: { select: { id: true, firstName: true, lastName: true, email: true } },
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sponsorStudent.count(),
    ]);

    return { assignments, total };
  }

  // Subjects
  static async createSubject(input: SubjectInput, adminId: string) {
    return prisma.subject.create({
      data: {
        name: input.name,
        description: input.description,
        createdBy: adminId,
      },
    });
  }

  static async updateSubject(subjectId: string, input: SubjectInput) {
    return prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: input.name,
        description: input.description,
      },
    });
  }

  static async deactivateSubject(subjectId: string) {
    return prisma.subject.update({
      where: { id: subjectId },
      data: { isActive: false },
    });
  }

  static async listSubjects() {
    return prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // Announcements
  static async createAnnouncement(input: AnnouncementInput, adminId: string) {
    return prisma.announcement.create({
      data: {
        title: input.title,
        body: input.body,
        createdBy: adminId,
      },
    });
  }

  static async updateAnnouncement(announcementId: string, input: AnnouncementInput) {
    return prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: input.title,
        body: input.body,
      },
    });
  }

  static async deleteAnnouncement(announcementId: string) {
    return prisma.announcement.update({
      where: { id: announcementId },
      data: { isActive: false },
    });
  }

  static async listAnnouncements(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where: { isActive: true },
        include: {
          admin: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.announcement.count({ where: { isActive: true } }),
    ]);

    return { announcements, total };
  }

  // Dashboard stats
  static async getAdminDashboard() {
    const [totalStudents, totalSponsors, totalTeachers, activeAssignments, totalQuizzes, financialSum] =
      await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
        prisma.user.count({ where: { role: 'SPONSOR', isActive: true } }),
        prisma.user.count({ where: { role: 'TEACHER', isActive: true } }),
        prisma.sponsorStudent.count({ where: { isActive: true } }),
        prisma.quiz.count(),
        prisma.financialRecord.aggregate({ _sum: { amount: true } }),
      ]);

    // Recent activity (last 10 entries across marks and financial)
    const recentMarks = await prisma.mark.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { firstName: true, lastName: true } },
        quiz: { select: { name: true } },
      },
    });

    const recentFinancial = await prisma.financialRecord.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { firstName: true, lastName: true } },
        sponsor: { select: { firstName: true, lastName: true } },
      },
    });

    return {
      stats: {
        totalStudents,
        totalSponsors,
        totalTeachers,
        activeAssignments,
        totalQuizzes,
        totalFinancialAmount: Number(financialSum._sum.amount || 0),
      },
      recentMarks,
      recentFinancial,
    };
  }

  // Teacher-Subject assignment
  static async assignTeacherSubject(teacherId: string, subjectId: string) {
    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.role !== 'TEACHER') {
      throw new AppError('Invalid teacher ID', 400);
    }

    return prisma.teacherSubject.create({
      data: { teacherId, subjectId },
    });
  }

  static async removeTeacherSubject(teacherId: string, subjectId: string) {
    return prisma.teacherSubject.deleteMany({
      where: { teacherId, subjectId },
    });
  }

  // Student-Subject enrollment
  static async enrollStudentSubject(studentId: string, subjectId: string) {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== 'STUDENT') {
      throw new AppError('Invalid student ID', 400);
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw new AppError('Invalid subject ID', 400);
    }

    return prisma.studentSubject.create({
      data: { studentId, subjectId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        subject: { select: { id: true, name: true } },
      },
    });
  }

  static async removeStudentSubject(studentId: string, subjectId: string) {
    return prisma.studentSubject.deleteMany({
      where: { studentId, subjectId },
    });
  }

  // Get subject members (teachers + students)
  static async getSubjectMembers(subjectId: string) {
    const [teachers, students] = await Promise.all([
      prisma.teacherSubject.findMany({
        where: { subjectId },
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.studentSubject.findMany({
        where: { subjectId },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    return {
      teachers: teachers.map((t) => t.teacher),
      students: students.map((s) => s.student),
    };
  }

  // Invitations list
  static async listInvitations(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        include: {
          inviter: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invitation.count(),
    ]);

    return { invitations, total };
  }
}
