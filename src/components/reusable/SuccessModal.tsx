import React, { useEffect } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  icon?: 'check' | 'celebration' | 'heart';
  autoCloseDelay?: number; // in milliseconds, 0 means no auto-close
  showConfetti?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = 'Success!',
  message = 'Your action was completed successfully.',
  icon = 'check',
  autoCloseDelay = 3000,
  showConfetti = false,
}) => {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (icon) {
      case 'check':
        return (
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'celebration':
        return (
          <svg
            className="w-16 h-16 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'heart':
        return (
          <svg
            className="w-16 h-16 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
        <div className="flex justify-center mb-6 animate-bounce-once">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
            {renderIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all transform hover:scale-105"
          >
            Continue
          </button>

          {/* Auto-close indicator */}
          {autoCloseDelay > 0 && (
            <p className="text-xs text-gray-500 mt-4">
              This will close automatically in {autoCloseDelay / 1000} seconds
            </p>
          )}
        </div>
      </div>

      <style>{`
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

        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;