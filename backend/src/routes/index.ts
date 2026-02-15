import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import teacherRoutes from './teacher.routes';
import sponsorRoutes from './sponsor.routes';
import studentRoutes from './student.routes';
import messageRoutes from './message.routes';
import notificationRoutes from './notification.routes';
import reportRoutes from './report.routes';
import { authenticate } from '../middleware/auth';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/helpers';
import { UserService as US } from '../services/user.service';

const router = Router();

// Auth routes (public + protected)
router.use('/auth', authRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Teacher routes
router.use('/teacher', teacherRoutes);

// Sponsor routes
router.use('/sponsor', sponsorRoutes);

// Student routes
router.use('/student', studentRoutes);

// Messages
router.use('/messages', messageRoutes);

// Notifications
router.use('/notifications', notificationRoutes);

// Reports
router.use('/reports', reportRoutes);

// Common routes (accessible by all authenticated users)
router.get('/subjects', authenticate, async (req, res, next) => {
  try {
    const subjects = await UserService.listSubjects();
    return sendSuccess(res, subjects);
  } catch (error) {
    next(error);
  }
});

router.get('/announcements', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await US.listAnnouncements(page, limit);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
