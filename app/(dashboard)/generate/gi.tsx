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
} from 'lucide-react';
import { getPublicImages, getUserAssets, uploadAsset, generateImage, deleteAsset, createCharacter } from '@/app/(login)/actions';
import { useActionState } from 'react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
  const [previewAssets, setPreviewAssets] = useState<Asset[]>([]);
  const [uploadState, uploadAction, isUploading] = useActionState<any, FormData>(uploadAsset, null);
  const [isPending, startTransition] = useTransition();

  const fetchPreviewAssets = async () => {
    const publicResult = await getPublicImages(type, 5);
    const publicData = publicResult.data || [];

    if (user) {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('limit', '5');
      const userAssetsResult = await getUserAssets({}, formData);
      const userData = (userAssetsResult && 'data' in userAssetsResult && userAssetsResult.data) ? userAssetsResult.data : [];
      const combined = [...userData, ...publicData];
      setPreviewAssets(combined.slice(0, 5));
    } else {
      setPreviewAssets(publicData.slice(0, 5));
    }
  };

  useEffect(() => {
    fetchPreviewAssets();
  }, [type, user, uploadState]);

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
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {previewAssets.map((asset) => (
          <button key={asset.name} type="button" onClick={() => onSelect(asset)}
            className={`relative aspect-square w-full rounded-md object-cover border-2 transition-all ${selectedAsset?.url === asset.url ? 'border-primary' : 'border-transparent'} hover:border-primary/50`}>
            <Image src={asset.url} alt={asset.name} fill className="rounded-md object-cover" />
          </button>
        ))}
      </div>
       <div className="flex items-center gap-2">
        <Button onClick={handleUploadClick} variant="outline" size="sm" className="flex-1" disabled={isUploading || isPending}>
          <Upload className="mr-2 h-4 w-4" /> {isUploading || isPending ? 'Uploading...' : 'Upload'}
        </Button>
         <Button onClick={onOpenLibrary} variant="ghost" size="sm" className="flex-1">View Library</Button>
      </div>
      <input type="file" id={`file-upload-${type}`} className="hidden" onChange={handleFileUpload} accept="image/*" />
      {uploadState?.error && <p className="text-red-500 text-xs mt-1">{uploadState.error}</p>}
      {uploadState?.success && <p className="text-green-500 text-xs mt-1">{uploadState.success}</p>}
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false, icon: Icon }: { title: string; children: React.ReactNode; defaultOpen?: boolean; icon: React.ElementType }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-800">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-sm text-neutral-200 hover:bg-neutral-800/50">
        <span className="font-medium flex items-center gap-3">
          <Icon className="h-5 w-5 text-neutral-400" />
          {title}
        </span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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
  const [gallery, setGallery] = useState<string[]>([]);
  const [generateState, generateAction, isGenerating] = useActionState<any, FormData>(generateImage, null);
  
  const { data: user, mutate: mutateUser } = useSWR<User>('/api/user', fetcher);

  const [cameraView, setCameraView] = useState<string | null>(null);
  const [lensAngle, setLensAngle] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [processor, setProcessor] = useState<'Nano Banana' | 'Kling'>('Nano Banana');

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

  const assetCategories = [
    { type: 'characters' as AssetType, title: 'Model', selected: selectedModel, setter: setSelectedModel, icon: UserIcon },
    { type: 'poses' as AssetType, title: 'Model Poses', selected: selectedPose, setter: setSelectedPose, icon: Accessibility },
    { type: 'garments' as AssetType, title: 'Garment', selected: selectedGarment, setter: setSelectedGarment, icon: Shirt },
    { type: 'environment' as AssetType, title: 'Environment', selected: selectedEnvironment, setter: setSelectedEnvironment, icon: Globe },
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
        <div className="border-b border-neutral-800 bg-neutral-900/50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-neutral-400">My Creations / Generate Images</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button 
                variant="ghost" 
                className="bg-neutral-800 text-white hover:bg-neutral-700 px-6 py-3 h-auto"
              >
                <Settings className="mr-2 h-5 w-5" />
                Create an image
              </Button>
              <Button 
                variant="ghost" 
                asChild
                className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 px-6 py-3 h-auto"
              >
                <Link href="/my-creations">
                  <UserIcon className="mr-2 h-5 w-5" />
                  My Creations
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                asChild
                className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 px-6 py-3 h-auto"
              >
                <Link href="/create-video">
                  <Play className="mr-2 h-5 w-5" />
                  Create a video
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                asChild
                className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 px-6 py-3 h-auto"
              >
                <Link href="/create-packshot">
                  <Square className="mr-2 h-5 w-5" />
                  Create packshot
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 h-full">
          <aside className="col-span-12 lg:col-span-3 border-r border-neutral-800 bg-neutral-900/50 p-4">
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-2 overflow-y-auto">
                <h2 className="text-lg font-semibold text-neutral-100 mb-2 px-3">Generate Images</h2>
                <form id="generate-form" action={handleGenerate} className="space-y-4 px-3">
                  <textarea name="prompt" rows={3} placeholder="Describe your image style (e.g., 'red hoodie on tall male model')..."
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                  <Button type="button" variant="outline" className="w-full justify-start text-neutral-300 border-neutral-700 hover:bg-neutral-800">
                    <Upload className="mr-2 h-4 w-4" /> Upload Images
                  </Button>
                </form>
                <div className="border border-neutral-800 rounded-lg">
                  {assetCategories.map((category, index) => (
                    <CollapsibleSection key={category.type} title={category.title} defaultOpen={index < 2} icon={category.icon}>
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
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xs font-medium text-neutral-400 mb-2">Camera</h3>
                          <div className="flex flex-wrap gap-2">
                            {['Front view', 'Side view', 'Back view', 'Close up', 'Full body'].map(view => (<Chip key={view} label={view} active={cameraView === view} onClick={() => setCameraView(view)} />))}
                          </div>
                        </div>
                      </div>
                  </CollapsibleSection>
                  <CollapsibleSection title="Aspect Ratio" icon={Ratio}>
                     <div className="flex flex-wrap gap-2">
                        {['1:1', '9:16', '16:9', '3:2', '2:3'].map(ratio => (<Chip key={ratio} label={ratio} active={aspectRatio === ratio} onClick={() => setAspectRatio(ratio)} />))}
                      </div>
                  </CollapsibleSection>
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

          <section className="col-span-12 lg:col-span-9 p-6">
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
                <div key={index} className="relative group aspect-[3/4]"><Image src={src} alt={`Generated image ${index + 1}`} fill className="rounded-lg object-cover" /></div>
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
