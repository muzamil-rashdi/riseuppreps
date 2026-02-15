import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { uploadSingle, uploadAvatar } from '../middleware/upload';

const router = Router();

router.use(authenticate, authorize('STUDENT'));

// Profile
router.get('/profile', StudentController.getProfile);
router.put('/profile', uploadAvatar, StudentController.updateProfile);

// Marks
router.get('/marks', StudentController.getMarks);
router.get('/performance', StudentController.getPerformanceSummary);

// Attendance
router.get('/attendance', StudentController.getAttendance);

// Documents
router.post('/documents', uploadSingle, StudentController.uploadDocument);
router.get('/documents', StudentController.listDocuments);
router.delete('/documents/:id', StudentController.deleteDocument);

// Achievements
router.post('/achievements', StudentController.createAchievement);
router.put('/achievements/:id', StudentController.updateAchievement);
router.delete('/achievements/:id', StudentController.deleteAchievement);
router.get('/achievements', StudentController.listAchievements);

// Updates/Blog
router.post('/updates', StudentController.createUpdate);
router.put('/updates/:id', StudentController.updatePost);
router.delete('/updates/:id', StudentController.deleteUpdate);
router.get('/updates', StudentController.listUpdates);

export default router;
