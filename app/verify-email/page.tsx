'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Email verified successfully
          setIsVerified(true);
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Error checking session:', error);
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      router.push('/login');
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
              Verifying...
            </h1>
            <p className="text-center text-muted-foreground">
              Please wait while we verify your email
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
          {isVerified ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-center text-card-foreground mb-2">
                Email Verified!
              </h1>

              <p className="text-center text-muted-foreground mb-6">
                Your email has been successfully verified.
              </p>

              <button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors"
                onClick={handleSignIn}
              >
                Sign In to Continue
              </button>
            </>
          ) : (
            <>
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

              <h1 className="text-2xl font-bold text-center text-card-foreground mb-2">
                Check Your Email
              </h1>

              <p className="text-center text-muted-foreground mb-6">
                We've sent a confirmation link to your email address.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground text-center">
                  Click the link in the email to verify your account.
                  The link will expire in 24 hours.
                </p>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-800 text-red-300 rounded-lg p-4 mb-6">
                  <p className="text-sm text-center">{error}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or{' '}
                <Link href="/register" className="text-primary hover:underline">
                  try again
                </Link>
              </p>
            </>
          )}
        </div>

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
