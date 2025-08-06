// components/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const Login = ({ switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login } = useAuth();
  const { loading, error, execute } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await execute(
        apiService.auth.login,
        formData.email,
        formData.password
      );
      
      if (result.token) {
        login(result.token, result.user);
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to OLPM
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <ErrorMessage error={error} className="mb-4" />
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="large"
            >
              Sign in
            </Button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={switchToRegister}
              className="text-blue-600 hover:text-blue-500"
            >
              Don't have an account? Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;