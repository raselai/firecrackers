'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { getUserById } from '@/lib/userService';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useAdminAuth() {
  const { user, firebaseUser, loading, signIn, signOut } = useUser();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const isAuthenticated = useMemo(() => {
    return !!firebaseUser && user?.role === 'admin';
  }, [firebaseUser, user]);

  const status = useMemo(() => {
    if (loading) return 'loading';
    if (!firebaseUser) return 'unauthenticated';
    if (!user) return 'loading';
    return user.role === 'admin' ? 'authenticated' : 'unauthorized';
  }, [loading, firebaseUser, user]);

  useEffect(() => {
    if (loading) return;

    if (firebaseUser && user && user.role !== 'admin') {
      setAuthError('This account does not have admin access.');
    } else {
      setAuthError(null);
    }
  }, [firebaseUser, user, loading]);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    await signIn(email, password);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Login failed. Please try again.');
    }

    let profile = await getUserById(currentUser.uid);
    if (!profile) {
      // Give the auth listener a moment to create the profile if needed.
      await wait(250);
      profile = await getUserById(currentUser.uid);
    }

    if (!profile || profile.role !== 'admin') {
      await signOut();
      throw new Error('This account does not have admin access.');
    }

    return true;
  };

  const logout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return {
    isAuthenticated,
    loading,
    login,
    logout,
    authError,
    status
  };
}
