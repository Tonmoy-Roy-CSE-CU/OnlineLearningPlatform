import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoading } from '@/components/common/Loading';
import ProtectedRoute, { 
  PublicRoute, 
  AdminRoute, 
  TeacherRoute, 
  UnauthorizedPage 
} from '@/components/common/ProtectedRoute';

// Lazy load components for better performance
const Login = React.lazy(() => import('@/pages/auth/Login'));
const Register = React.lazy(() => import('@/pages/auth/Register'));

const StudentDashboard = React.lazy(() => import('@/pages/dashboard/StudentDashboard'));
const TeacherDashboard = React.lazy(() => import('@/pages/dashboard/TeacherDashboard'));
const AdminDashboard = React.lazy(() => import('@/pages/dashboard/AdminDashboard'));

const TestList = React.lazy(() => import('@/pages/tests/TestList'));
const CreateTest = React.lazy(() => import('@/pages/tests/CreateTest'));
const TakeTest = React.lazy(() => import('@/pages/tests/TakeTest'));
const TestResults = React.lazy(() => import('@/pages/tests/TestResults'));

const NotesPage = React.lazy(() => import('@/pages/notes/NotesPage'));
const UploadNotes = React.lazy(() => import('@/pages/notes/UploadNotes'));

const BlogsPage = React.lazy(() => import('@/pages/blogs/BlogsPage'));
const CreateBlog = React.lazy(() => import('@/pages/blogs/CreateBlog'));
const BlogDetails = React.lazy(() => import('@/pages/blogs/BlogDetails'));

const NoticesPage = React.lazy(() => import('@/pages/notices/NoticesPage'));
const CreateNotice = React.lazy(() => import('@/pages/notices/CreateNotice'));

const Profile = React.lazy(() => import('@/pages/profile/Profile'));

// Admin pages
const UserManagement = React.lazy(() => import('@/components/admin/UserManagement'));
const ContentModeration = React.lazy(() => import('@/components/admin/ContentModeration'));
const Analytics = React.lazy(() => import('@/components/admin/Analytics'));
const SystemHealth = React.lazy(() => import('@/components/admin/SystemHealth')); // Make sure this exists

// Error pages
const NotFound = React.lazy(() => import('@/pages/errors/NotFound'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } />

        {/* Test Routes */}
        <Route path="/tests" element={
          <ProtectedRoute>
            <TestList />
          </ProtectedRoute>
        } />
        
        <Route path="/tests/create" element={
          <TeacherRoute>
            <CreateTest />
          </TeacherRoute>
        } />
        
        <Route path="/tests/:link" element={
          <ProtectedRoute>
            <TakeTest />
          </ProtectedRoute>
        } />
        
        <Route path="/results" element={
          <ProtectedRoute>
            <TestResults />
          </ProtectedRoute>
        } />

        {/* Notes Routes */}
        <Route path="/notes" element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/notes/upload" element={
          <TeacherRoute>
            <UploadNotes />
          </TeacherRoute>
        } />

        {/* Blog Routes */}
        <Route path="/blogs" element={
          <ProtectedRoute>
            <BlogsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/blogs/create" element={
          <ProtectedRoute>
            <CreateBlog />
          </ProtectedRoute>
        } />
        
        <Route path="/blogs/:id" element={
          <ProtectedRoute>
            <BlogDetails />
          </ProtectedRoute>
        } />

        {/* Notice Routes */}
        <Route path="/notices" element={
          <ProtectedRoute>
            <NoticesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/notices/create" element={
          <TeacherRoute>
            <CreateNotice />
          </TeacherRoute>
        } />

        {/* Profile Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/users" element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } />
        
        <Route path="/admin/content" element={
          <AdminRoute>
            <ContentModeration/>
          </AdminRoute>
        } />
        
        <Route path="/admin/analytics" element={
          <AdminRoute>
            <Analytics />
          </AdminRoute>
        } />
        
        <Route path="/admin/system" element={
          <AdminRoute>
            <SystemHealth />
          </AdminRoute>
        } />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

// Dashboard router to redirect based on user role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <PageLoading />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
};

export default AppRoutes;