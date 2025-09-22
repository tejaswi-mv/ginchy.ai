import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getCreationsForUser, getUser } from '@/lib/db/queries';
import { CreationSkeleton, CreationCardSkeleton, DashboardSkeleton } from '@/components/ui/CreationSkeleton';
import { MyCreationsClient } from './MyCreationsClient';

type GeneratedImage = {
  id: number;
  prompt: string;
  imageUrl: string;
  createdAt: string;
};

async function MyCreationsContent() {
  const user = await getUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your creations</h1>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = await getCreationsForUser(user.id, 100);

  return <MyCreationsClient images={images} />;
}

export default function MyCreationsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <MyCreationsContent />
    </Suspense>
  );
}

