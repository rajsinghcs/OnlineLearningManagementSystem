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

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCoursesPage from './pages/student/MyCoursesPage';
import LessonWatchPage from './pages/student/LessonWatchPage';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseCreatePage from './pages/instructor/CourseCreatePage';
import LessonManagePage from './pages/instructor/LessonManagePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import CoursesReviewPage from './pages/admin/CoursesReviewPage';

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
          <Route path="/student/profile" element={<div>Profile Page</div>} />
          <Route path="/student/notifications" element={<div>Notifications Page</div>} />
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
          <Route path="/instructor/courses/:courseId/edit" element={<div>Edit Course</div>} />
          <Route path="/instructor/courses/:courseId/lessons" element={<LessonManagePage />} />
          <Route path="/instructor/profile" element={<div>Instructor Profile</div>} />
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
          <Route path="/admin/payments" element={<div>Payments History</div>} />
          <Route path="/admin/subscriptions" element={<div>Subscriptions</div>} />
          <Route path="/admin/analytics" element={<div>Platform Analytics</div>} />
          <Route path="/admin/notifications" element={<div>Send Bulk Notif</div>} />
          <Route path="/admin/discussions" element={<div>Moderate Discussions</div>} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
