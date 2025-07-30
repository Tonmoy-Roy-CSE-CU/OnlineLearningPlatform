import React, { forwardRef } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  onFocus,
  name,
  id,
  required = false,
  disabled = false,
  error = '',
  helperText = '',
  leftIcon = null,
  rightIcon = null,
  className = '',
  inputClassName = '',
  labelClassName = '',
  fullWidth = true,
  size = 'md',
  variant = 'default',
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  rows = 3, // for textarea
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine input type (handle password visibility)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Base classes
  const baseClasses = 'block border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors duration-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  // Variant classes
  const variantClasses = {
    default: error 
      ? 'border-error-300 text-error-900 placeholder-error-300 focus:ring-error-500 focus:border-error-500'
      : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500',
    filled: error
      ? 'border-error-300 bg-error-50 text-error-900 placeholder-error-300 focus:ring-error-500 focus:border-error-500'
      : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 focus:bg-white',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Icon padding classes
  const iconPaddingClasses = {
    left: leftIcon ? 'pl-10' : '',
    right: (rightIcon || (type === 'password' && showPasswordToggle) || error) ? 'pr-10' : '',
  };

  // Combine input classes
  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClasses,
    iconPaddingClasses.left,
    iconPaddingClasses.right,
    inputClassName,
  ].filter(Boolean).join(' ');

  // Container classes
  const containerClasses = [
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  // Label classes
  const labelClasses = [
    'block text-sm font-medium text-gray-700 mb-1',
    labelClassName,
  ].filter(Boolean).join(' ');

  // Handle password toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Render input element
  const renderInput = () => {
    const commonProps = {
      id: inputId,
      name,
      type: inputType,
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      required,
      disabled,
      autoComplete,
      autoFocus,
      maxLength,
      minLength,
      pattern,
      className: inputClasses,
      ref,
      ...props,
    };

    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={rows}
          type={undefined} // Remove type prop for textarea
        />
      );
    }

    return <input {...commonProps} />;
  };

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">{leftIcon}</span>
          </div>
        )}

        {/* Input element */}
        {renderInput()}

        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 flex items-center">
          {/* Error icon */}
          {error && (
            <div className="pr-3">
              <AlertCircle className="h-5 w-5 text-error-400" />
            </div>
          )}

          {/* Password toggle */}
          {type === 'password' && showPasswordToggle && !error && (
            <button
              type="button"
              className="pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Right icon */}
          {rightIcon && !error && !(type === 'password' && showPasswordToggle) && (
            <div className="pr-3">
              <span className="text-gray-400 text-sm">{rightIcon}</span>
            </div>
          )}
        </div>
      </div>

      {/* Helper text or error message */}
      {(error || helperText) && (
        <div className="mt-1">
          {error ? (
            <p className="text-sm text-error-600">{error}</p>
          ) : (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;