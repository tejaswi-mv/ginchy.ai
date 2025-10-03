'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  AtSign,
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
  CheckCircle,
  Ratio,
  Trash2,
  Play,
  Square,
  Image as ImageIcon,
  Download,
  Video,
  Aperture,
  Film,
  Star,
  Package,
  Layers,
  Check,
  
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
      // Set empty array on error to prevent crashes
      setAssets([]);
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
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isAssetsLoading) {
        console.warn('Asset loading timeout, setting empty state');
        setIsAssetsLoading(false);
        setAssets([]);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
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
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', type);
          
          console.log('Uploading file:', file.name, 'Type:', type);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          console.log('Upload response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          console.log('Upload result:', result);
          
          if (result.success) {
            // Add the uploaded asset to the assets list
            const newAsset: Asset = {
              name: file.name,
              url: result.url,
              isOwner: true
            };
            setAssets(prev => [newAsset, ...prev]);
            alert('Image uploaded successfully!');
          } else {
            alert(`Upload failed: ${result.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert(`Upload failed: ${error instanceof Error ? error.message : 'Please try again'}`);
        }
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
      <div className="grid grid-cols-6 gap-1">
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
    const [showTerms, setShowTerms] = useState(false);
    const goodExamples = [
        "/images/freepik__a-full-shot-of-a-slender-darkskinned-black-woman-a__34268.jpeg", 
        "/images/freepik__a-full-shot-of-a-smiling-black-man-around-24-years__34269.jpeg", 
        "/images/romain.gn_a_casual_beautiful_Slavic_women_from_Albania_with_b_30e89a20-d0b8-4aba-9085-aca6cce1239f_0 (1).png", 
        "/images/woman v2.png", 
        "/images/romain.gn_A_hand_holding_a_phone_--ar_5877_--raw_--profile_h5_5161a1f7-02d7-43a3-afd2-b77925b50fab_0.png"
    ];
    const badExamples = [
        "/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53455 (1).png", 
        "/images/freepik__we-see-her-in-ecommerce-page-white-studio-with-a-n__53453 (1).png", 
        "/images/freepik__we-see-in-derset-with-a-new-pose__53446 (1).png", 
        "/images/freepik__we-see-in-new-york-with-a-new-pose__53447 (1).png", 
        "/images/freepik__we-see-her-in-snow-enviorment-with-a-new-pose__53458 (1).png"
    ];
    
    const [createState, createAction, isCreating] = useActionState<any, FormData>(createCharacter, null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            setSelectedFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (formData: FormData) => {
        // Add selected files to form data
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });
        createAction(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
                <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 relative">
                    {/* Exit button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 text-white hover:bg-neutral-700"
                        onClick={() => window.history.back()}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                {/* Breadcrumb */}
                <div className="mb-4">
                    <p className="text-neutral-400 text-sm">Models / Add new character</p>
                </div>
                
                <div className="mb-4">
                    <h1 className="text-sm sm:text-base lg:text-lg font-bold" style={{ fontSize: '12px' }}>Add new character</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-none">
                    {/* Left Side - Guidelines */}
                    <div className="space-y-4">
                        {/* Upload 5+ photos section */}
                        <div className="bg-neutral-800 p-4 rounded-xl">
                            <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Upload 5+ photos for best results
                            </h3>
                            <p className="text-xs text-neutral-300 mb-3" style={{ fontSize: '10px' }}>
                                Upload high-quality images of one person. The more images you provide, the better the result -<br />
                                show different angles, clear facial expressions, and consistent identity.
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                {goodExamples.map((src, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-green-500/30 relative">
                                        <Image 
                                            src={src} 
                                            alt="Good example" 
                                            width={120} 
                                            height={120} 
                                            className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Avoid these types section */}
                        <div className="bg-neutral-800 p-4 rounded-xl mt-1">
                            <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
                                <X className="w-5 h-5 mr-2" />
                                Avoid these types of photos
                            </h3>
                            <p className="text-xs text-neutral-300 mb-3" style={{ fontSize: '10px' }}>
                                No duplicates, group shots, pets, nudes, filters, face-covering accessories, or masks.
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                {badExamples.map((src, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-red-500/30 relative">
                                        <Image 
                                            src={src} 
                                            alt="Bad example" 
                                            width={120} 
                                            height={120} 
                                            className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                            <X className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Create Character Form */}
                    <div className="bg-neutral-900 p-3 lg:p-4 rounded-xl border border-neutral-700 w-full">
                        <h3 className="text-lg font-bold mb-3">Create your character</h3>
                        
                        <form action={handleSubmit} className="space-y-3">
                            {/* Name field with @ icon */}
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                <Input 
                                    name="name" 
                                    placeholder="Name" 
                                    className="bg-neutral-800 border-neutral-600 text-white pl-10 h-9 text-sm" 
                                    required
                                />
                            </div>

                            {/* Gender dropdown with search icon */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                <select 
                                    name="gender" 
                                    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2 text-white pl-10 appearance-none h-9 text-sm" 
                                    required
                                >
                                    <option value="">Select the gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="non-binary">Non-binary</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                            </div>

                            {/* Available models dropdown with star icon */}
                            <div className="relative">
                                <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                <select 
                                    name="available_models" 
                                    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2 text-white pl-10 appearance-none h-9 text-sm"
                                >
                                    <option value="">Available models</option>
                                    <option value="professional">Professional</option>
                                    <option value="casual">Casual</option>
                                    <option value="formal">Formal</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                            </div>

                            {/* Upload description */}
                            <div className="text-center">
                                <p className="text-neutral-300 text-xs">
                                    Drag and drop images or <span className="text-blue-400">Browse</span> (5 Images minimum)
                                </p>
                            </div>

                            {/* File Upload Area */}
                            <div 
                                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                                    dragActive 
                                        ? 'border-blue-500 bg-blue-500/10' 
                                        : 'border-neutral-600 hover:border-neutral-500'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                <input 
                                    id="file-upload-modal" 
                                    type="file" 
                                    multiple 
                                    className="sr-only" 
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    required
                                />
                            </div>

                            {/* Selected Files Preview */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs text-neutral-300 mb-2">
                                        {selectedFiles.length} files selected
                                    </p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden bg-neutral-800">
                                                    <img 
                                                        src={URL.createObjectURL(file)} 
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Create button */}
                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-0 text-xs h-4" 
                                style={{ height: '16px', padding: '0', fontSize: '10px' }}
                                disabled={isCreating || selectedFiles.length < 5}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-2 h-2 mr-0.5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create your character'
                                )}
                            </Button>

                            {createState?.error && (
                                <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
                                    <p className="text-red-400 text-sm">{createState.error}</p>
                                </div>
                            )}
                            
                            {createState?.success && (
                                <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg">
                                    <p className="text-green-400 text-sm">{createState.success}</p>
                                </div>
                            )}

                            {/* Disclaimer */}
                            <div className="text-center space-y-1">
                                <p className="text-xs text-neutral-400 leading-tight">
                                    Your custom character and all your generations are private and will not be used to train any datasets.
                                </p>
                                <p className="text-xs text-neutral-400 leading-tight">
                                    By submitting, you agree to and acknowledge that your uploaded images and the model you are creating do not violate our{' '}
                                    <button 
                                        onClick={() => setShowTerms(true)}
                                        className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                                    >
                                        Terms of Service
                                    </button>.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
            </div>
            
            {/* Terms of Service Modal */}
            {showTerms && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-60">
                    <div className="bg-black text-white max-w-4xl max-h-[80vh] overflow-y-auto p-8 rounded-xl border border-neutral-700">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-center mb-2">GINCHY</h1>
                                <h2 className="text-lg text-center mb-4">Terms of Service for Ginchy</h2>
                                <p className="text-sm text-neutral-400">Last updated: May 12, 2023</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-neutral-700"
                                onClick={() => setShowTerms(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-lg font-semibold mb-3">1. GENERAL INFORMATION ABOUT GINCHY</h3>
                                <p className="text-sm text-neutral-300 mb-3">
                                    Ginchy is a platform for AI-powered character creation, image generation, and content management, 
                                    provided by Ginchy Labs. These terms of service ("Terms") form a binding agreement between you and Ginchy Labs.
                                </p>
                                <p className="text-sm text-neutral-300 mb-3">
                                    By creating an account on our website, you agree to these Terms, our Privacy Policy, and Community Guidelines. 
                                    You must have the authority and legal capacity to enter this agreement.
                                </p>
                                <p className="text-sm text-neutral-300">
                                    Questions can be directed through our website chat or by email at <a href="mailto:team@ginchy.ai" className="text-blue-400 hover:text-blue-300 underline">team@ginchy.ai</a>.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold mb-3">2. WHAT SERVICES ARE PROVIDED BY GINCHY?</h3>
                                <h4 className="text-base font-medium mb-2">The Services</h4>
                                <p className="text-sm text-neutral-300 mb-3">
                                    Ginchy's mission is to empower creators with advanced AI tools for character creation, image generation, 
                                    and content management. Our platform enables you to create custom AI characters, generate high-quality images, 
                                    organize your content, and share your creations with others.
                                </p>
                                <p className="text-sm text-neutral-300 mb-3">
                                    More information about our Services and subscription plans can be found on our pricing page.
                                </p>
                                <p className="text-sm text-neutral-300">
                                    We grant you a non-exclusive, non-transferable right to access and use our Services for your personal 
                                    and commercial projects during your subscription period, subject to these Terms.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold mb-3">3. USER CONTENT AND PRIVACY</h3>
                                <p className="text-sm text-neutral-300 mb-3">
                                    Your custom characters and all your generations are private and will not be used to train any datasets. 
                                    We respect your intellectual property and maintain strict privacy standards.
                                </p>
                                <p className="text-sm text-neutral-300">
                                    By uploading content, you represent that you have the necessary rights and that your content does not 
                                    violate any third-party rights or our community guidelines.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold mb-3">4. ACCEPTABLE USE</h3>
                                <p className="text-sm text-neutral-300 mb-3">
                                    You agree to use our Services only for lawful purposes and in accordance with these Terms. 
                                    You may not use our Services to create content that is illegal, harmful, or violates our community standards.
                                </p>
                                <p className="text-sm text-neutral-300">
                                    We reserve the right to suspend or terminate your account if you violate these Terms or our community guidelines.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            )}
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
      <div className="relative w-[min(1024px,92vw)] rounded-2xl border border-neutral-700 bg-neutral-800 p-6 shadow-2xl">
        <button type="button" onClick={() => { setView('library'); onClose(); }} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-neutral-700" aria-label="Close"><X className="h-5 w-5 text-white" /></button>
        {view === 'library' ? (
          <>
            <h3 className="text-xl font-bold text-white capitalize">{type}</h3>
            <div className="flex items-center gap-6 mt-6 overflow-x-auto border-b border-neutral-700 pb-2">
              {filterTabs.map(tab => (
                 <button 
                   key={tab} 
                   className={`py-2 text-sm whitespace-nowrap font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-white' : 'text-neutral-400 hover:text-white'}`}
                   onClick={() => setActiveTab(tab)}
                 >
                   {tab}
                 </button>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input placeholder={`Search ${type}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400 pl-9 focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"/>
              </div>
              {type === 'characters' && (
                <Button onClick={() => setView('create')} className="bg-neutral-600 hover:bg-neutral-500 text-white">
                  <Plus className="mr-2 h-4 w-4" /> New Character
                </Button>
              )}
            </div>
            <div className="mt-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[60vh] overflow-y-auto">
              {filteredAssets.map(asset => (
                <div key={asset.url} className="relative group text-center">
                  <button type="button" onClick={() => onSelect(asset)} className="group relative w-full aspect-square overflow-hidden rounded-lg border border-neutral-600 hover:border-neutral-400 transition bg-white">
                    <Image src={asset.url} alt={asset.name} fill className="object-cover transition-transform group-hover:scale-105" />
                    {asset.isOwner && <button onClick={(e) => { e.stopPropagation(); onDelete(asset); }} className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full hover:bg-red-500 transition-colors"><Trash2 className="h-3 w-3 text-white" /></button>}
                  </button>
                  <p className="text-xs text-neutral-300 mt-2 truncate">{asset.name.split('.')[0]}</p>
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationJobId, setGenerationJobId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  
  const { data: user, mutate: mutateUser } = useSWR<User>('/api/user', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });
  const { data: userCreations, mutate: mutateCreations } = useSWR('/api/my-creations', fetcher);

  const [cameraView, setCameraView] = useState<string | null>(null);
  const [lensAngle, setLensAngle] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [processor, setProcessor] = useState<'Nano Banana' | 'Kling' | 'Gemini' | 'OpenAI DALL-E'>('Nano Banana');
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false);
  const [imagesToGenerate, setImagesToGenerate] = useState<number>(4);
  // Removed upscale functionality

  // Removed upscale functionality

  const handleGenerate = async (formData: FormData) => {
    // Prevent multiple simultaneous generations
    if (isGenerating) {
      console.warn('Generation already in progress');
      return;
    }

    const prompt = formData.get('prompt') as string;
    if (!prompt?.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      // Build enhanced prompt with all selected parameters
      let enhancedPrompt = prompt;
      
      // Add selected assets to prompt with proper image references
      if (selectedModel?.url) {
        enhancedPrompt += `, using this character as reference: ${selectedModel.url}`;
      }
      if (selectedPose?.url) {
        enhancedPrompt += `, using this pose as reference: ${selectedPose.url}`;
      }
      if (selectedGarment?.url) {
        enhancedPrompt += `, wearing this garment: ${selectedGarment.url}`;
      }
      if (selectedEnvironment?.url) {
        enhancedPrompt += `, in this environment: ${selectedEnvironment.url}`;
      }
      
      // Add camera and lens settings
      if (cameraView) {
        enhancedPrompt += `, ${cameraView.toLowerCase()} shot`;
      }
      if (lensAngle) {
        enhancedPrompt += `, ${lensAngle.toLowerCase()}`;
      }
      
      // Add aspect ratio context
      if (aspectRatio) {
        const ratioMap: Record<string, string> = {
          '1:1': 'square format',
          '9:16': 'portrait format',
          '16:9': 'landscape format',
          '3:2': 'classic photography format',
          '2:3': 'vertical format'
        };
        enhancedPrompt += `, ${ratioMap[aspectRatio] || aspectRatio}`;
      }
      
      // Add professional photography terms
      enhancedPrompt += ', professional photography, high quality, detailed, fashion photography';
      
      console.log('Enhanced prompt:', enhancedPrompt);
      
      // Choose API based on whether we have image references
      const hasImageReferences = selectedModel?.url || selectedPose?.url || selectedGarment?.url || selectedEnvironment?.url;
      const apiEndpoint = hasImageReferences ? '/api/generate-with-image' : '/api/generate-instant';
      
      console.log('Using API endpoint:', apiEndpoint, 'Has image references:', hasImageReferences);
      
      // Use appropriate generation API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          modelUrl: selectedModel?.url || '',
          poseUrl: selectedPose?.url || '',
          garmentUrl: selectedGarment?.url || '',
          environmentUrl: selectedEnvironment?.url || '',
          cameraView: cameraView || '',
          lensAngle: lensAngle || '',
          aspectRatio: aspectRatio,
          processor: processor
        })
      });

      console.log('Generation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Generation error response:', errorText);
        alert(`Generation failed: HTTP ${response.status} - ${errorText}`);
        setIsGenerating(false);
        return;
      }
      
      const data = await response.json();
      console.log('Generation result:', data);
      
      if (data.error) {
        alert(`Generation failed: ${data.error}`);
        setIsGenerating(false);
        return;
      }

      if (!data.imageUrl) {
        alert('Generation failed: No image URL returned');
        setIsGenerating(false);
        return;
      }

      // Image generated successfully!
      setIsGenerating(false);
      setGenerationJobId(null);
      
      // Add image to gallery
      setGallery(prev => [data.imageUrl, ...prev]);
      
      // Refresh user creations
      mutateCreations();
      
      // Update user credits
      if(user) mutateUser({ ...user, credits: (user.credits || 0) - 1 }, false);
      
      console.log('✅ Image generated successfully!');

    } catch (error) {
      console.error('Generation error:', error);
      alert('Generation failed. Please try again.');
      setIsGenerating(false);
    }
  };

  // Handle main file upload for the generate form
  const handleMainFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} exceeds 10MB limit.`);
          continue;
        }
        if (!file.type.startsWith('image/')) {
          alert(`Please select a valid image file for ${file.name}.`);
          continue;
        }
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'model'); // Default type for main uploads should be model/character
          
          console.log('Uploading main file:', file.name);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          console.log('Main upload response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Main upload error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          console.log('Main upload result:', result);
          
          if (result.success) {
            // Add to model/character selection by default
            const newAsset: Asset = {
              name: file.name,
              url: result.url,
              isOwner: true
            };
            setSelectedModel(newAsset);
            alert(`Image ${file.name} uploaded successfully!`);
          } else {
            alert(`Upload failed for ${file.name}: ${result.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert(`Upload failed for ${file.name}: ${error instanceof Error ? error.message : 'Please try again'}`);
        }
      }
    }
  };

  // Image action handlers
  const handleImageUpload = (imageUrl: string) => {
    // Show dropdown for adding to folders
    setShowDropdown(imageUrl);
  };

  const handleFolderSelect = (folderName: string, imageUrl: string) => {
    console.log(`Adding image to folder: ${folderName}`);
    // Here you would implement the logic to add the image to the selected folder
    alert(`Image added to ${folderName} folder!`);
    setShowDropdown(null);
  };

  const handleImageDownload = (imageUrl: string) => {
    // Download the image
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVideoGeneration = (imageUrl: string) => {
    // Generate video from image
    console.log('Generating video for:', imageUrl);
    alert('Video generation functionality will be implemented');
  };

  const handleImageEdit = (imageUrl: string) => {
    // Edit the image
    console.log('Editing image:', imageUrl);
    alert('Image editing functionality will be implemented');
  };

  // Removed polling function - now using instant generation
  
  // Load user's generated images into gallery
  useEffect(() => {
    if (userCreations?.images) {
      const imageUrls = userCreations.images.map((img: any) => img.imageUrl);
      setGallery(imageUrls);
    }
  }, [userCreations]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (generationJobId) {
        // Clear any pending polling
        setGenerationJobId(null);
      }
    };
  }, [generationJobId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Removed upscale useEffect

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
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full justify-start text-neutral-300 border-neutral-700 hover:bg-neutral-800 rounded-xl"
                    onClick={() => document.getElementById('main-file-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload Images
                  </Button>
                  <input 
                    type="file" 
                    id="main-file-upload" 
                    className="hidden" 
                    onChange={handleMainFileUpload} 
                    accept="image/*" 
                    multiple
                  />
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

                {/* Upload Instructions */}
                <div className="mx-3 mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-300 mb-2">💡 Upload Tips</h3>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• Upload images from your gallery using the "Upload Images" button</li>
                    <li>• Use Character section for people/faces</li>
                    <li>• Use Garment section for clothing items</li>
                    <li>• Use Environment section for backgrounds</li>
                    <li>• Uploaded images will be used as references in your prompt</li>
                  </ul>
                </div>

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
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
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
                        <p className="mt-1 text-sm text-neutral-500">
                          {gallery.length > 0 
                            ? `Showing your latest ${Math.min(gallery.length, 4)} generated images` 
                            : "These are just examples. Describe a garment or style to try it yourself!"
                          }
                        </p>
                    </div>
                    {/* Add Tabs here if needed */}
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {isGenerating && (
                    <div className="aspect-[3/4] rounded-lg bg-neutral-800 animate-pulse flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-neutral-400">
                          Generating instantly...
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          No timeouts, no freezing!
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Show user's actual generated images (limit to 4) */}
                  {gallery.slice(0, 4).map((src, index) => (
                    <div key={`${src}-${index}`} className="relative group aspect-[3/4]">
                      <Image 
                        src={src} 
                        alt={`Generated image ${index + 1}`} 
                        fill 
                        className="rounded-lg object-cover" 
                        loading="lazy"
                        onError={(e) => {
                          console.error('Image failed to load:', src);
                          e.currentTarget.src = '/images/placeholder.png';
                        }}
                      />
                      {/* EXACT DESIGNER LAYOUT - Top Right Icons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                        <div className="relative dropdown-container">
                          <button 
                            onClick={() => handleImageUpload(src)}
                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-gray-300 shadow-sm"
                          >
                            <Plus className="h-3 w-3 text-gray-600" />
                          </button>
                          
                          {/* My Creations Dropdown */}
                          {showDropdown === src && (
                            <div className="absolute top-8 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[150px]">
                              <div className="py-1">
                                <button 
                                  onClick={() => handleFolderSelect('Projects', src)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <ImageIcon className="h-4 w-4 text-blue-500" />
                                  Projects
                                </button>
                                <button 
                                  onClick={() => handleFolderSelect('Costumes', src)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <ImageIcon className="h-4 w-4 text-blue-500" />
                                  Costumes
                                </button>
                                <button 
                                  onClick={() => handleFolderSelect('Peach', src)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <ImageIcon className="h-4 w-4 text-blue-500" />
                                  Peach
                                </button>
                                <button 
                                  onClick={() => handleFolderSelect('New folder', src)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4 text-blue-500" />
                                  New folder
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleImageDownload(src)}
                          className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-gray-300 shadow-sm"
                        >
                          <Download className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* EXACT DESIGNER LAYOUT - Bottom Buttons */}
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button 
                          onClick={() => handleVideoGeneration(src)}
                          className="flex-1 bg-white border border-gray-300 rounded text-gray-700 px-2 py-1 text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <Play className="h-2 w-2" />
                          Video
                        </button>
                        <button 
                          onClick={() => handleImageEdit(src)}
                          className="flex-1 bg-white border border-gray-300 rounded text-gray-700 px-2 py-1 text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <Settings className="h-2 w-2" />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Show empty state when no generated images exist */}
                  {gallery.length === 0 && !isGenerating && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-200 mb-2">No images generated yet</h3>
                      <p className="text-sm text-neutral-400 max-w-md">
                        Create your first AI-generated image by entering a prompt and clicking "Generate Image"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <AssetLibraryModal open={!!activeLibrary} onClose={() => setActiveLibrary(null)} type={activeLibrary} onSelect={handleSelectAsset} onDelete={handleDeleteAsset} />
      
      {/* Create Character Full Page */}
      {showCreateCharacter && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative w-full h-full">
            <button 
              type="button" 
              onClick={() => setShowCreateCharacter(false)} 
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-neutral-800 z-10" 
              aria-label="Close"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <AddNewCharacterView onBack={() => setShowCreateCharacter(false)} />
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
