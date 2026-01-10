'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types/user';
import {
  createUserDocument,
  getUserById,
  updateUserProfile
} from '@/lib/userService';

const processReferralViaApi = async (
  firebaseUser: FirebaseUser,
  referralCode: string
): Promise<void> => {
  const token = await firebaseUser.getIdToken();
  const response = await fetch('/api/referrals/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ referralCode })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = data?.error || 'Failed to process referral';
    throw new Error(message);
  }
};

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, referralCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (referralCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseAuthUser: FirebaseUser): Promise<User | null> => {
    try {
      const userData = await getUserById(firebaseAuthUser.uid);
      if (userData) {
        return userData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    try {
      if (!firebaseAuthUser.email) {
        return null;
      }

      const createdUser = await createUserDocument(
        firebaseAuthUser.uid,
        firebaseAuthUser.email,
        firebaseAuthUser.displayName || 'User'
      );
      return createdUser;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    referralCode?: string
  ): Promise<void> => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName });

      // Create Firestore user document
      await createUserDocument(
        firebaseUser.uid,
        email,
        displayName
      );

      // Process referral if code was provided
      if (referralCode) {
        try {
          await processReferralViaApi(firebaseUser, referralCode);
        } catch (error) {
          console.error('Error processing referral:', error);
          // Don't throw error - user is created successfully
        }
      }

      // Send email verification
      await sendEmailVerification(firebaseUser);

      console.log('User signed up successfully:', firebaseUser.uid);
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (referralCode?: string): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = userCredential;

      // Check if user document exists
      const existingUser = await getUserById(firebaseUser.uid);

      if (!existingUser) {
        // New user - create Firestore document
        await createUserDocument(
          firebaseUser.uid,
          firebaseUser.email!,
          firebaseUser.displayName || 'User'
        );

        // Process referral if code was provided
        if (referralCode) {
          try {
            await processReferralViaApi(firebaseUser, referralCode);
          } catch (error) {
            console.error('Error processing referral:', error);
          }
        }
      }

      console.log('User signed in with Google successfully:', firebaseUser.uid);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  // Update user profile
  const updateProfileFunc = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');

      await updateUserProfile(user.uid, updates);

      // Refresh user data
      await refreshUser();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  // Refresh user data from Firestore
  const refreshUser = async (): Promise<void> => {
    try {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user data from Firestore or create a profile if missing.
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile: updateProfileFunc,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within AuthContextProvider');
  }
  return context;
}

