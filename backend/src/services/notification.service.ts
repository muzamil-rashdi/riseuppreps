import { prisma } from '../config/prisma';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  static async create(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
    link?: string
  ) {
    return prisma.notification.create({
      data: { userId, title, body, type, link },
    });
  }

  static async createForMultiple(
    userIds: string[],
    title: string,
    body: string,
    type: NotificationType,
    link?: string
  ) {
    return prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, title, body, type, link })),
    });
  }

  static async getForUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { notifications, total, unreadCount };
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async notifySponsorsOfMarks(
    studentId: string,
    studentName: string,
    quizName: string,
    marks: number,
    totalMarks: number
  ) {
    const sponsorStudents = await prisma.sponsorStudent.findMany({
      where: { studentId, isActive: true },
      select: { sponsorId: true },
    });

    const sponsorIds = sponsorStudents.map((ss) => ss.sponsorId);

    if (sponsorIds.length > 0) {
      await this.createForMultiple(
        sponsorIds,
        'New Marks Posted',
        `${studentName} scored ${marks}/${totalMarks} in ${quizName}`,
        'MARKS_POSTED',
        `/sponsor/students/${studentId}`
      );
    }

    return sponsorIds;
  }

  static async notifySponsorsOfFinance(
    studentId: string,
    studentName: string,
    amount: number
  ) {
    const sponsorStudents = await prisma.sponsorStudent.findMany({
      where: { studentId, isActive: true },
      select: { sponsorId: true },
    });

    const sponsorIds = sponsorStudents.map((ss) => ss.sponsorId);

    if (sponsorIds.length > 0) {
      await this.createForMultiple(
        sponsorIds,
        'Donation Recorded',
        `A donation of $${amount} has been recorded for ${studentName}`,
        'FINANCIAL_UPDATE',
        `/sponsor/students/${studentId}`
      );
    }

    return sponsorIds;
  }

  static async notifyAllOfAnnouncement(title: string, announcementId: string) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);

    await this.createForMultiple(
      userIds,
      'New Announcement',
      title,
      'ANNOUNCEMENT',
      `/announcements`
    );
  }
}
