import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate, authorize('TEACHER'));

// Students
router.get('/students', TeacherController.listStudents);

// Subjects
router.get('/subjects', TeacherController.listSubjects);

// Quizzes
router.post('/quizzes', TeacherController.createQuiz);
router.put('/quizzes/:id', TeacherController.updateQuiz);
router.get('/quizzes', TeacherController.listQuizzes);
router.get('/quizzes/:id', TeacherController.getQuiz);

// Marks
router.post('/marks', TeacherController.createMark);
router.put('/marks/:id', TeacherController.updateMark);

// Attendance
router.post('/attendance', TeacherController.markAttendance);
router.get('/attendance', TeacherController.getAttendance);

export default router;
