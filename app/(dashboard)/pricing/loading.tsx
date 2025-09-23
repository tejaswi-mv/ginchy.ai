// ginchy.ai/app/(dashboard)/pricing/loading.tsx

export default function Loading() {
  return (
    <main className="min-h-screen bg-black text-white p-16">
      <div className="max-w-7xl mx-auto text-center">
        {/* Title Skeleton */}
        <div className="h-10 w-96 bg-neutral-800 rounded mx-auto mb-4 animate-pulse"></div>
        {/* Subtitle Skeleton */}
        <div className="h-4 w-64 bg-neutral-800 rounded mx-auto mb-16 animate-pulse"></div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pricing Card Skeleton 1 */}
          <div className="h-[450px] bg-neutral-900 border border-neutral-700 rounded-2xl p-6 animate-pulse"></div>
          {/* Pricing Card Skeleton 2 (Popular Style) */}
          <div className="h-[450px] bg-gradient-to-br from-neutral-900 to-black border-2 border-[#009AFF] rounded-2xl p-6 animate-pulse"></div>
        </div>
      </div>
    </main>
  );
}
