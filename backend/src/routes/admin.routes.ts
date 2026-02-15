import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { uploadSingle } from '../middleware/upload';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// User management
router.get('/users', AdminController.listUsers);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deactivateUser);

// Invitations
router.post('/invitations', AdminController.sendInvitation);
router.get('/invitations', AdminController.listInvitations);

// Assignments
router.post('/assignments', AdminController.createAssignment);
router.delete('/assignments/:id', AdminController.removeAssignment);
router.get('/assignments', AdminController.listAssignments);

// Subjects
router.post('/subjects', AdminController.createSubject);
router.put('/subjects/:id', AdminController.updateSubject);
router.delete('/subjects/:id', AdminController.deactivateSubject);

// Finance
router.post('/finance', uploadSingle, AdminController.createFinancialRecord);
router.put('/finance/:id', AdminController.updateFinancialRecord);
router.delete('/finance/:id', AdminController.deleteFinancialRecord);
router.get('/finance', AdminController.listFinancialRecords);
router.get('/finance/summary', AdminController.getFinancialSummary);
router.get('/finance/student/:id', AdminController.getStudentFinance);

// Sponsor's students (for cascading dropdown in finance form)
router.get('/sponsors/:id/students', AdminController.getSponsorStudents);

// Announcements
router.post('/announcements', AdminController.createAnnouncement);
router.put('/announcements/:id', AdminController.updateAnnouncement);
router.delete('/announcements/:id', AdminController.deleteAnnouncement);

// Teacher-Subject assignments
router.post('/teacher-subjects', AdminController.assignTeacherSubject);
router.delete('/teacher-subjects', AdminController.removeTeacherSubject);

// Student-Subject enrollments
router.post('/student-subjects', AdminController.enrollStudentSubject);
router.delete('/student-subjects', AdminController.removeStudentSubject);

// Subject detail (teachers + students)
router.get('/subjects/:id/members', AdminController.getSubjectMembers);

export default router;
