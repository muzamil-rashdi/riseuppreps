import { Router } from 'express';
import { SponsorController } from '../controllers/sponsor.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate, authorize('SPONSOR'));

router.get('/dashboard', SponsorController.getDashboard);
router.get('/students', SponsorController.listStudents);
router.get('/students/:id', SponsorController.getStudentDetail);
router.get('/students/:id/marks', SponsorController.getStudentMarks);
router.get('/students/:id/attendance', SponsorController.getStudentAttendance);
router.get('/students/:id/finance', SponsorController.getStudentFinance);

export default router;
