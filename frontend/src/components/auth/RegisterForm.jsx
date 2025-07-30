import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { isValidEmail, validatePassword } from '@/utils/helpers';
import { USER_ROLES } from '@/utils/constants';

const RegisterForm = ({ onSuccess }) => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.STUDENT,
  });
  
  const [errors, setErrors] = useState({});
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    strength: 'weak',
    requirements: [],
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Validate password in real-time
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please log in to continue.' 
          }
        });
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration error:', error);
    }
  };

  // Role options
  const roleOptions = [
    {
      value: USER_ROLES.STUDENT,
      label: 'Student',
      description: 'Take tests, view notes and blogs',
      icon: <GraduationCap className="w-5 h-5" />
    },
    {
      value: USER_ROLES.TEACHER,
      label: 'Teacher',
      description: 'Create tests, upload notes, manage content',
      icon: <BookOpen className="w-5 h-5" />
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="mt-2 text-gray-600">Join our learning platform</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md">
          <p className="text-sm text-error-600">{error}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Field */}
        <Input
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name}
          required
          autoComplete="name"
          autoFocus
        />

        {/* Email Field */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email}
          required
          autoComplete="email"
        />

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            I am a... <span className="text-error-500">*</span>
          </label>
          <div className="space-y-3">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-start p-4 border rounded-lg cursor-pointer transition-colors
                  ${formData.role === option.value 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={formData.role === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <div className={`
                    ${formData.role === option.value ? 'text-primary-600' : 'text-gray-400'}
                  `}>
                    {option.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-error-600">{errors.role}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password}
            required
            autoComplete="new-password"
            showPasswordToggle
          />
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-600">Password strength:</span>
                <span className={`text-xs font-medium ${
                  passwordValidation.strength === 'strong' ? 'text-green-600' :
                  passwordValidation.strength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {passwordValidation.strength.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-1">
                {passwordValidation.requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      req.met ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs ${
                      req.met ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          showPasswordToggle
        />

        {/* Terms and Conditions */}
        <div className="text-sm text-gray-600">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </Link>
          .
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;