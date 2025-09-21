'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CreatePackshotPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild>
              <Link href="/generate">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Generate
              </Link>
            </Button>
          </div>
          
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
                <Camera className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Create Packshot</h1>
              <p className="text-xl text-neutral-400 mb-8">
                Generate professional product packshots for your fashion items
              </p>
            </div>
            
            <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Coming Soon</span>
              </div>
              <p className="text-neutral-400 mb-6">
                We're developing specialized AI tools for creating perfect product packshots.
              </p>
              <div className="space-y-3 text-sm text-neutral-500">
                <p>• Professional product photography</p>
                <p>• Consistent lighting and backgrounds</p>
                <p>• Multiple angle variations</p>
                <p>• E-commerce ready formats</p>
              </div>
            </div>
            
            <div className="mt-8">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/generate">Try Image Generation Instead</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
