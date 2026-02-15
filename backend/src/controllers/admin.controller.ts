import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { FinanceService } from '../services/finance.service';
import { EmailService } from '../services/email.service';
import { NotificationService } from '../services/notification.service';
import {
  invitationSchema,
  updateUserSchema,
  assignmentSchema,
  subjectSchema,
  financialRecordSchema,
  announcementSchema,
} from '../validators/admin.validators';
import { sendSuccess } from '../utils/helpers';
import { parsePagination, createPaginatedResponse } from '../utils/pagination';
import { Role } from '@prisma/client';

export class AdminController {
  // Users
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as { page?: string; limit?: string });
      const role = req.query.role as Role | undefined;
      const { users, total } = await UserService.listUsers(role, page, limit);
      return sendSuccess(res, createPaginatedResponse(users, total, { page, limit, skip: (page - 1) * limit }));
    } catch (error) {
      next(error);
    }
  }

  static async sendInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const input = invitationSchema.parse(req.body);
      const { invitation, token } = await UserService.createInvitation(input, req.user!.userId);

      // Send invite email
      EmailService.sendInviteEmail(input.email, input.role, token).catch(console.error);

      return sendSuccess(res, invitation, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateUserSchema.parse(req.body);
      const user = await UserService.updateUser(req.params.id, input);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deactivateUser(req.params.id);
      return sendSuccess(res, { message: 'User deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await UserService.getAdminDashboard();
      return sendSuccess(res, dashboard);
    } catch (error) {
      next(error);
    }
  }

  // Assignments
  static async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const input = assignmentSchema.parse(req.body);
      const assignment = await UserService.createAssignment(input);
      return sendSuccess(res, assignment, 201);
    } catch (error) {
      next(error);
    }
  }

  static async removeAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.removeAssignment(req.params.id);
      return sendSuccess(res, { message: 'Assignment removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async listAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as { page?: string; limit?: string });
      const { assignments, total } = await UserService.listAssignments(page, limit);
      return sendSuccess(res, createPaginatedResponse(assignments, total, { page, limit, skip: (page - 1) * limit }));
    } catch (error) {
      next(error);
    }
  }

  // Subjects
  static async createSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const input = subjectSchema.parse(req.body);
      const subject = await UserService.createSubject(input, req.user!.userId);
      return sendSuccess(res, subject, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const input = subjectSchema.parse(req.body);
      const subject = await UserService.updateSubject(req.params.id, input);
      return sendSuccess(res, subject);
    } catch (error) {
      next(error);
    }
  }

  static async deactivateSubject(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deactivateSubject(req.params.id);
      return sendSuccess(res, { message: 'Subject deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Finance
  static async createFinancialRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const input = financialRecordSchema.parse(req.body);
      const receiptUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const record = await FinanceService.create(input, req.user!.userId, receiptUrl);
      return sendSuccess(res, record, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateFinancialRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const input = financialRecordSchema.partial().parse(req.body);
      const record = await FinanceService.update(req.params.id, input);
      return sendSuccess(res, record);
    } catch (error) {
      next(error);
    }
  }

  static async deleteFinancialRecord(req: Request, res: Response, next: NextFunction) {
    try {
      await FinanceService.delete(req.params.id);
      return sendSuccess(res, { message: 'Record deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async listFinancialRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as { page?: string; limit?: string });
      const studentId = req.query.studentId as string | undefined;
      const sponsorId = req.query.sponsorId as string | undefined;
      const { records, total } = await FinanceService.list(page, limit, studentId, sponsorId);
      return sendSuccess(res, createPaginatedResponse(records, total, { page, limit, skip: (page - 1) * limit }));
    } catch (error) {
      next(error);
    }
  }

  static async getSponsorStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await FinanceService.getSponsorStudents(req.params.id);
      return sendSuccess(res, students);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentFinance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FinanceService.getStudentFinance(req.params.id);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getFinancialSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await FinanceService.getFinancialSummary();
      return sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  // Announcements
  static async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const input = announcementSchema.parse(req.body);
      const announcement = await UserService.createAnnouncement(input, req.user!.userId);

      // Notify all users
      NotificationService.notifyAllOfAnnouncement(input.title, announcement.id).catch(console.error);

      return sendSuccess(res, announcement, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const input = announcementSchema.parse(req.body);
      const announcement = await UserService.updateAnnouncement(req.params.id, input);
      return sendSuccess(res, announcement);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deleteAnnouncement(req.params.id);
      return sendSuccess(res, { message: 'Announcement deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Teacher-Subject Assignment
  static async assignTeacherSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { teacherId, subjectId } = req.body;
      const result = await UserService.assignTeacherSubject(teacherId, subjectId);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async removeTeacherSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { teacherId, subjectId } = req.body;
      await UserService.removeTeacherSubject(teacherId, subjectId);
      return sendSuccess(res, { message: 'Teacher-subject assignment removed' });
    } catch (error) {
      next(error);
    }
  }

  // Student-Subject Enrollment
  static async enrollStudentSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, subjectId } = req.body;
      const result = await UserService.enrollStudentSubject(studentId, subjectId);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async removeStudentSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, subjectId } = req.body;
      await UserService.removeStudentSubject(studentId, subjectId);
      return sendSuccess(res, { message: 'Student enrollment removed' });
    } catch (error) {
      next(error);
    }
  }

  // Subject members (teachers + students)
  static async getSubjectMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await UserService.getSubjectMembers(req.params.id);
      return sendSuccess(res, members);
    } catch (error) {
      next(error);
    }
  }

  // Invitations
  static async listInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as { page?: string; limit?: string });
      const { invitations, total } = await UserService.listInvitations(page, limit);
      return sendSuccess(res, createPaginatedResponse(invitations, total, { page, limit, skip: (page - 1) * limit }));
    } catch (error) {
      next(error);
    }
  }
}
