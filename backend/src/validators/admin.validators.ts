import { z } from 'zod';
import { Role } from '@prisma/client';

export const invitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum([Role.SPONSOR, Role.TEACHER, Role.STUDENT], {
    errorMap: () => ({ message: 'Role must be SPONSOR, TEACHER, or STUDENT' }),
  }),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const assignmentSchema = z.object({
  sponsorId: z.string().uuid('Invalid sponsor ID'),
  studentId: z.string().uuid('Invalid student ID'),
});

export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100),
  description: z.string().max(500).optional(),
});

export const financialRecordSchema = z.object({
  sponsorId: z.string().uuid('Invalid sponsor ID'),
  studentId: z.string().uuid('Invalid student ID'),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().max(500).optional(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required'),
});

export type InvitationInput = z.infer<typeof invitationSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type FinancialRecordInput = z.infer<typeof financialRecordSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
