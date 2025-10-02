'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  Sparkles,
  Loader2,
  Settings,
  Camera,
  Plus,
  Search,
  ArrowLeft,
  User as UserIcon,
  Accessibility,
  Shirt,
  Globe,
  Ratio,
  Trash2,
  Play,
  Square,
  Image as ImageIcon,
  Video,
  Aperture,
  Film,
  Package,
  Layers,
  Check,
  
} from 'lucide-react';
import { getPublicImages, getUserAssets, uploadAsset, generateImage, deleteAsset, createCharacter, upscaleImage } from '@/app/(login)/actions';
import { useActionState } from 'react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileDropdown from '@/components/ProfileDropdown';
import BillingPage from '@/components/BillingPage';

type Asset = {
  name: string;
  url: string;
  isOwner?: boolean;
  metadata?: string;
};

type AssetType = 'characters' | 'poses' | 'environment' | 'garments' | 'accessory';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ================== SIDEBAR COMPONENTS ==================

function AssetPreview({
  type,
  onSelect,
  onOpenLibrary,
  selectedAsset,
  onOpenCreateCharacter,
}: {
  type: AssetType;
  onSelect: (asset: Asset) => void;
  onOpenLibrary: () => void;
  selectedAsset: Asset | null;
  onOpenCreateCharacter?: () => void;
}) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAssetsLoading, setIsAssetsLoading] = useState(true);
  const [uploadState, uploadAction, isUploading] = useActionState<any, FormData>(uploadAsset, null);
  const [isPending, startTransition] = useTransition();

  const fetchPublicAssets = async () => {
    // FAST path: Load public assets immediately with caching
    try {
      const publicResult = await getPublicImages(type, 6);
      setAssets(publicResult.data || []);
      setIsAssetsLoading(false); 
    } catch (error) {
      console.error('Error loading public assets:', error);
      setIsAssetsLoading(false);
    }
  };

  const fetchUserAssetsOnly = async () => {
    if (!user) return; // Only run if user is logged in
    
    try {
      // SLOW path: Fetch user assets with error handling
      const formData = new FormData();
      formData.append('type', type);
      formData.append('limit', '6');
      const userAssetsResult = await getUserAssets({}, formData);
      const userData = (userAssetsResult && 'data' in userAssetsResult && userAssetsResult.data) ? userAssetsResult.data : [];

      // Merge user assets with public, prioritize user assets
      setAssets(prevPublic => [...userData, ...prevPublic.filter(a => !userData.find(u => u.url === a.url))].slice(0, 6));
    } catch (error) {
      console.error('Error loading user assets:', error);
    }
  };

  // Effect 1: Loads fast public assets on mount/type change
  useEffect(() => {
    fetchPublicAssets();
  }, [type]);

  // Effect 2: Triggers the slow user fetch only when the SWR hook resolves
  useEffect(() => {
    if (user) {
      fetchUserAssetsOnly();
    } else if (user === null) {
      // If user is definitively null (logged out), stop loading
      setIsAssetsLoading(false); 
    }
  }, [user, type, uploadState]);

  const handleUploadClick = () => {
    if (!user) {
      router.push('/sign-up');
    } else if (type === 'characters' && onOpenCreateCharacter) {
      // For characters, open the create character modal
      onOpenCreateCharacter();
    } else {
      // For other types, use direct file upload
      document.getElementById(`file-upload-${type}`)?.click();
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      startTransition(() => uploadAction(formData));
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Asset Display */}
      {selectedAsset && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md border border-primary/30 overflow-hidden flex-shrink-0">
              <Image 
                src={selectedAsset.url} 
                alt={selectedAsset.name} 
                width={48} 
                height={48} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{selectedAsset.name}</p>
              <p className="text-xs text-neutral-400">Currently selected</p>
            </div>
            <Button 
              onClick={onOpenLibrary} 
              variant="outline" 
              size="sm"
              className="text-xs border-primary/30 text-primary hover:bg-primary/10"
            >
              Change
            </Button>
          </div>
        </div>
      )}

      {/* Asset Grid - 6 images in single horizontal row */}
      <div className="grid grid-cols-6 gap-3">
        {isAssetsLoading ? (
          // Show skeleton placeholder when loading
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square w-full rounded-lg bg-neutral-800 animate-pulse">
              <div className="w-full h-full bg-neutral-600/30 rounded-lg"></div>
            </div>
          ))
        ) : (
          // Show real assets when loaded
          assets.map((asset, index) => (
            <button 
              key={asset.name} 
              type="button" 
              onClick={() => onSelect(asset)}
              className={`relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all duration-200 group ${
                selectedAsset?.url === asset.url 
                  ? 'border-primary ring-2 ring-primary/30 shadow-lg' 
                  : 'border-neutral-700 hover:border-primary/50 hover:shadow-md'
              }`}
            >
              <Image 
                src={asset.url} 
                alt={asset.name} 
                fill 
                className="object-cover transition-transform duration-200 group-hover:scale-105" 
                quality={75}
                sizes="(max-width: 768px) 16vw, (max-width: 1200px) 12vw, 10vw"
                priority={index < 3}
                loading={index < 3 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              {selectedAsset?.url === asset.url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))
        )}
      </div>
      
      {/* Professional Action Buttons */}
      <div className="flex items-center gap-3">
        <Button 
          onClick={handleUploadClick} 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 transition-colors"
          disabled={isUploading || isPending}
        >
          <Upload className="mr-2 h-4 w-4" /> 
          {isUploading || isPending ? 'Uploading...' : 'Upload'}
        </Button>
        <Button 
          onClick={onOpenLibrary} 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 transition-colors"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          View Library
        </Button>
      </div>
      <input type="file" id={`file-upload-${type}`} className="hidden" onChange={handleFileUpload} accept="image/*" />
      {uploadState?.error && <p className="text-red-500 text-xs mt-1">{uploadState.error}</p>}
      {uploadState?.success && <p className="text-green-500 text-xs mt-1">{uploadState.success}</p>}
    </div>
  );
}

