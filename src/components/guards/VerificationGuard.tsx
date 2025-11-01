// components/guards/VerificationGuard.tsx
import React from 'react';
import { useVerificationStatus } from '../../hooks/userVerificationStatus';
import VerificationRequired from './VerificationRequired';

interface VerificationGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

/**
 * Component that checks if user is verified before allowing access
 * Shows verification prompt if user is not verified
 */
const VerificationGuard: React.FC<VerificationGuardProps> = ({ 
  children, 
  requireVerification = true 
}) => {
  const { isVerified, isLoading, missingFields } = useVerificationStatus();

  // If verification is not required, render children directly
  if (!requireVerification) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1FAEE] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#A8DADC] border-t-[#1D3557] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#457B9D] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show verification required screen if not verified
  if (!isVerified) {
    return <VerificationRequired missingFields={missingFields} />;
  }

  // User is verified, render protected content
  return <>{children}</>;
};

export default VerificationGuard;