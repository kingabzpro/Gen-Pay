"use client";

import { useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut, signUp } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const { user } = await signIn(email, password);
      setUser(user);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const { user } = await signUp(email, password, fullName);
      setUser(user);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut();
      setUser(null);
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      setUser(null);
      router.push('/');
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}
