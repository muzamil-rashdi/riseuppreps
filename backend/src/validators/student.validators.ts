import { z } from 'zod';

export const updateProfileSchema = z.object({
  grade: z.string().max(20).optional(),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  address: z.string().max(500).optional(),
  bio: z.string().max(2000).optional(),
  goals: z.string().max(2000).optional(),
  thankYouMessage: z.string().max(2000).optional(),
});

export const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
});

export const documentUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
