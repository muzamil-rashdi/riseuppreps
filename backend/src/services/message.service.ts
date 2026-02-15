import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { SendMessageInput } from '../validators/message.validators';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';

export class MessageService {
  static async send(input: SendMessageInput, senderId: string) {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, role: true, firstName: true, lastName: true },
    });

    const receiver = await prisma.user.findUnique({
      where: { id: input.receiverId },
      select: { id: true, role: true, email: true },
    });

    if (!sender || !receiver) {
      throw new AppError('User not found', 404);
    }

    // Enforce messaging rules: only Sponsor <-> Admin
    const isSponsorToAdmin = sender.role === 'SPONSOR' && receiver.role === 'ADMIN';
    const isAdminToSponsor = sender.role === 'ADMIN' && receiver.role === 'SPONSOR';

    if (!isSponsorToAdmin && !isAdminToSponsor) {
      throw new AppError('Messages can only be sent between sponsors and admin', 403);
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: input.receiverId,
        subject: input.subject,
        body: input.body,
      },
      include: {
        sender: { select: { firstName: true, lastName: true, role: true } },
        receiver: { select: { firstName: true, lastName: true, role: true } },
      },
    });

    // Create notification
    await NotificationService.create(
      input.receiverId,
      'New Message',
      `${sender.firstName} ${sender.lastName}: ${input.subject}`,
      'MESSAGE',
      '/messages'
    );

    // Send email
    const senderName = `${sender.firstName} ${sender.lastName}`;
    EmailService.sendMessageNotification(receiver.email, senderName, input.subject).catch(console.error);

    return message;
  }

  static async getConversations(userId: string) {
    // Get unique conversation partners
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationMap = new Map<
      string,
      {
        partner: { id: string; firstName: string; lastName: string; role: string; avatarUrl: string | null };
        lastMessage: typeof messages[0];
        unreadCount: number;
      }
    >();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationMap.has(partnerId)) {
        const unread = await prisma.message.count({
          where: {
            senderId: partnerId,
            receiverId: userId,
            isRead: false,
          },
        });

        conversationMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: unread,
        });
      }
    }

    return Array.from(conversationMap.values());
  }

  static async getMessagesWith(userId: string, partnerId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
      }),
    ]);

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { messages, total };
  }

  static async markAsRead(messageId: string, userId: string) {
    return prisma.message.updateMany({
      where: { id: messageId, receiverId: userId },
      data: { isRead: true },
    });
  }
}
