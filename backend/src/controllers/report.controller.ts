import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  static async studentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await ReportService.generateStudentReport(req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=student-report-${req.params.id}.pdf`);
      return res.send(pdf);
    } catch (error) {
      next(error);
    }
  }

  static async financialReport(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await ReportService.generateFinancialReport(req.params.studentId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=financial-report-${req.params.studentId}.pdf`);
      return res.send(pdf);
    } catch (error) {
      next(error);
    }
  }

  static async adminSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await ReportService.generateAdminSummary();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=admin-summary-report.pdf');
      return res.send(pdf);
    } catch (error) {
      next(error);
    }
  }
}
