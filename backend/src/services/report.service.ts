import puppeteer from 'puppeteer';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export class ReportService {
  private static async generatePdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  static async generateStudentReport(studentId: string): Promise<Buffer> {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true,
        marks: {
          include: {
            quiz: { include: { subject: true } },
          },
          orderBy: { quiz: { date: 'desc' } },
        },
      },
    });

    if (!student) throw new AppError('Student not found', 404);

    const attendanceSummary = await prisma.attendance.groupBy({
      by: ['status'],
      where: { studentId },
      _count: true,
    });

    const totalClasses = attendanceSummary.reduce((sum, s) => sum + s._count, 0);
    const presentCount = (attendanceSummary.find((s) => s.status === 'PRESENT')?._count || 0) +
      (attendanceSummary.find((s) => s.status === 'LATE')?._count || 0);
    const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    // Group marks by subject
    const subjectMap = new Map<string, { name: string; marks: Array<{ quiz: string; obtained: number; total: number; date: string }> }>();
    for (const mark of student.marks) {
      const subName = mark.quiz.subject.name;
      if (!subjectMap.has(subName)) {
        subjectMap.set(subName, { name: subName, marks: [] });
      }
      subjectMap.get(subName)!.marks.push({
        quiz: mark.quiz.name,
        obtained: mark.marksObtained,
        total: mark.quiz.totalMarks,
        date: mark.quiz.date.toISOString().split('T')[0],
      });
    }

    const subjectRows = Array.from(subjectMap.values())
      .map((sub) => {
        const rows = sub.marks
          .map((m) => `<tr><td>${m.quiz}</td><td>${m.date}</td><td>${m.obtained}/${m.total}</td><td>${Math.round((m.obtained / m.total) * 100)}%</td></tr>`)
          .join('');
        const avg = sub.marks.reduce((sum, m) => sum + (m.obtained / m.total) * 100, 0) / sub.marks.length;
        return `
          <h3 style="color: #1e40af; margin-top: 20px;">${sub.name} (Avg: ${Math.round(avg)}%)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead><tr style="background: #f1f5f9;"><th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Quiz/Test</th><th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Date</th><th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Score</th><th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">%</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>body { font-family: 'Segoe UI', sans-serif; color: #1e293b; } h1 { color: #1e40af; } .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; } .stats { display: flex; gap: 20px; margin: 20px 0; } .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; flex: 1; text-align: center; } .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; } .stat-label { font-size: 12px; color: #64748b; }</style></head>
      <body>
        <div class="header">
          <h1>RiseUp Preps Academy</h1>
          <h2>Student Report Card</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <h3>Student: ${student.firstName} ${student.lastName}</h3>
        <p>Grade: ${student.studentProfile?.grade || 'N/A'} | Email: ${student.email}</p>
        <div class="stats">
          <div class="stat-box"><div class="stat-value">${student.marks.length}</div><div class="stat-label">Total Quizzes</div></div>
          <div class="stat-box"><div class="stat-value">${attendancePct}%</div><div class="stat-label">Attendance</div></div>
          <div class="stat-box"><div class="stat-value">${totalClasses}</div><div class="stat-label">Total Classes</div></div>
        </div>
        ${subjectRows}
      </body>
      </html>
    `;

    return this.generatePdf(html);
  }

  static async generateFinancialReport(studentId: string): Promise<Buffer> {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true, email: true },
    });

    if (!student) throw new AppError('Student not found', 404);

    const records = await prisma.financialRecord.findMany({
      where: { studentId },
      include: {
        sponsor: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });

    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

    const recordRows = records
      .map((r) => `<tr><td style="padding: 8px; border: 1px solid #e2e8f0;">${r.date.toISOString().split('T')[0]}</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${r.sponsor.firstName} ${r.sponsor.lastName}</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${r.description || '-'}</td><td style="padding: 8px; border: 1px solid #e2e8f0;">$${Number(r.amount).toFixed(2)}</td></tr>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>body { font-family: 'Segoe UI', sans-serif; color: #1e293b; } h1 { color: #1e40af; } .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; } table { width: 100%; border-collapse: collapse; margin: 15px 0; } thead tr { background: #f1f5f9; } th { padding: 8px; text-align: left; border: 1px solid #e2e8f0; }</style></head>
      <body>
        <div class="header">
          <h1>RiseUp Preps Academy</h1>
          <h2>Donation Report</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <h3>Student: ${student.firstName} ${student.lastName}</h3>
        <p><strong>Total Donations: $${total.toFixed(2)}</strong></p>
        <h3>Donation Records</h3>
        <table><thead><tr><th>Date</th><th>Sponsor</th><th>Description</th><th>Amount</th></tr></thead><tbody>${recordRows}</tbody></table>
      </body>
      </html>
    `;

    return this.generatePdf(html);
  }

  static async generateAdminSummary(): Promise<Buffer> {
    const [studentCount, sponsorCount, teacherCount, totalFinance] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.user.count({ where: { role: 'SPONSOR', isActive: true } }),
      prisma.user.count({ where: { role: 'TEACHER', isActive: true } }),
      prisma.financialRecord.aggregate({ _sum: { amount: true } }),
    ]);

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const studentRows = [];
    for (const s of students) {
      const marksCount = await prisma.mark.count({ where: { studentId: s.id } });
      const finance = await prisma.financialRecord.aggregate({
        where: { studentId: s.id },
        _sum: { amount: true },
      });
      studentRows.push(`<tr><td style="padding: 8px; border: 1px solid #e2e8f0;">${s.firstName} ${s.lastName}</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${s.email}</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${marksCount}</td><td style="padding: 8px; border: 1px solid #e2e8f0;">$${Number(finance._sum.amount || 0).toFixed(2)}</td></tr>`);
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>body { font-family: 'Segoe UI', sans-serif; color: #1e293b; } h1 { color: #1e40af; } .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; } .stats { display: flex; gap: 20px; margin: 20px 0; } .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; flex: 1; text-align: center; } .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; } .stat-label { font-size: 12px; color: #64748b; } table { width: 100%; border-collapse: collapse; margin: 15px 0; } thead tr { background: #f1f5f9; } th { padding: 8px; text-align: left; border: 1px solid #e2e8f0; }</style></head>
      <body>
        <div class="header">
          <h1>RiseUp Preps Academy</h1>
          <h2>Admin Summary Report</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="stats">
          <div class="stat-box"><div class="stat-value">${studentCount}</div><div class="stat-label">Students</div></div>
          <div class="stat-box"><div class="stat-value">${sponsorCount}</div><div class="stat-label">Sponsors</div></div>
          <div class="stat-box"><div class="stat-value">${teacherCount}</div><div class="stat-label">Teachers</div></div>
          <div class="stat-box"><div class="stat-value">$${Number(totalFinance._sum.amount || 0).toFixed(2)}</div><div class="stat-label">Total Spent</div></div>
        </div>
        <h3>All Students</h3>
        <table><thead><tr><th>Name</th><th>Email</th><th>Quizzes Taken</th><th>Total Expense</th></tr></thead><tbody>${studentRows.join('')}</tbody></table>
      </body>
      </html>
    `;

    return this.generatePdf(html);
  }
}
