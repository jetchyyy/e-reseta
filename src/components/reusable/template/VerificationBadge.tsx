// components/ui/VerificationBadge.tsx
import React from 'react';
import { useVerificationStatus } from '../../../hooks/userVerificationStatus';

interface VerificationBadgeProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * Badge component showing user's verification status
 * Shows: Approved, Pending, Rejected, or Unverified
 */
const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  showDetails = false,
  className = ''
}) => {
  const { state, isLoading, rejectionReason } = useVerificationStatus();

  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-gray-600">Checking...</span>
      </div>
    );
  }

  // Approved State
  if (state === 'approved') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg ${className}`}>
        <div className="relative">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-0 animate-ping"></div>
        </div>
        <span className="text-xs font-semibold text-emerald-700">Verified</span>
        {showDetails && (
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )}
      </div>
    );
  }

  // Pending State
  if (state === 'pending') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-semibold text-blue-700">
          {showDetails ? 'Pending Approval' : 'Pending'}
        </span>
        {showDetails && (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
    );
  }

  // Rejected State
  if (state === 'rejected') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-xs font-semibold text-red-700">
          {showDetails ? 'Verification Rejected' : 'Rejected'}
        </span>
        {showDetails && rejectionReason && (
          <div className="group relative">
            <svg className="w-4 h-4 text-red-600 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50">
              {rejectionReason}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Unverified State
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg ${className}`}>
      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
      <span className="text-xs font-semibold text-amber-700">
        {showDetails ? 'Not Verified' : 'Unverified'}
      </span>
      {showDetails && (
        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )}
    </div>
  );
};

export default VerificationBadge;