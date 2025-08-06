// components/common/Loading.jsx
import React from 'react';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-2">
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
        {text && <span className="text-gray-600">{text}</span>}
      </div>
    </div>
  );
};

export default Loading;