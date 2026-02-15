import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';
import { sendMessageSchema } from '../validators/message.validators';
import { sendSuccess } from '../utils/helpers';
import { parsePagination, createPaginatedResponse } from '../utils/pagination';

export class MessageController {
  static async send(req: Request, res: Response, next: NextFunction) {
    try {
      const input = sendMessageSchema.parse(req.body);
      const message = await MessageService.send(input, req.user!.userId);
      return sendSuccess(res, message, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await MessageService.getConversations(req.user!.userId);
      return sendSuccess(res, conversations);
    } catch (error) {
      next(error);
    }
  }

  static async getMessagesWith(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as { page?: string; limit?: string });
      const { messages, total } = await MessageService.getMessagesWith(
        req.user!.userId,
        req.params.userId,
        page,
        limit
      );
      return sendSuccess(res, createPaginatedResponse(messages, total, { page, limit, skip: (page - 1) * limit }));
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await MessageService.markAsRead(req.params.id, req.user!.userId);
      return sendSuccess(res, { message: 'Marked as read' });
    } catch (error) {
      next(error);
    }
  }
}