function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false, 
  icon: Icon, 
  selectedAsset, 
  onClearSelection 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean; 
  icon: React.ElementType;
  selectedAsset?: Asset | null;
  onClearSelection?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-neutral-800">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-sm text-neutral-200 hover:bg-neutral-800/50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Icon className="h-5 w-5 text-neutral-400 flex-shrink-0" />
          <span className="font-medium truncate">{title}</span>
          {selectedAsset && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-6 h-6 rounded border border-primary/30 overflow-hidden">
                <Image 
                  src={selectedAsset.url} 
                  alt={selectedAsset.name} 
                  width={24} 
                  height={24} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-primary font-medium truncate max-w-20">
                {selectedAsset.name}
              </span>
              {onClearSelection && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSelection();
                  }}
                  className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  title="Clear selection"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onClearSelection();
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </div>
              )}
            </div>
          )}
        </div>
        {open ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
      </button>
      {open && <div className="p-3 pt-0">{children}</div>}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`h-8 px-3 rounded-md text-sm border transition ${active ? 'bg-primary text-white border-primary' : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'}`}>
      {label}
    </button>
  );
}

// ================== MODAL COMPONENTS ==================

function AddNewCharacterView({ onBack }: { onBack: () => void }) {
    const goodExamples = ["/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg", "/images/freepik__a-full-shot-of-a-smiling-black-man-around-24-years__34269.jpeg", "/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png", "/images/woman v2.png", "/images/romain.gn_A_hand_holding_a_phone_--ar_5877_--raw_--profile_h5_5161a1f7-02d7-43a3-afd2-b77925b50fab_0.png"];
    const badExamples = ["/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53455 (1).png", "/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png", "/images/freepik__we-see-in-derset-with-a-new-pose__53446 (1).png", "/images/freepik__we-see-in-new-york-with-a-new-pose__53447 (1).png", "/images/freepik__we-see-her-in-snow-enviorment-with-a-new-pose__53458 (1).png"];
    
    const [createState, createAction, isCreating] = useActionState<any, FormData>(createCharacter, null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);
    };

    const handleSubmit = (formData: FormData) => {
        // Add selected files to form data
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });
        createAction(formData);
    };

    return (
        <div>
            <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-neutral-200">✅ Upload 5+ photos for best results</h4>
                        <p className="text-sm text-neutral-400 mt-1">Upload high-quality images of one person. The more images you provide, the better the result - show different angles, clear facial expressions, and consistent identity.</p>
                        <div className="grid grid-cols-5 gap-2 mt-3">
                            {goodExamples.map(src => <Image key={src} src={src} alt="Good example" width={100} height={100} className="rounded-md object-cover aspect-square" />)}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-neutral-200">❌ Avoid these types of photos</h4>
                        <p className="text-sm text-neutral-400 mt-1">No duplicates, group shots, pets, nudes, filters, face-covering accessories, or masks.</p>
                         <div className="grid grid-cols-5 gap-2 mt-3">
                            {badExamples.map(src => <Image key={src} src={src} alt="Bad example" width={100} height={100} className="rounded-md object-cover aspect-square" />)}
                        </div>
                    </div>
                </div>
                <div className="bg-neutral-900 p-6 rounded-lg">
                    <h4 className="font-bold text-lg text-neutral-100">Create your character</h4>
                    <form action={handleSubmit} className="space-y-4 mt-4">
                        <Input name="name" placeholder="Name" className="bg-neutral-800 border-neutral-700" required/>
                        <select name="gender" className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-sm text-neutral-200" required>
                            <option value="">Select the gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non-binary">Non-binary</option>
                        </select>
                        <Input name="available_models" placeholder="Available models" className="bg-neutral-800 border-neutral-700"/>
                        <div className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center">
                            <p className="text-neutral-300">Drag and drop images or <Button variant="link" asChild><label htmlFor="file-upload-modal" className="cursor-pointer">browse</label></Button></p>
                            <p className="text-xs text-neutral-500 mt-1">(5 images minimum)</p>
                            <input 
                                id="file-upload-modal" 
                                type="file" 
                                multiple 
                                className="sr-only" 
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                            {selectedFiles.length > 0 && (
                                <p className="text-sm text-primary mt-2">{selectedFiles.length} files selected</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isCreating}>
                            {isCreating ? 'Creating character...' : 'Create your character'}
                        </Button>
                        {createState?.error && <p className="text-red-500 text-xs">{createState.error}</p>}
                        {createState?.success && <p className="text-green-500 text-xs">{createState.success}</p>}
                        <p className="text-xs text-neutral-500 text-center">Your custom character and all your generations are private and will not be used to train any datasets. By submitting, you agree to our <a href="#" className="underline">Terms of Service</a>.</p>
                    </form>
                </div>
            </div>
        </div>
    );
}

