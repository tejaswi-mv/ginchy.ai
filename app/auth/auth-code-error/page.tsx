'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'no_code':
        return 'No authorization code received from Google. Please try signing in again.';
      case 'code_exchange_failed':
        return 'Failed to exchange authorization code for session. Please try again.';
      case 'no_session':
        return 'No session was created after authentication. Please try again.';
      case 'no_email':
        return 'No email address found in your Google account. Please ensure your Google account has an email address.';
      case 'user_creation_failed':
        return 'Failed to create your account. Please try again.';
      case 'callback_error':
        return 'An error occurred during the authentication process. Please try again.';
      default:
        return 'An unknown error occurred during authentication. Please try again.';
    }
  };

  const getErrorTitle = (error: string | null) => {
    switch (error) {
      case 'no_code':
        return 'Missing Authorization Code';
      case 'code_exchange_failed':
        return 'Authentication Failed';
      case 'no_session':
        return 'Session Creation Failed';
      case 'no_email':
        return 'Email Required';
      case 'user_creation_failed':
        return 'Account Creation Failed';
      case 'callback_error':
        return 'Authentication Error';
      default:
        return 'Authentication Error';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-[var(--font-display)]">
            {getErrorTitle(error)}
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-300">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/sign-in"
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#009AFF] hover:bg-[#009AFF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009AFF] transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Try Again
          </Link>
          
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-neutral-700 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009AFF] transition-all duration-200"
          >
            Go Home
          </Link>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-neutral-900 rounded-lg border border-neutral-700">
            <p className="text-xs text-neutral-400 text-center">
              Error Code: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  );
}
