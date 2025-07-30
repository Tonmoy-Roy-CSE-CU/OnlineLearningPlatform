import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  footer = null,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  preventClose = false,
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEsc || preventClose) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEsc, onClose, preventClose]);

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && !preventClose && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  // Handle close button click
  const handleCloseClick = () => {
    if (!preventClose) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${overlayClassName}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-lg bg-white 
            shadow-xl transition-all ${className}
          `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              {title && (
                <h3 id="modal-title" className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  type="button"
                  className={`
                    rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none 
                    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 p-1
                    ${preventClose ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={handleCloseClick}
                  disabled={preventClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={`px-6 py-4 ${contentClassName}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirmation modal
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      preventClose={loading}
      footer={
        <div className="flex space-x-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
};

// Alert modal
export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Information',
  message = '',
  variant = 'info',
  buttonText = 'OK',
}) => {
  const variantClasses = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>
            {buttonText}
          </Button>
        </div>
      }
    >
      <p className={`${variantClasses[variant] || variantClasses.info}`}>
        {message}
      </p>
    </Modal>
  );
};

// Loading modal
export const LoadingModal = ({
  isOpen,
  title = 'Processing...',
  message = 'Please wait while we process your request.',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      size="sm"
      closeOnOverlayClick={false}
      closeOnEsc={false}
      showCloseButton={false}
      preventClose={true}
    >
      <div className="flex items-center space-x-3">
        <div className="spinner" />
        <p className="text-gray-600">{message}</p>
      </div>
    </Modal>
  );
};

export default Modal;