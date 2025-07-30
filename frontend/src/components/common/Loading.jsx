import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ 
  size = 'md', 
  variant = 'spinner',
  text = '',
  fullScreen = false,
  overlay = false,
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // Text size classes
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // Spinner component
  const Spinner = () => (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
  );

  // Dots loading animation
  const Dots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-primary-600 rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );

  // Pulse loading animation
  const Pulse = () => (
    <div className="animate-pulse">
      <div className="flex space-x-4">
        <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Skeleton loading animation
  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
      </div>
    </div>
  );

  // Progress bar loading
  const ProgressBar = ({ progress = null }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`bg-primary-600 h-2 rounded-full transition-all duration-300 ${
          progress === null ? 'animate-pulse' : ''
        }`}
        style={{ 
          width: progress !== null ? `${progress}%` : '100%',
          animation: progress === null ? 'pulse 2s infinite' : 'none'
        }}
      />
    </div>
  );

  // Render loading variant
  const renderLoadingVariant = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      case 'skeleton':
        return <Skeleton />;
      case 'progress':
        return <ProgressBar />;
      case 'spinner':
      default:
        return <Spinner />;
    }
  };

  // Loading content
  const loadingContent = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderLoadingVariant()}
      {text && (
        <p className={`text-gray-600 ${textSizeClasses[size]} text-center`}>
          {text}
        </p>
      )}
    </div>
  );

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {loadingContent}
      </div>
    );
  }

  // Overlay loading
  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
        {loadingContent}
      </div>
    );
  }

  // Default loading
  return loadingContent;
};

// Specific loading components for common use cases
export const PageLoading = ({ text = 'Loading...' }) => (
  <Loading fullScreen text={text} size="lg" />
);

export const ButtonLoading = ({ size = 'sm' }) => (
  <Loading variant="spinner" size={size} />
);

export const CardLoading = () => (
  <div className="card p-4">
    <Loading variant="skeleton" />
  </div>
);

export const TableLoading = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export const FormLoading = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    ))}
  </div>
);

// Loading overlay for containers
export const LoadingOverlay = ({ isLoading, children, text = 'Loading...' }) => (
  <div className="relative">
    {children}
    {isLoading && <Loading overlay text={text} />}
  </div>
);

export default Loading;