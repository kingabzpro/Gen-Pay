import { useState, useEffect } from 'react';
import { checkAuthStatus, createAccount } from '@/lib/appwrite/auth';
import { login as authLogin, logout as authLogout } from '@/lib/appwrite/auth';
import type { Models } from 'appwrite';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [current, setCurrent] = useState<Models.Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const login = async (email: string, password: string): Promise<void> => {
        try {
            setError(null);
            setLoading(true);
            
            // Clear any existing session first to prevent "session is active" error
            try {
                await authLogout();
            } catch (logoutError) {
                // Ignore logout errors - might not be logged in
                console.log('No existing session to clear');
            }
            
            const session = await authLogin(email, password);
            setCurrent(session);
            router.push('/dashboard');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (businessName: string, email: string, password: string): Promise<void> => {
        try {
            setError(null);
            setLoading(true);
            
            // Clear any existing session first
            try {
                await authLogout();
            } catch (logoutError) {
                // Ignore logout errors - might not be logged in
                console.log('No existing session to clear');
            }
            
            // Create the account
            await createAccount(email, password, businessName);
            
            // Automatically log in after successful registration
            const session = await authLogin(email, password);
            setCurrent(session);
            router.push('/dashboard');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            setError(null);
            await authLogout();
            setCurrent(null);
            router.push('/');
        } catch (error: unknown) {
            // Don't set error for logout failures, just log them
            console.error('Logout error:', error);
            // Still redirect even if logout fails
            setCurrent(null);
            router.push('/');
        }
    };

    const getCurrentUser = async () => {
        try {
            setLoading(true);
            const { isAuthenticated, user } = await checkAuthStatus();
            setCurrent(user || null);
        } catch (error: unknown) {
            console.error('Error getting current user:', error);
            setCurrent(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCurrentUser();
    }, []);

    return {
        current,
        loading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!current,
    };
}
