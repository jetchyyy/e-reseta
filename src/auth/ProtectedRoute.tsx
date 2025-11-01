// auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import VerificationGuard from '../components/guards/VerificationGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

/**
 * Protected Route Component
 * - First checks authentication
 * - Then checks verification status (if required)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireVerification = true 
}) => {
  const { currentUser, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1FAEE] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1D3557] to-[#457B9D] rounded-2xl mb-6 shadow-lg">
            <svg 
              className="w-8 h-8 text-white animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <div className="w-12 h-12 border-4 border-[#A8DADC] border-t-[#1D3557] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#457B9D] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If authentication passed, check verification status
  return (
    <VerificationGuard requireVerification={requireVerification}>
      {children}
    </VerificationGuard>
  );
};

export default ProtectedRoute;