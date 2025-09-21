'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#009AFF] px-6 py-3 text-white text-sm font-semibold hover:bg-[#009AFF]/90 transition-all duration-200 shadow-[0_0_0_6px_rgba(0,154,255,0.12)] hover:shadow-[0_0_0_8px_rgba(0,154,255,0.18)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          Processing...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
