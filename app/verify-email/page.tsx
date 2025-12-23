'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // User is now authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // No session yet, wait for user to confirm email
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Error checking session:', error);
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push('/dashboard');
      } else {
        setError('Email not confirmed yet. Please check your inbox and click the confirmation link.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error checking session:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8 backdrop-blur-md">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-card-foreground mb-2">
              Checking Confirmation...
            </h1>
            <p className="text-center text-muted-foreground">
              Verifying your email confirmation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border border-border p-8 backdrop-blur-md">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-center text-card-foreground mb-2">
            Check Your Email
          </h1>

          {/* Subheading */}
          <p className="text-center text-muted-foreground mb-6">
            We've sent a confirmation link to your email address.
          </p>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground text-center">
              Please click the link in the email to activate your account.
              The link will expire in 24 hours.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-center">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRefresh}
              disabled={loading}
            >
              I've confirmed my email
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or{' '}
              <Link href="/register" className="text-primary hover:underline">
                try again
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
