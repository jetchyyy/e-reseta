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
          bg: 'bg-red-50',
          iconBg: 'bg-red-100',
          icon: 'text-red-600',
          button: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
          border: 'border-red-200',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          iconBg: 'bg-amber-100',
          icon: 'text-amber-600',
          button: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
          border: 'border-amber-200',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          icon: 'text-blue-600',
          button: 'bg-gradient-to-r from-[#1D3557] to-[#457B9D] hover:from-[#152841] hover:to-[#3d6c8a]',
          border: 'border-blue-200',
        };
      default:
        return {
          bg: 'bg-red-50',
          iconBg: 'bg-red-100',
          icon: 'text-red-600',
          button: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
          border: 'border-red-200',
        };
    }
  };

  const renderIcon = () => {
    const colors = getColorClasses();
    
    switch (errorType) {
      case 'error':
        return (
          <svg
            className={`w-8 h-8 ${colors.icon}`}
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
            className={`w-8 h-8 ${colors.icon}`}
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
            className={`w-8 h-8 ${colors.icon}`}
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={onClose} // Click backdrop to close
    >
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full p-8 md:p-10 relative animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-[#457B9D]/60 hover:text-[#1D3557] transition-colors focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:ring-offset-2 rounded-lg p-1.5"
          aria-label="Close notification"
        >
          <svg
            className="w-5 h-5"
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
          <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.iconBg} rounded-2xl border ${colors.border}`}>
            {renderIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 
            id="modal-title"
            className="text-2xl font-bold text-[#1D3557] mb-3 tracking-tight"
          >
            {title}
          </h2>
          <p 
            id="modal-description"
            className="text-[#457B9D] mb-8 leading-relaxed"
          >
            {message}
          </p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full px-6 py-3.5 ${colors.button} text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#457B9D]`}
            aria-label="Close and dismiss notification"
          >
            OK, Got it
          </button>

          {/* Auto-close indicator */}
          {autoCloseDelay > 0 && (
            <p className="text-xs text-[#457B9D]/70 mt-4" role="status" aria-live="polite">
              Closes automatically in {autoCloseDelay / 1000}s
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