function AssetLibraryModal({ open, onClose, type, onSelect, onDelete }: { open: boolean; onClose: () => void; type: AssetType | null; onSelect: (asset: Asset) => void; onDelete: (asset: Asset) => void; }) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'library' | 'create'>('library');
  const [assets, setAssets] = useState<Asset[]>([]);
  const { data: user } = useSWR<User>('/api/user', fetcher);

  // Define filter tabs based on asset type
  const getFilterTabs = (assetType: AssetType) => {
    switch (assetType) {
      case 'characters':
        return ['All', 'My Characters', 'Female', 'Male'];
      case 'poses':
        return ['All', 'My Poses', 'Single', 'Static', 'Sitting', 'Expressive', 'Standing', 'Action', 'Close-up'];
      case 'garments':
        return ['All', 'My Garments', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories'];
      case 'environment':
        return ['All', 'My Environments', 'Studio', 'Outdoor', 'Indoor', 'Urban', 'Natural'];
      default:
        return ['All', 'My Assets'];
    }
  };

  useEffect(() => {
    async function fetchAssets() {
      if (!type) return;
      const publicResult = await getPublicImages(type, 100);
      const publicData = publicResult.data || [];
      if (user) {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('limit', '100');
        const userAssetsResult = await getUserAssets({}, formData);
        const userData = (userAssetsResult && 'data' in userAssetsResult && userAssetsResult.data) ? userAssetsResult.data : [];
        setAssets([...userData, ...publicData]);
      } else {
        setAssets(publicData);
      }
    }
    if (open) {
      setActiveTab('all');
      fetchAssets();
    }
  }, [open, type, user]);

  const filteredAssets = useMemo(() => {
    let filtered = assets.filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply category filters
    if (activeTab === 'My Characters' || activeTab === 'My Poses' || activeTab === 'My Garments' || activeTab === 'My Environments') {
      filtered = filtered.filter(asset => asset.isOwner);
    } else if (activeTab !== 'All') {
      // Filter by metadata or other criteria
      filtered = filtered.filter(asset => {
        const metadata = asset.metadata ? JSON.parse(asset.metadata) : {};
        return metadata.gender === activeTab.toLowerCase() || 
               metadata.category === activeTab.toLowerCase() ||
               asset.name.toLowerCase().includes(activeTab.toLowerCase());
      });
    }
    
    return filtered;
  }, [assets, activeTab, searchQuery]);
  
  if (!open || !type) return null;

  const filterTabs = getFilterTabs(type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-[min(1024px,92vw)] rounded-2xl border border-primary/20 bg-neutral-900 p-6 shadow-2xl">
        <button type="button" onClick={() => { setView('library'); onClose(); }} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-primary/10" aria-label="Close"><X className="h-5 w-5" /></button>
        {view === 'library' ? (
          <>
            <h3 className="text-xl font-bold text-neutral-100 capitalize">{type}</h3>
            <div className="flex items-center gap-4 border-b border-neutral-800 mt-4 overflow-x-auto">
              {filterTabs.map(tab => (
                 <button 
                   key={tab} 
                   className={`py-2 text-sm whitespace-nowrap ${activeTab === tab ? 'text-white border-b-2 border-white' : 'text-neutral-400 hover:text-white'}`}
                   onClick={() => setActiveTab(tab)}
                 >
                   {tab}
                 </button>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input placeholder={`Search ${type}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-neutral-800 border-neutral-700 pl-9"/>
              </div>
              {type === 'characters' && (
                <Button onClick={() => setView('create')} className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> New Character
                </Button>
              )}
            </div>
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {filteredAssets.map(asset => (
                <div key={asset.url} className="relative group text-center">
                  <button type="button" onClick={() => onSelect(asset)} className="group relative w-full aspect-square overflow-hidden rounded-xl border border-neutral-700 hover:border-primary transition">
                    <Image src={asset.url} alt={asset.name} fill className="object-cover transition-transform group-hover:scale-105" />
                    {asset.isOwner && <button onClick={(e) => { e.stopPropagation(); onDelete(asset); }} className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full hover:bg-red-500 transition-colors"><Trash2 className="h-3 w-3 text-white" /></button>}
                  </button>
                  <p className="text-xs text-neutral-400 mt-1 truncate">{asset.name.split('.')[0]}</p>
                </div>
              ))}
            </div>
          </>
        ) : <AddNewCharacterView onBack={() => setView('library')} />}
      </div>
    </div>
  );
}


// ================== MAIN PAGE COMPONENT ==================

export default function GeneratePage() {
  const [selectedModel, setSelectedModel] = useState<Asset | null>(null);
  const [selectedPose, setSelectedPose] = useState<Asset | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<Asset | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Asset | null>(null);
  
  const [activeLibrary, setActiveLibrary] = useState<AssetType | null>(null);
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [generateState, generateAction, isGenerating] = useActionState<any, FormData>(generateImage, null);
  
  const { data: user, mutate: mutateUser } = useSWR<User>('/api/user', fetcher);

  const [cameraView, setCameraView] = useState<string | null>(null);
  const [lensAngle, setLensAngle] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [processor, setProcessor] = useState<'Nano Banana' | 'Kling' | 'Gemini' | 'OpenAI DALL-E'>('Nano Banana');
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false);
  const [imagesToGenerate, setImagesToGenerate] = useState<number>(4);
  const [upscaleState, upscaleAction, isUpscaling] = useActionState<any, FormData>(upscaleImage, null);

  const handleUpscale = (imageUrl: string) => {
    const formData = new FormData();
    formData.append('imageUrl', imageUrl);
    formData.append('scale', '2');
    upscaleAction(formData);
  };

  const handleGenerate = (formData: FormData) => {
    formData.append('modelUrl', selectedModel?.url || '');
    formData.append('poseUrl', selectedPose?.url || '');
    formData.append('garmentUrl', selectedGarment?.url || '');
    formData.append('environmentUrl', selectedEnvironment?.url || '');
    formData.append('cameraView', cameraView || '');
    formData.append('lensAngle', lensAngle || '');
    formData.append('aspectRatio', aspectRatio);
    formData.append('processor', processor);
    generateAction(formData);
  };
  
  useEffect(() => {
    if (generateState?.success && generateState.imageUrl) {
      setGallery(prev => [generateState.imageUrl, ...prev]);
      if(user) mutateUser({ ...user, credits: (user.credits || 0) - 1 }, false);
    }
    if (generateState?.error) alert(`Generation failed: ${generateState.error}`);
  }, [generateState, user, mutateUser]);

  useEffect(() => {
    if (upscaleState?.success && upscaleState.upscaledUrl) {
      setGallery(prev => [upscaleState.upscaledUrl, ...prev]);
      if(user) mutateUser({ ...user, credits: upscaleState.remainingCredits }, false);
      alert(`Image upscaled successfully! Used ${upscaleState.creditsUsed} credits.`);
    }
    if (upscaleState?.error) alert(`Upscaling failed: ${upscaleState.error}`);
  }, [upscaleState, user, mutateUser]);

  const assetCategories = [
    { 
      type: 'characters' as AssetType, 
      title: 'Character', 
      selected: selectedModel, 
      setter: setSelectedModel, 
      icon: UserIcon,
      onClear: () => setSelectedModel(null)
    },
    { 
      type: 'poses' as AssetType, 
      title: 'Poses', 
      selected: selectedPose, 
      setter: setSelectedPose, 
      icon: Accessibility,
      onClear: () => setSelectedPose(null)
    },
    { 
      type: 'garments' as AssetType, 
      title: 'Garment', 
      selected: selectedGarment, 
      setter: setSelectedGarment, 
      icon: Shirt,
      onClear: () => setSelectedGarment(null)
    },
    { 
      type: 'environment' as AssetType, 
      title: 'Environment', 
      selected: selectedEnvironment, 
      setter: setSelectedEnvironment, 
      icon: Globe,
      onClear: () => setSelectedEnvironment(null)
    },
  ];

  const handleSelectAsset = (asset: Asset) => {
    switch(activeLibrary) {
      case 'characters': setSelectedModel(asset); break;
      case 'poses': setSelectedPose(asset); break;
      case 'garments': setSelectedGarment(asset); break;
      case 'environment': setSelectedEnvironment(asset); break;
    }
    setActiveLibrary(null);
  };

  const handleDeleteAsset = async (asset: Asset) => {
      if (!activeLibrary) return;
      if (window.confirm(`Delete ${asset.name}? This cannot be undone.`)) {
          const formData = new FormData();
          formData.append('type', activeLibrary);
          formData.append('fileName', asset.name);
          await deleteAsset({}, formData);
          // Force a re-fetch in the modal
          setActiveLibrary(null); 
          setTimeout(() => setActiveLibrary(assetCategories.find(c => c.type === activeLibrary)?.type!), 50);
      }
  }

  return (
    <ErrorBoundary>
      <main className="bg-black text-neutral-100 min-h-[calc(100vh-64px)]">
        {/* Navigation Menu */}
        <div className="border-b border-neutral-800 bg-neutral-950/60">
          <div className="w-full px-4 py-2">
            <div className="flex items-center justify-between mb-5">
              <Link href="/" className="text-white font-extrabold tracking-wide text-xl md:text-2xl mr-4 hover:text-neutral-300 transition-colors">
                GINCHY
              </Link>
              {user && <ProfileDropdown user={user} onBillingClick={() => setShowBilling(true)} />}
            </div>
            <div className="mt-0 mb-3 md:mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button type="button" className="flex items-center h-14 w-full rounded-xl bg-neutral-900/70 border border-neutral-800 text-white px-5 shadow-inner hover:bg-neutral-900 text-base font-medium">
                  <Aperture className="mr-3 h-5 w-5 text-neutral-300" />
                  <span className="truncate">Create an image</span>
              </button>
                <Link href="/create-video" className="flex items-center h-14 w-full rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900 px-5 shadow-inner text-base font-medium">
                  <Film className="mr-3 h-5 w-5 text-neutral-300" />
                  <span className="truncate">Create a video</span>
              </Link>
                <Link href="/create-packshot" className="flex items-center h-14 w-full rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900 px-5 shadow-inner text-base font-medium">
                  <Package className="mr-3 h-5 w-5 text-neutral-300" />
                  <span className="truncate">Create packshot</span>
              </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 h-full">
          <aside className="col-span-12 lg:col-span-3 border-r border-neutral-800 bg-neutral-900/50 p-4">
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-2 overflow-y-auto">
                <div className="px-3 pt-1 pb-2 border-b border-neutral-800">
                  <span className="text-xs text-neutral-400">My Creations</span>
                  <span className="mx-2 text-neutral-600">/</span>
                  <span className="text-xs text-neutral-300">Generate Images</span>
                </div>
                <h2 className="text-lg font-semibold text-neutral-100 mt-2 mb-2 px-3">Generate Images</h2>
                <form id="generate-form" action={handleGenerate} className="space-y-3 px-3">
                  <textarea name="prompt" rows={4} placeholder="Describe your image style (e.g., 'red hoodie on tall male model')..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary" required />
                  <Button type="button" variant="outline" className="w-full justify-start text-neutral-300 border-neutral-700 hover:bg-neutral-800 rounded-xl">
                    <Upload className="mr-2 h-4 w-4" /> Upload Images
                  </Button>
                </form>
                
                {/* Selected Assets Summary */}
                {(selectedModel || selectedPose || selectedGarment || selectedEnvironment) && (
                  <div className="mx-3 mb-4 p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                    <h3 className="text-sm font-medium text-neutral-200 mb-2">Selected Assets</h3>
                    <div className="space-y-2">
                      {selectedModel && (
                        <div className="flex items-center gap-2 text-xs">
                          <UserIcon className="h-3 w-3 text-neutral-400" />
                          <span className="text-neutral-300">Character:</span>
                          <span className="text-primary truncate">{selectedModel.name}</span>
                          <div 
                            onClick={() => setSelectedModel(null)}
                            className="ml-auto p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedModel(null);
                              }
                            }}
                          >
                            <X className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                      {selectedPose && (
                        <div className="flex items-center gap-2 text-xs">
                          <Accessibility className="h-3 w-3 text-neutral-400" />
                          <span className="text-neutral-300">Pose:</span>
                          <span className="text-primary truncate">{selectedPose.name}</span>
                          <div 
                            onClick={() => setSelectedPose(null)}
                            className="ml-auto p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedPose(null);
                              }
                            }}
                          >
                            <X className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                      {selectedGarment && (
                        <div className="flex items-center gap-2 text-xs">
                          <Shirt className="h-3 w-3 text-neutral-400" />
                          <span className="text-neutral-300">Garment:</span>
                          <span className="text-primary truncate">{selectedGarment.name}</span>
                          <div 
                            onClick={() => setSelectedGarment(null)}
                            className="ml-auto p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedGarment(null);
                              }
                            }}
                          >
                            <X className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                      {selectedEnvironment && (
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className="h-3 w-3 text-neutral-400" />
                          <span className="text-neutral-300">Environment:</span>
                          <span className="text-primary truncate">{selectedEnvironment.name}</span>
                          <div 
                            onClick={() => setSelectedEnvironment(null)}
                            className="ml-auto p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedEnvironment(null);
                              }
                            }}
                          >
                            <X className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedModel(null);
                        setSelectedPose(null);
                        setSelectedGarment(null);
                        setSelectedEnvironment(null);
                      }}
                      className="mt-2 text-xs text-neutral-400 hover:text-neutral-200 underline"
                    >
                      Clear all selections
                    </button>
                  </div>
                )}

                <div className="border border-neutral-800 rounded-lg">
                  {assetCategories.map((category, index) => (
                    <CollapsibleSection 
                      key={category.type} 
                      title={category.title} 
                      defaultOpen={index < 2} 
                      icon={category.icon}
                      selectedAsset={category.selected}
                      onClearSelection={category.onClear}
                    >
                      <AssetPreview 
                        type={category.type} 
                        onSelect={(asset) => category.setter(asset)} 
                        onOpenLibrary={() => setActiveLibrary(category.type)} 
                        selectedAsset={category.selected}
                        onOpenCreateCharacter={category.type === 'characters' ? () => setShowCreateCharacter(true) : undefined}
                      />
                    </CollapsibleSection>
                  ))}
                   <CollapsibleSection title="Camera Settings" icon={Camera}>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xs font-medium text-neutral-400 mb-3">Camera</h3>
                          <div className="space-y-2">
                            {/* Row 1: Front view, Side view */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setCameraView('Front view')}
                                className={`h-8 px-3 rounded-md text-sm border transition ${
                                  cameraView === 'Front view' 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                                }`}
                              >
                                Front view
                              </button>
                              <button
                                type="button"
                                onClick={() => setCameraView('Side view')}
                                className={`h-8 px-3 rounded-md text-sm border transition ${
                                  cameraView === 'Side view' 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                                }`}
                              >
                                Side view
                              </button>
                            </div>
                            {/* Row 2: Back view, Bottom view */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setCameraView('Back view')}
                                className={`h-8 px-3 rounded-md text-sm border transition ${
                                  cameraView === 'Back view' 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                                }`}
                              >
                                Back view
                              </button>
                              <button
                                type="button"
                                onClick={() => setCameraView('Bottom view')}
                                className={`h-8 px-3 rounded-md text-sm border transition ${
                                  cameraView === 'Bottom view' 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                                }`}
                              >
                                Bottom view
                              </button>
                            </div>
                            {/* Row 3: Low angle, Close up, Full body */}
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setCameraView('Low angle')}
                                className={`h-8 px-3 rounded-md text-sm border transition ${
                                  cameraView === 'Low angle' 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                                }`}
                              >
                                Low angle
                              </button>
                              <button
                                type="button"
                                onClick={() => setCameraView('Close up')}
                                className={`h-8 px-3 rounded-md text-sm border transition ${
                                  cameraView === 'Close up' 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                                }`}
                              >
                                Close up
                              </button>
                              <button
                                type="button"
                                onClick={() => setCameraView('Full body')}
                                className={`h-8 px-3 rounded-md text-sm border transition ${
                                  cameraView === 'Full body' 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                                }`}
                              >
                                Full body
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-neutral-400 mb-3">Angle</h3>
                          <div className="space-y-2">
                            {[
                              'Wide angle - 10/24mm',
                              'Standard - 50/90mm', 
                              'Long lens - 110/150mm'
                            ].map(angle => (
                              <button
                                key={angle}
                                type="button"
                                onClick={() => setLensAngle(angle)}
                                className={`w-full h-8 px-3 rounded-md text-sm border transition ${
                                  lensAngle === angle 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                                }`}
                              >
                                {angle}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                  </CollapsibleSection>
                  <CollapsibleSection title="Aspect Ratio" icon={Ratio}>
                     <div className="flex flex-wrap gap-2">
                        {['1:1', '9:16', '16:9', '3:2', '2:3'].map(ratio => (<Chip key={ratio} label={ratio} active={aspectRatio === ratio} onClick={() => setAspectRatio(ratio)} />))}
                      </div>
                  </CollapsibleSection>
                  {/* Images to generate row */}
                  <div className="flex items-center justify-between px-3 py-3 border-t border-neutral-800">
                    <div className="text-sm text-neutral-200 flex items-center gap-3">
                      <Layers className="h-5 w-5 text-neutral-400" />
                      <span className="font-medium">Images to generate</span>
                    </div>
                    <div className="flex items-center gap-4 text-neutral-300">
                      <button type="button" onClick={() => setImagesToGenerate(Math.max(1, imagesToGenerate - 1))} className="h-7 w-7 rounded-md bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">-</button>
                      <span className="min-w-4 text-center">{imagesToGenerate}</span>
                      <button type="button" onClick={() => setImagesToGenerate(Math.min(9, imagesToGenerate + 1))} className="h-7 w-7 rounded-md bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">+</button>
                    </div>
                  </div>
                  {/* Model row */}
                  <div className="px-3 py-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-neutral-200 flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-neutral-400" />
                        <span className="font-medium">Model</span>
                      </div>
                      <button type="button" onClick={() => setShowModelMenu(v => !v)} className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-300 hover:bg-neutral-700">
                        <span className="text-xs">{processor === 'Nano Banana' ? 'Nano banana' : processor}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {showModelMenu && (
                      <div className="absolute right-3 mt-2 w-40 rounded-md border border-neutral-700 bg-neutral-900 shadow-lg z-10">
                        <button type="button" onClick={() => { setProcessor('Nano Banana'); setShowModelMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-t-md">Nano banana</button>
                        <button type="button" onClick={() => { setProcessor('Kling'); setShowModelMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800">Kling</button>
                        <button type="button" onClick={() => { setProcessor('Gemini'); setShowModelMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800">Gemini</button>
                <button type="button" onClick={() => { setProcessor('OpenAI DALL-E'); setShowModelMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-b-md">OpenAI DALL-E</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-800">
                <Button type="submit" form="generate-form" className="w-full bg-primary text-white hover:bg-primary/90" disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Image
                </Button>
                 <div className="mt-2 flex justify-between items-center text-xs text-neutral-400 px-1">
                    <p>1 credit</p>
                    <p>{user?.credits ?? 0} credits remaining</p>
                 </div>
              </div>
            </div>
          </aside>

          <section className="col-span-12 lg:col-span-9">
            {showBilling ? (
              <BillingPage 
                user={{ ...user!, name: user!.name || 'User' }} 
                onBack={() => setShowBilling(false)} 
              />
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-neutral-200">Generated Images</h3>
                        <p className="mt-1 text-sm text-neutral-500">These are just examples. Describe a garment or style to try it yourself!</p>
                    </div>
                    {/* Add Tabs here if needed */}
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {isGenerating && <div className="aspect-[3/4] rounded-lg bg-neutral-800 animate-pulse"></div>}
                  {gallery.map((src, index) => (
                    <div key={index} className="relative group aspect-[3/4]">
                      <Image src={src} alt={`Generated image ${index + 1}`} fill className="rounded-lg object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleUpscale(src)}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          <Layers className="h-4 w-4 mr-2" />
                          Upscale
                        </Button>
                      </div>
                    </div>
                  ))}
                  {gallery.length === 0 && !isGenerating && [
                      "/images/image (1).png", 
                      "/images/Waffle_Grey_Front_8d3f337c-e628-4e8f-bed8-6c2aa863e204.jpg", 
                      "/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg",
                      "/images/freepik__a-full-shot-of-a-smiling-black-man-around-24-years__34269.jpeg"
                  ].map(src => (
                     <div key={src} className="relative group aspect-[3/4]"><Image src={src} alt="Example image" fill className="rounded-lg object-cover" /></div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <AssetLibraryModal open={!!activeLibrary} onClose={() => setActiveLibrary(null)} type={activeLibrary} onSelect={handleSelectAsset} onDelete={handleDeleteAsset} />
      
      {/* Create Character Modal */}
      {showCreateCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-[min(1200px,95vw)] rounded-2xl border border-primary/20 bg-neutral-900 p-6 shadow-2xl">
            <button 
              type="button" 
              onClick={() => setShowCreateCharacter(false)} 
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-primary/10" 
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <AddNewCharacterView onBack={() => setShowCreateCharacter(false)} />
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
