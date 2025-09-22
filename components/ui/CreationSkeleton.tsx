import React from 'react';

export function CreationSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-lg bg-neutral-800 animate-pulse">
          <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function CreationCardSkeleton() {
  return (
    <div className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-900">
      <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-800 animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="h-4 bg-neutral-600 rounded animate-pulse mb-2" />
        <div className="h-3 bg-neutral-700 rounded animate-pulse w-2/3" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-32 bg-neutral-800 rounded animate-pulse" />
            <div>
              <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-32 bg-neutral-800 rounded animate-pulse" />
        </div>
        <CreationSkeleton />
      </div>
    </div>
  );
}
