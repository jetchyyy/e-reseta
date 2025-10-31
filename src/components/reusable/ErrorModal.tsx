import React, { useEffect, useRef } from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  errorType?: 'error' | 'warning' | 'info';
  autoCloseDelay?: number; // in milliseconds, 0 means no auto-close
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = 'Error',
  message = 'Something went wrong. Please try again.',
  errorType = 'error',
  autoCloseDelay = 0,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-close functionality
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  // Focus management: Focus close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation: Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab as EventListener);

    return () => {
      modal.removeEventListener('keydown', handleTab as EventListener);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getColorClasses = () => {
    switch (errorType) {
      case 'error':
        return {
          bg: 'bg-red-100',
          icon: 'text-red-500',
          button: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100',
          icon: 'text-yellow-500',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-100',
          icon: 'text-blue-500',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          bg: 'bg-red-100',
          icon: 'text-red-500',
          button: 'bg-red-600 hover:bg-red-700',
        };
    }
  };

  const renderIcon = () => {
    const colors = getColorClasses();
    
    switch (errorType) {
      case 'error':
        return (
          <svg
            className={`w-16 h-16 ${colors.icon}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className={`w-16 h-16 ${colors.icon}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className={`w-16 h-16 ${colors.icon}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const colors = getColorClasses();

  // Get ARIA labels based on error type
  const getAriaLabel = () => {
    switch (errorType) {
      case 'error':
        return 'Error notification';
      case 'warning':
        return 'Warning notification';
      case 'info':
        return 'Information notification';
      default:
        return 'Notification';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={onClose} // Click backdrop to close
    >
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg p-1"
          aria-label="Close notification"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6" aria-hidden="true">
          <div className={`inline-flex items-center justify-center w-20 h-20 ${colors.bg} rounded-full`}>
            {renderIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 
            id="modal-title"
            className="text-2xl font-bold text-gray-900 mb-3"
          >
            {title}
          </h2>
          <p 
            id="modal-description"
            className="text-gray-600 mb-6"
          >
            {message}
          </p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 ${colors.button} text-white font-medium rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            aria-label="Close and dismiss notification"
          >
            OK
          </button>

          {/* Auto-close indicator */}
          {autoCloseDelay > 0 && (
            <p className="text-xs text-gray-500 mt-4" role="status" aria-live="polite">
              This will close automatically in {autoCloseDelay / 1000} seconds
            </p>
          )}
        </div>

        {/* Screen reader announcement */}
        <div className="sr-only" role="status" aria-live="assertive" aria-atomic="true">
          {getAriaLabel()}: {title}. {message}
        </div>
      </div>

      <style>{`
        /* Screen reader only - visible only to screen readers */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ErrorModal;
