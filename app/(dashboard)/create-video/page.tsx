'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Video,
  Play,
  Pause,
  Square,
  Upload,
  Settings,
  Sparkles,
  Loader2,
  ArrowLeft,
  User as UserIcon,
  Shirt,
  Globe,
  Camera,
  Clock,
  Download,
  Share2,
  Heart,
  Layers,
  Check,
  X
} from 'lucide-react';
import { useActionState } from 'react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProfileDropdown from '@/components/ProfileDropdown';

type Asset = {
  name: string;
  url: string;
  isOwner?: boolean;
  metadata?: string;
};

type AssetType = 'characters' | 'poses' | 'environment' | 'garments';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CreateVideoPage() {
  const [selectedModel, setSelectedModel] = useState<Asset | null>(null);
  const [selectedPose, setSelectedPose] = useState<Asset | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<Asset | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Asset | null>(null);
  
  const [activeLibrary, setActiveLibrary] = useState<AssetType | null>(null);
  const [showBilling, setShowBilling] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: user, mutate: mutateUser } = useSWR<User>('/api/user', fetcher);

  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [cameraMovement, setCameraMovement] = useState('static');

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
      icon: Camera,
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

  const videoStyles = [
    { value: 'cinematic', label: 'Cinematic', description: 'Movie-like quality' },
    { value: 'documentary', label: 'Documentary', description: 'Realistic style' },
    { value: 'fashion', label: 'Fashion', description: 'High-end fashion' },
    { value: 'commercial', label: 'Commercial', description: 'Advertising style' },
    { value: 'artistic', label: 'Artistic', description: 'Creative and unique' }
  ];

  const cameraMovements = [
    { value: 'static', label: 'Static', description: 'No camera movement' },
    { value: 'pan', label: 'Pan', description: 'Horizontal movement' },
    { value: 'tilt', label: 'Tilt', description: 'Vertical movement' },
    { value: 'zoom', label: 'Zoom', description: 'In/out movement' },
    { value: 'orbit', label: 'Orbit', description: 'Circular movement' }
  ];

  const durations = [3, 5, 10, 15, 30];

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      alert('Please enter a video description');
      return;
    }

    setIsGenerating(true);
    
    // Simulate video generation (replace with actual API call)
    setTimeout(() => {
      const mockVideoUrl = `https://sample-videos.com/zip/10/mp4/SampleVideo_${Math.floor(Math.random() * 5) + 1}.mp4`;
      setGeneratedVideos(prev => [mockVideoUrl, ...prev]);
      setIsGenerating(false);
      
      // Deduct credits
      if (user) {
        mutateUser({ ...user, credits: (user.credits || 0) - 2 }, false);
      }
    }, 10000); // 10 second simulation
  };

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
                <Link href="/generate" className="flex items-center h-14 w-full rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900 px-5 shadow-inner text-base font-medium">
                  <Camera className="mr-3 h-5 w-5 text-neutral-300" />
                  <span className="truncate">Create an image</span>
                </Link>
                <button type="button" className="flex items-center h-14 w-full rounded-xl bg-neutral-900/70 border border-neutral-800 text-white px-5 shadow-inner hover:bg-neutral-900 text-base font-medium">
                  <Video className="mr-3 h-5 w-5 text-neutral-300" />
                  <span className="truncate">Create a video</span>
                </button>
                <Link href="/create-packshot" className="flex items-center h-14 w-full rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900 px-5 shadow-inner text-base font-medium">
                  <Layers className="mr-3 h-5 w-5 text-neutral-300" />
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
                  <span className="text-xs text-neutral-300">Create Videos</span>
                </div>
                <h2 className="text-lg font-semibold text-neutral-100 mt-2 mb-2 px-3">Create Videos</h2>
                
                <form className="space-y-4 px-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Video Description</label>
                    <textarea 
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      rows={4} 
                      placeholder="Describe your video (e.g., 'A model walking in a modern office wearing a blue suit')"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {durations.map(duration => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => setVideoDuration(duration)}
                          className={`h-8 px-3 rounded-md text-sm border transition ${
                            videoDuration === duration 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                          }`}
                        >
                          {duration}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Video Style</label>
                    <select
                      value={videoStyle}
                      onChange={(e) => setVideoStyle(e.target.value)}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-sm text-neutral-200"
                    >
                      {videoStyles.map(style => (
                        <option key={style.value} value={style.value}>
                          {style.label} - {style.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Camera Movement</label>
                    <select
                      value={cameraMovement}
                      onChange={(e) => setCameraMovement(e.target.value)}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-sm text-neutral-200"
                    >
                      {cameraMovements.map(movement => (
                        <option key={movement.value} value={movement.value}>
                          {movement.label} - {movement.description}
                        </option>
                      ))}
                    </select>
                  </div>
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
                          <button onClick={() => setSelectedModel(null)} className="ml-auto p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {selectedPose && (
                        <div className="flex items-center gap-2 text-xs">
                          <Camera className="h-3 w-3 text-neutral-400" />
                          <span className="text-neutral-300">Pose:</span>
                          <span className="text-primary truncate">{selectedPose.name}</span>
                          <button onClick={() => setSelectedPose(null)} className="ml-auto p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {selectedGarment && (
                        <div className="flex items-center gap-2 text-xs">
                          <Shirt className="h-3 w-3 text-neutral-400" />
                          <span className="text-neutral-300">Garment:</span>
                          <span className="text-primary truncate">{selectedGarment.name}</span>
                          <button onClick={() => setSelectedGarment(null)} className="ml-auto p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {selectedEnvironment && (
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className="h-3 w-3 text-neutral-400" />
                          <span className="text-neutral-300">Environment:</span>
                          <span className="text-primary truncate">{selectedEnvironment.name}</span>
                          <button onClick={() => setSelectedEnvironment(null)} className="ml-auto p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Asset Categories */}
                <div className="border border-neutral-800 rounded-lg">
                  {assetCategories.map((category, index) => (
                    <div key={category.type} className="border-b border-neutral-800 last:border-b-0">
                      <button 
                        type="button" 
                        className="w-full flex items-center justify-between p-3 text-sm text-neutral-200 hover:bg-neutral-800/50"
                        onClick={() => setActiveLibrary(category.type)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <category.icon className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                          <span className="font-medium truncate">{category.title}</span>
                          {category.selected && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="w-6 h-6 rounded border border-primary/30 overflow-hidden">
                                <Image 
                                  src={category.selected.url} 
                                  alt={category.selected.name} 
                                  width={24} 
                                  height={24} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-xs text-primary font-medium truncate max-w-20">
                                {category.selected.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-neutral-400">Select</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-800">
                <Button 
                  onClick={handleGenerateVideo}
                  className="w-full bg-primary text-white hover:bg-primary/90" 
                  disabled={isGenerating || !videoPrompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Generate Video
                    </>
                  )}
                </Button>
                <div className="mt-2 flex justify-between items-center text-xs text-neutral-400 px-1">
                  <p>2 credits</p>
                  <p>{user?.credits ?? 0} credits remaining</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="col-span-12 lg:col-span-9">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-neutral-200">Generated Videos</h3>
                  <p className="mt-1 text-sm text-neutral-500">Create stunning videos with AI models showcasing your products</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isGenerating && (
                  <div className="aspect-video rounded-lg bg-neutral-800 animate-pulse flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">Generating video...</p>
                    </div>
                  </div>
                )}
                
                {generatedVideos.map((videoUrl, index) => (
                  <div key={index} className="relative group aspect-video bg-neutral-800 rounded-lg overflow-hidden">
                    <video 
                      src={videoUrl} 
                      className="w-full h-full object-cover"
                      controls
                      poster="/images/video-poster.jpg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {generatedVideos.length === 0 && !isGenerating && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <Video className="w-16 h-16 text-neutral-600 mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No videos generated yet</h4>
                    <p className="text-neutral-400 mb-4">Select assets, add a description, and generate your first video!</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </ErrorBoundary>
  );
}