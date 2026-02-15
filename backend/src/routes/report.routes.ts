import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/student/:id', authorize('ADMIN', 'SPONSOR', 'TEACHER'), ReportController.studentReport);
router.get('/finance/:studentId', authorize('ADMIN', 'SPONSOR'), ReportController.financialReport);
router.get('/admin/summary', authorize('ADMIN'), ReportController.adminSummary);

export default router;
