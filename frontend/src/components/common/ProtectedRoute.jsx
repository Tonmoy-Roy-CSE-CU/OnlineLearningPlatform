import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoading } from './Loading';

const ProtectedRoute = ({ 
  children, 
  roles = [], 
  requireAuth = true,
  redirectTo = '/login',
  fallback = null 
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <PageLoading text="Checking authentication..." />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If specific roles are required, check user role
  if (roles.length > 0 && isAuthenticated) {
    if (!hasRole(roles)) {
      // Show fallback component or redirect to unauthorized page
      if (fallback) {
        return fallback;
      }
      
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ from: location, requiredRoles: roles }} 
          replace 
        />
      );
    }
  }

  // If user is authenticated but trying to access auth pages, redirect to dashboard
  if (!requireAuth && isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Higher-order component for role-based access
export const withRoleAccess = (Component, allowedRoles = []) => {
  return (props) => (
    <ProtectedRoute roles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role-based route components
export const AdminRoute = ({ children, fallback }) => (
  <ProtectedRoute roles={['admin']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const TeacherRoute = ({ children, fallback }) => (
  <ProtectedRoute roles={['teacher', 'admin']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const StudentRoute = ({ children, fallback }) => (
  <ProtectedRoute roles={['student']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

// Public route (no authentication required)
export const PublicRoute = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);

// Unauthorized page component
export const UnauthorizedPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const requiredRoles = location.state?.requiredRoles || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white shadow-card rounded-lg p-8">
          <div className="text-6xl text-error-500 mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
            {requiredRoles.length > 0 && (
              <>
                <br />
                <span className="text-sm">
                  Required role(s): {requiredRoles.join(', ')}
                </span>
                <br />
                <span className="text-sm">
                  Your role: {user?.role || 'Unknown'}
                </span>
              </>
            )}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary w-full"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="btn btn-outline w-full"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;