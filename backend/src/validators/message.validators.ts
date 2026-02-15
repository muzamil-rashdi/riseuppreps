import { z } from 'zod';

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID'),
  subject: z.string().min(1, 'Subject is required').max(200),
  body: z.string().min(1, 'Body is required').max(5000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
