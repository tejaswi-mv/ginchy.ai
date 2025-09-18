'use client';

import React, { useMemo, useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Edit3,
  Image as ImageIcon,
  Menu,
  Plus,
  Search,
  Upload,
  Video,
  X
} from 'lucide-react';
import { getPublicImages, getUserAssets, uploadAsset } from '@/app/(login)/actions';
import { useActionState } from 'react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';


type EnvironmentPreset = {
  id: string;
  name: string;
  thumbnail: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// This component now handles both public and private assets
function AssetLibrary({ type, title }: { type: 'characters' | 'poses' | 'environment' | 'garments' | 'accessory', title: string }) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  const [assets, setAssets] = useState<{ name: string; url: string; }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadState, uploadAction] = useActionState<any, FormData>(uploadAsset, null);

  useEffect(() => {
    async function fetchAllAssets() {
      const publicResult = await getPublicImages(type);
      const publicData = publicResult.data || [];

      if (user) {
        const formData = new FormData();
        formData.append('type', type);
        // Using startTransition for the async action call
        startTransition(async () => {
            const userAssetsResult = await getUserAssets(null, formData);
            const userData = (userAssetsResult && userAssetsResult.data) ? userAssetsResult.data : [];
            setAssets([...publicData, ...userData]);
        });
      } else {
        setAssets(publicData);
      }
    }
    fetchAllAssets();
  }, [type, user, uploadState]); // Re-fetch when user changes or after an upload

  const handleUploadClick = () => {
    if (!user) {
      router.push('/sign-up');
    } else {
      document.getElementById(`file-upload-${type}`)?.click();
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      // Using startTransition to wrap the action
      startTransition(() => {
        uploadAction(formData);
      });
    }
  };

  const previewAssets = assets.slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {previewAssets.map((asset) => (
          <img
            key={asset.name}
            src={asset.url}
            className="aspect-square w-full rounded-md object-cover"
            alt={asset.name}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button onClick={handleUploadClick} variant="outline" className="h-8 border-[#009AFF]/30 text-neutral-200 hover:border-[#009AFF]/50" disabled={isPending}>
          <Upload className="mr-2 h-4 w-4" /> {isPending ? 'Uploading...' : 'Upload'}
          <input
            type="file"
            id={`file-upload-${type}`}
            className="sr-only"
            onChange={handleFileUpload}
            disabled={isPending}
          />
        </Button>
        <Button
          variant="ghost"
          className="h-8 text-neutral-300 hover:text-[#009AFF]"
          onClick={() => setIsModalOpen(true)}
        >
          View Library
        </Button>
      </div>
      {uploadState?.error && <p className="text-red-500 text-xs mt-2">{uploadState.error}</p>}
      {uploadState?.success && <p className="text-green-500 text-xs mt-2">{uploadState.success}</p>}
      <AssetLibraryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assets={assets}
        title={title}
      />
    </div>
  );
}

function AssetLibraryModal({
  open,
  onClose,
  assets,
  title
}: {
  open: boolean;
  onClose: () => void;
  assets: { name: string; url: string; }[];
  title: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(920px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#009AFF]/20 bg-neutral-950 p-4 shadow-2xl">
        <div className="flex items-center justify-between px-1 py-2">
          <div className="text-sm font-medium text-neutral-200">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#009AFF]/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[70vh] overflow-y-auto">
          {assets.map((asset) => (
            <button
              key={asset.name}
              type="button"
              onClick={() => { onClose(); }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 hover:border-[#009AFF]/50"
            >
              <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#009AFF]/20 rounded-xl overflow-hidden bg-neutral-900/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-200 hover:bg-[#009AFF]/10"
      >
        <span className="font-medium">{title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-2">{children}</div>}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 px-3 rounded-md text-sm border transition ${
        active
          ? 'bg-[#009AFF] text-white border-[#009AFF]'
          : 'bg-neutral-900/40 text-neutral-300 border-white/10 hover:bg-[#009AFF]/10 hover:border-[#009AFF]/30'
      }`}
    >
      {label}
    </button>
  );
}

function EnvironmentModal({
  open,
  onClose,
  onSelect,
  presets
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (preset: EnvironmentPreset) => void;
  presets: EnvironmentPreset[];
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, presets]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(920px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#009AFF]/20 bg-neutral-950 p-4 shadow-2xl">
        <div className="flex items-center justify-between px-1 py-2">
          <div className="text-sm font-medium text-neutral-200">Environment</div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#009AFF]/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative w-full">
            <Input
              placeholder="Search environment"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-neutral-900 border-white/10 text-neutral-200 placeholder:text-neutral-500 focus:border-[#009AFF]/50 focus:ring-[#009AFF]/20"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => undefined}
            className="aspect-[4/3] rounded-xl border border-dashed border-[#009AFF]/30 grid place-items-center text-neutral-400 hover:bg-[#009AFF]/5"
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-5 w-5" />
              <span className="text-xs">Upload</span>
            </div>
          </button>
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 hover:border-[#009AFF]/50"
            >
              <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
                <div className="text-[11px] font-medium text-neutral-200">{p.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryCard({ src }: { src: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#009AFF]/20 bg-neutral-900">
      <img src={src} alt="Generated" className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 top-0 flex items-center gap-2 p-2">
        <span className="rounded-md bg-black/70 px-2 py-1 text-[11px] text-neutral-200">S</span>
        <span className="rounded-md bg-black/70 px-2 py-1 text-[11px] text-neutral-200">HD</span>
        <span className="rounded-md bg-black/70 px-2 py-1 text-[11px] text-neutral-200">4:5</span>
      </div>
      <div className="absolute right-2 top-2 flex gap-2">
        <Button size="sm" variant="secondary" className="h-7 px-2 bg-black/70 text-white hover:bg-[#009AFF]/20">
          <Video className="h-3.5 w-3.5" />
          <span className="ml-1 text-xs">Video</span>
        </Button>
        <Button size="sm" variant="secondary" className="h-7 px-2 bg-black/70 text-white hover:bg-[#009AFF]/20">
          <Edit3 className="h-3.5 w-3.5" />
          <span className="ml-1 text-xs">Edit</span>
        </Button>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const [environmentOpen, setEnvironmentOpen] = useState(false);
  const [activeAR, setActiveAR] = useState('1:1');
  const [activeView, setActiveView] = useState<'front' | 'side' | 'bottom' | 'low' | 'close' | 'full'>('front');
  const [processor, setProcessor] = useState<'nano' | 'kling'>('nano');
  const envPresets: EnvironmentPreset[] = [
    { id: '3d', name: '3D', thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop' },
    { id: 'horror', name: 'Horror', thumbnail: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800&auto=format&fit=crop' },
    { id: 'scifi', name: 'Sci-fi', thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop' },
    { id: 'fantasy', name: 'Fantasy', thumbnail: 'https://images.unsplash.com/photo-1493799812874-113b93c2bdba?q=80&w=800&auto=format&fit=crop' },
    { id: 'vintage', name: 'Vintage', thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop' },
    { id: 'classic', name: 'Classic', thumbnail: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800&auto=format&fit=crop' },
    { id: 'watercolor', name: 'Water color', thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop' },
    { id: 'abstract', name: 'Abstract', thumbnail: 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=800&auto=format&fit=crop' },
    { id: 'cinematic', name: 'Cinematic', thumbnail: 'https://images.unsplash.com/photo-1495562569060-2eec283d3391?q=80&w=800&auto=format&fit=crop' }
  ];

  const gallery = [
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975922203-b044420e0b9a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=1200&auto=format&fit=crop'
  ];

  return (
    <main className="bg-gradient-to-br from-slate-900 via-blue-900 to-black text-neutral-100 min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar (left menu + controls) */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
            {/* App left menu */}
            <div className="rounded-2xl border border-[#009AFF]/20 bg-neutral-900/60">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#009AFF]/20">
                <div className="flex items-center gap-2">
                  <Menu className="h-4 w-4 text-neutral-400" />
                  
                </div>
              </div>
              <nav className="p-2">
                {[
                  { label: 'My creations', href: '#' },
                  { label: 'Profile', href: '#' },
                  { label: 'Settings', href: '#' }
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm text-neutral-200 hover:bg-[#009AFF]/10"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Generate panel */}
            <div className="rounded-2xl border border-[#009AFF]/20 bg-neutral-900/60 p-4 space-y-4">
              <div>
                <div className="text-sm font-semibold">Generate Images</div>
                <p className="mt-2 text-xs text-neutral-400">
                  Describe your image style (e.g., "red hoodie on tall male model")…
                </p>
                <textarea
                  rows={3}
                  placeholder="Describe your image style..."
                  className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950/60 p-3 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#009AFF]"
                />
                <Button variant="outline" className="mt-2 h-8 gap-2 border-[#009AFF]/30 text-neutral-200 hover:border-[#009AFF]/50">
                  <Upload className="h-4 w-4" /> Upload images
                </Button>
              </div>

              <CollapsibleSection title="Model" defaultOpen>
                <AssetLibrary type="characters" title="Model Library" />
              </CollapsibleSection>

              <CollapsibleSection title="Model Poses" defaultOpen>
                <AssetLibrary type="poses" title="Pose Library" />
              </CollapsibleSection>

              <CollapsibleSection title="Garment" defaultOpen>
                <AssetLibrary type="garments" title="Garment Library" />
              </CollapsibleSection>

              <CollapsibleSection title="Environment" defaultOpen>
                <AssetLibrary type="environment" title="Environment Library" />
              </CollapsibleSection>

              <CollapsibleSection title="Camera Settings">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'front', label: 'Front view' },
                    { id: 'side', label: 'Side view' },
                    { id: 'bottom', label: 'Bottom view' },
                    { id: 'low', label: 'Low angle' },
                    { id: 'close', label: 'Close up' },
                    { id: 'full', label: 'Full body' }
                  ].map((v) => (
                    <Chip
                      key={v.id}
                      label={v.label}
                      active={activeView === (v.id as any)}
                      onClick={() => setActiveView(v.id as any)}
                    />
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-neutral-400">
                  <div className="flex items-center gap-2"><Camera className="h-3.5 w-3.5" /> Wide angle — 10/24mm</div>
                  <div className="flex items-center gap-2"><Camera className="h-3.5 w-3.5" /> Standard — 50/90mm</div>
                  <div className="flex items-center gap-2"><Camera className="h-3.5 w-3.5" /> Long lens — 110/150mm</div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="AI Processor">
                <div className="flex items-center gap-2">
                  <Chip label="Nano Banana" active={processor === 'nano'} onClick={() => setProcessor('nano')} />
                  <Chip label="Kling" active={processor === 'kling'} onClick={() => setProcessor('kling')} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Aspect Ratio">
                <div className="flex flex-wrap gap-2">
                  {['1:1', '9:16', '16:9', '3:2', '2:3'].map((r) => (
                    <Chip key={r} label={r} active={activeAR === r} onClick={() => setActiveAR(r)} />
                  ))}
                </div>
              </CollapsibleSection>

              <div className="pt-1">
                <Button className="w-full bg-[#009AFF] text-white hover:brightness-95">Generate Image</Button>
                <div className="mt-1 text-right text-[11px] text-neutral-400">1 credit</div>
              </div>
            </div>
          </aside>

          {/* Main gallery */}
          <section className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-4">
            <div className="rounded-2xl border border-[#009AFF]/20 bg-neutral-900/60 p-4">
              <div className="text-sm font-medium text-neutral-300">Generated Images</div>
              <p className="mt-1 text-xs text-neutral-500">
                These are just examples. Describe a garment or style to try it yourself!
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <GalleryCard src={gallery[0]} />
                <GalleryCard src={gallery[1]} />
                <GalleryCard src={gallery[2]} />
                <GalleryCard src={gallery[3]} />
              </div>
            </div>
          </section>
        </div>
      </div>

      <EnvironmentModal
        open={environmentOpen}
        onClose={() => setEnvironmentOpen(false)}
        onSelect={() => setEnvironmentOpen(false)}
        presets={envPresets}
      />
    </main>
  );
}
