import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';

// Layout
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminInvitations from '@/pages/admin/Invitations';
import AdminAssignments from '@/pages/admin/Assignments';
import AdminSubjects from '@/pages/admin/Subjects';
import AdminFinance from '@/pages/admin/Finance';
import AdminAnnouncements from '@/pages/admin/Announcements';
import AdminMessages from '@/pages/admin/Messages';
import AdminReports from '@/pages/admin/Reports';

// Teacher Pages
import TeacherDashboard from '@/pages/teacher/Dashboard';
import TeacherQuizzes from '@/pages/teacher/Quizzes';
import TeacherMarksEntry from '@/pages/teacher/MarksEntry';
import TeacherAttendance from '@/pages/teacher/Attendance';
import TeacherStudents from '@/pages/teacher/Students';

// Sponsor Pages
import SponsorDashboard from '@/pages/sponsor/Dashboard';
import SponsorStudents from '@/pages/sponsor/Students';
import SponsorStudentDetail from '@/pages/sponsor/StudentDetail';
import SponsorMessages from '@/pages/sponsor/Messages';

// Shared Pages
import ProfilePage from '@/pages/Profile';

// Student Pages
import StudentDashboard from '@/pages/student/Dashboard';
import StudentProfile from '@/pages/student/Profile';
import StudentMarks from '@/pages/student/Marks';
import StudentAttendance from '@/pages/student/Attendance';
import StudentDocuments from '@/pages/student/Documents';
import StudentAchievements from '@/pages/student/Achievements';
import StudentUpdates from '@/pages/student/Updates';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: Role[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}

function getDashboardPath(role: Role): string {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'TEACHER': return '/teacher';
    case 'SPONSOR': return '/sponsor';
    case 'STUDENT': return '/student';
    default: return '/login';
  }
}

function AuthRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  return <Landing />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<AuthRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/:token" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="invitations" element={<AdminInvitations />} />
        <Route path="assignments" element={<AdminAssignments />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Teacher routes */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['TEACHER']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="quizzes" element={<TeacherQuizzes />} />
        <Route path="marks" element={<TeacherMarksEntry />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Sponsor routes */}
      <Route path="/sponsor" element={<ProtectedRoute allowedRoles={['SPONSOR']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<SponsorDashboard />} />
        <Route path="students" element={<SponsorStudents />} />
        <Route path="students/:id" element={<SponsorStudentDetail />} />
        <Route path="messages" element={<SponsorMessages />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="marks" element={<StudentMarks />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="documents" element={<StudentDocuments />} />
        <Route path="achievements" element={<StudentAchievements />} />
        <Route path="updates" element={<StudentUpdates />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
