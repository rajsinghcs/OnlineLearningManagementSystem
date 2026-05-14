import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import InstructorLayout from './layouts/InstructorLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import CourseCatalogPage from './pages/public/CourseCatalogPage';
import CourseDetailPage from './pages/public/CourseDetailPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotificationsPage from './pages/common/NotificationsPage';
import ProfilePage from './pages/common/ProfilePage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCoursesPage from './pages/student/MyCoursesPage';
import LessonWatchPage from './pages/student/LessonWatchPage';
import StudentSubscriptionsPage from './pages/student/StudentSubscriptionsPage';
import QuizTakePage from './pages/student/QuizTakePage';
import ForumPage from './pages/student/ForumPage';
import CertificateViewPage from './pages/student/CertificateViewPage';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseCreatePage from './pages/instructor/CourseCreatePage';
import CourseEditPage from './pages/instructor/CourseEditPage';
import LessonManagePage from './pages/instructor/LessonManagePage';
import QuizManagePage from './pages/instructor/QuizManagePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PlatformAnalyticsPage from './pages/admin/PlatformAnalyticsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import CoursesReviewPage from './pages/admin/CoursesReviewPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import CertificatesManagementPage from './pages/admin/CertificatesManagementPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import ModerateDiscussionsPage from './pages/admin/ModerateDiscussionsPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          className: 'font-bold text-sm rounded-xl shadow-xl border border-gray-100',
        }} 
      />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* STUDENT ROUTES */}
        <Route element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT">
              <StudentLayout />
            </RoleRoute>
          </ProtectedRoute>
        }>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/my-courses" element={<MyCoursesPage />} />
          <Route path="/student/learn/:courseId/:lessonId" element={<LessonWatchPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/subscriptions" element={<StudentSubscriptionsPage />} />
          <Route path="/student/notifications" element={<NotificationsPage />} />
          <Route path="/student/quiz/:quizId" element={<QuizTakePage />} />
          <Route path="/student/forum/:courseId" element={<ForumPage />} />
          <Route path="/student/certificate/:courseId" element={<CertificateViewPage />} />
          <Route path="/student/checkout/:courseId" element={<div>Checkout Page</div>} />
        </Route>

        {/* INSTRUCTOR ROUTES */}
        <Route element={
          <ProtectedRoute>
            <RoleRoute role="INSTRUCTOR">
              <InstructorLayout />
            </RoleRoute>
          </ProtectedRoute>
        }>
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/courses" element={<InstructorDashboard />} />
          <Route path="/instructor/courses/new" element={<CourseCreatePage />} />
          <Route path="/instructor/courses/:courseId/edit" element={<CourseEditPage />} />
          <Route path="/instructor/courses/:courseId/lessons" element={<LessonManagePage />} />
          <Route path="/instructor/courses/:courseId/quizzes" element={<QuizManagePage />} />
          <Route path="/instructor/profile" element={<ProfilePage />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route element={
          <ProtectedRoute>
            <RoleRoute role="ADMIN">
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsersPage />} />
          <Route path="/admin/courses" element={<CoursesReviewPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/certificates" element={<CertificatesManagementPage />} />
          <Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/discussions" element={<ModerateDiscussionsPage />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
