import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  licenseNo?: string;
  hasCompletedProfile?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (licenseNo: string) => Promise<void>;
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
      console.log('Fetching user data for:', user.uid);
      const userDocRef = doc(db, 'users', user.uid);
      
      // Try to get the document
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log('User document exists:', userDoc.data());
        const data = userDoc.data() as UserData;
        setUserData({
          ...data,
          hasCompletedProfile: data.hasCompletedProfile === true
        });
      } else {
        console.log('User document does not exist, creating new one');
        // Create initial user document
        const newUserData: UserData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          hasCompletedProfile: false
        };
        
        console.log('Creating user document with data:', newUserData);
        await setDoc(userDocRef, newUserData);
        setUserData(newUserData);
        console.log('User document created successfully');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // If permission error, create a local user data object
      if (error.code === 'permission-denied') {
        console.warn('Permission denied, using local user data');
        const localUserData: UserData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          hasCompletedProfile: false
        };
        setUserData(localUserData);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in successful:', result.user.uid);
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

  const updateUserProfile = async (licenseNo: string) => {
    if (!currentUser) {
      console.error('No current user');
      return;
    }
    
    try {
      console.log('Updating user profile for:', currentUser.uid);
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      const updateData = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || '',
        photoURL: currentUser.photoURL || '',
        licenseNo,
        hasCompletedProfile: true
      };
      
      console.log('Update data:', updateData);
      await setDoc(userDocRef, updateData, { merge: true });
      
      // Update local state
      setUserData(prev => prev ? {
        ...prev,
        licenseNo,
        hasCompletedProfile: true
      } : null);
      
      console.log('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.uid || 'No user');
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