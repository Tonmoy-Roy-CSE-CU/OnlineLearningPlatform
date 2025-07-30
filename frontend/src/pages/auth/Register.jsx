import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/login', { 
      state: { 
        message: 'Registration successful! Please log in to continue.' 
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
};

export default Register;