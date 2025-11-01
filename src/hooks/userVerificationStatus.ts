// hooks/useVerificationStatus.ts
import { useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';

export type VerificationState = 
  | 'unverified'      // No profile submitted
  | 'pending'         // Profile submitted, waiting for admin
  | 'approved'        // Admin approved
  | 'rejected';       // Admin rejected

export interface VerificationStatus {
  state: VerificationState;
  isVerified: boolean;
  isLoading: boolean;
  hasLicense: boolean;
  hasSignature: boolean;
  missingFields: string[];
  isPending: boolean;
  isRejected: boolean;
  rejectionReason?: string;
}

/**
 * Hook to check user verification status with admin approval
 * User flow: unverified → pending → approved/rejected
 */
export const useVerificationStatus = (): VerificationStatus => {
  const { userData, loading } = useAuth();

  const status = useMemo(() => {
    if (loading) {
      return {
        state: 'unverified' as VerificationState,
        isVerified: false,
        isLoading: true,
        hasLicense: false,
        hasSignature: false,
        missingFields: [],
        isPending: false,
        isRejected: false,
      };
    }

    if (!userData) {
      return {
        state: 'unverified' as VerificationState,
        isVerified: false,
        isLoading: false,
        hasLicense: false,
        hasSignature: false,
        missingFields: ['profile'],
        isPending: false,
        isRejected: false,
      };
    }

    const hasLicense = Boolean(userData.licenseNo?.trim());
    const hasSignature = Boolean(userData.signature?.trim());
    const missingFields: string[] = [];

    if (!hasLicense) missingFields.push('Medical License Number');
    if (!hasSignature) missingFields.push('Signature');

    // Determine verification state
    let state: VerificationState = 'unverified';
    
    if (userData.verificationStatus === 'approved') {
      state = 'approved';
    } else if (userData.verificationStatus === 'rejected') {
      state = 'rejected';
    } else if (userData.verificationStatus === 'pending' && hasLicense && hasSignature) {
      state = 'pending';
    } else if (hasLicense && hasSignature && !userData.verificationStatus) {
      // For backward compatibility - if they have data but no status, treat as pending
      state = 'pending';
    }

    return {
      state,
      isVerified: state === 'approved',
      isLoading: false,
      hasLicense,
      hasSignature,
      missingFields,
      isPending: state === 'pending',
      isRejected: state === 'rejected',
      rejectionReason: userData.rejectionReason,
    };
  }, [userData, loading]);

  return status;
};