import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const quizSchema = z.object({
  name: z.string().min(1, 'Quiz name is required').max(200),
  subjectId: z.string().uuid('Invalid subject ID'),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  totalMarks: z.number().int().positive('Total marks must be positive'),
  description: z.string().max(500).optional(),
});

export const markSchema = z.object({
  quizId: z.string().uuid('Invalid quiz ID'),
  studentId: z.string().uuid('Invalid student ID'),
  marksObtained: z.number().min(0, 'Marks cannot be negative'),
  remarks: z.string().max(500).optional(),
});

export const attendanceSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  status: z.nativeEnum(AttendanceStatus),
  remarks: z.string().max(500).optional(),
});

export type QuizInput = z.infer<typeof quizSchema>;
export type MarkInput = z.infer<typeof markSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
