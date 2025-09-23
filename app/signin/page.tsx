'use client';

import { Suspense } from 'react';
import GoogleOAuthButton from '@/components/GoogleOAuthButton';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#009AFF] to-[#00D4FF] flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-[var(--font-display)]">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-300">
            Choose your preferred sign-in method
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <Suspense fallback={
            <div className="w-full flex items-center justify-center py-3 px-4 border border-neutral-700 rounded-lg bg-neutral-900 text-white">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#009AFF]"></div>
              <span className="ml-2">Loading...</span>
            </div>
          }>
            <GoogleOAuthButton />
          </Suspense>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

