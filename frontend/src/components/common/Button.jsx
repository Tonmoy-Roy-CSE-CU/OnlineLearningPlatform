import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  fullWidth = false,
  onClick,
  ...props
}) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border border-transparent',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 border border-transparent',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 border border-transparent',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 border border-transparent',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 border border-transparent',
    outline: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 border border-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-primary-500 border border-transparent',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 focus:ring-primary-500 border border-transparent shadow-none p-0',
  };

  // Size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className,
  ].filter(Boolean).join(' ');

  // Handle click with loading state
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Left icon or loading spinner */}
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}

      {/* Button content */}
      <span>{children}</span>

      {/* Right icon */}
      {rightIcon && !loading && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;