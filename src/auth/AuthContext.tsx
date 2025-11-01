// auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

export type VerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  licenseNo?: string;
  signature?: string;
  professionalTitle?: string;
  hasCompletedProfile?: boolean;
  verificationStatus?: VerificationStatus;
  rejectionReason?: string;
  submittedAt?: string; // ISO timestamp
  verifiedAt?: string;  // ISO timestamp
  verifiedBy?: string;  // Admin UID
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (licenseNo: string, signature: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData({
          ...data,
          hasCompletedProfile: data.hasCompletedProfile === true,
          verificationStatus: data.verificationStatus || 'unverified'
        });
      } else {
        // Create initial user document
        const newUserData: UserData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          hasCompletedProfile: false,
          verificationStatus: 'unverified'
        };
        
        await setDoc(userDocRef, newUserData);
        setUserData(newUserData);
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      
      if (error.code === 'permission-denied') {
        console.warn('Permission denied, using local user data');
        const localUserData: UserData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          hasCompletedProfile: false,
          verificationStatus: 'unverified'
        };
        setUserData(localUserData);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await fetchUserData(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (licenseNo: string, signature: string) => {
    if (!currentUser) {
      console.error('No current user');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Determine new verification status
      // If user is resubmitting after rejection, set to pending
      // If first time submitting, set to pending
      const currentStatus = userData?.verificationStatus || 'unverified';
      const newStatus: VerificationStatus = 
        (currentStatus === 'rejected' || currentStatus === 'unverified') 
          ? 'pending' 
          : currentStatus;
      
      const updateData = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || '',
        photoURL: currentUser.photoURL || '',
        licenseNo,
        signature,
        hasCompletedProfile: true,
        verificationStatus: newStatus,
        submittedAt: new Date().toISOString(),
        // Clear rejection reason if resubmitting
        ...(currentStatus === 'rejected' && { rejectionReason: null })
      };
      
      await setDoc(userDocRef, updateData, { merge: true });
      
      // Update local state
      setUserData(prev => prev ? {
        ...prev,
        licenseNo,
        signature,
        hasCompletedProfile: true,
        verificationStatus: newStatus,
        submittedAt: updateData.submittedAt,
        ...(currentStatus === 'rejected' && { rejectionReason: undefined })
      } : null);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signInWithGoogle,
    signOut,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};