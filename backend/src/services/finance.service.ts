import { prisma } from '../config/prisma';
import { FinancialRecordInput } from '../validators/admin.validators';
import { NotificationService } from './notification.service';

export class FinanceService {
  static async create(input: FinancialRecordInput, adminId: string, receiptUrl?: string) {
    const record = await prisma.financialRecord.create({
      data: {
        sponsorId: input.sponsorId,
        studentId: input.studentId,
        amount: input.amount,
        description: input.description,
        date: new Date(input.date),
        receiptUrl,
        createdBy: adminId,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        sponsor: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Notify the sponsor
    const studentName = `${record.student.firstName} ${record.student.lastName}`;
    NotificationService.notifySponsorsOfFinance(
      input.studentId,
      studentName,
      input.amount
    ).catch(console.error);

    return record;
  }

  static async update(recordId: string, input: Partial<FinancialRecordInput>) {
    return prisma.financialRecord.update({
      where: { id: recordId },
      data: {
        ...(input.sponsorId && { sponsorId: input.sponsorId }),
        ...(input.studentId && { studentId: input.studentId }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.date && { date: new Date(input.date) }),
      },
    });
  }

  static async delete(recordId: string) {
    return prisma.financialRecord.delete({
      where: { id: recordId },
    });
  }

  static async list(page = 1, limit = 20, studentId?: string, sponsorId?: string) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = studentId;
    if (sponsorId) where.sponsorId = sponsorId;

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          sponsor: { select: { id: true, firstName: true, lastName: true } },
          admin: { select: { firstName: true, lastName: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return { records, total };
  }

  static async getStudentFinance(studentId: string, sponsorId?: string) {
    const where: Record<string, unknown> = { studentId };
    if (sponsorId) where.sponsorId = sponsorId;

    const records = await prisma.financialRecord.findMany({
      where,
      include: {
        sponsor: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });

    const totalAggregate = await prisma.financialRecord.aggregate({
      where,
      _sum: { amount: true },
    });

    return {
      records,
      summary: {
        totalAmount: Number(totalAggregate._sum.amount || 0),
      },
    };
  }

  static async getFinancialSummary() {
    const sponsorBreakdown = await prisma.financialRecord.groupBy({
      by: ['sponsorId'],
      _sum: { amount: true },
      _count: true,
    });

    // Get sponsor names
    const sponsorIds = sponsorBreakdown.map((s) => s.sponsorId);
    const sponsors = await prisma.user.findMany({
      where: { id: { in: sponsorIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const sponsorMap = new Map(sponsors.map((s) => [s.id, s]));

    const monthlyDonations = await prisma.$queryRaw<
      { month: string; total: number }[]
    >`
      SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(amount)::float as total
      FROM financial_records
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

    const totalAmount = sponsorBreakdown.reduce(
      (sum, s) => sum + Number(s._sum.amount || 0),
      0
    );

    return {
      totalAmount,
      sponsorBreakdown: sponsorBreakdown.map((s) => {
        const sponsor = sponsorMap.get(s.sponsorId);
        return {
          sponsorId: s.sponsorId,
          sponsorName: sponsor ? `${sponsor.firstName} ${sponsor.lastName}` : 'Unknown',
          total: Number(s._sum.amount || 0),
          count: s._count,
        };
      }),
      monthlyDonations,
    };
  }

  static async getSponsorStudents(sponsorId: string) {
    const assignments = await prisma.sponsorStudent.findMany({
      where: { sponsorId, isActive: true },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfile: { select: { grade: true } },
          },
        },
      },
    });

    return assignments.map((a) => a.student);
  }
}
