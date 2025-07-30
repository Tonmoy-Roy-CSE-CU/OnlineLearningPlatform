// src/pages/errors/Unauthorized.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { FaLock, FaHome, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Access Denied Illustration */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-4xl text-red-500" />
          </div>
          <div className="w-24 h-1 bg-red-500 mx-auto rounded"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. 
          {user ? ` Your current role (${user.role}) doesn't allow access to this resource.` : ' Please log in with appropriate credentials.'}
        </p>

        {/* User Info */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Logged in as:</strong> {user.name} ({user.role})
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
          
          {user ? (
            <>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="primary"
                className="w-full"
              >
                <FaHome className="mr-2" />
                Go to Dashboard
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="danger"
                className="w-full"
              >
                <FaSignOutAlt className="mr-2" />
                Logout & Login as Different User
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/auth/login')}
              variant="primary"
              className="w-full"
            >
              Login
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe you should have access to this page, 
            please contact your administrator or check your account permissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized ;