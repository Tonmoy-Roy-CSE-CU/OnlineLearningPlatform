// components/common/ErrorMessage.jsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ error, onClose, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>{error}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-700 hover:text-red-900"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;