import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white shadow-card rounded-lg p-8">
          {/* 404 Icon */}
          <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate(-1)}
              variant="primary"
              fullWidth
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Go Back
            </Button>
            
            <Link to="/dashboard">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Home className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If you think this is a mistake, please{' '}
              <a 
                href="mailto:support@olpm.com" 
                className="text-primary-600 hover:text-primary-500"
              >
                contact support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;