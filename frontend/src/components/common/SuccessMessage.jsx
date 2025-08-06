// components/common/SuccessMessage.jsx
import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessMessage = ({ message, onClose, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <CheckCircle className="h-4 w-4 mr-2" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-green-700 hover:text-green-900"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;