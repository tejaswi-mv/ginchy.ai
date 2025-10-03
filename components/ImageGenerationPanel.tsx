'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  Sparkles,
  Loader2,
  Camera,
  Plus,
  Search,
  User as UserIcon,
  Shirt,
  Globe,
  Ratio,
  Play,
  Square,
  Image as ImageIcon,
  Video,
  Aperture,
  Film,
  Package,
  Layers,
  Check,
  Settings,
  Wand2,
  Download,
  Share2,
  Heart,
} from 'lucide-react';
import { generateImage } from '@/app/(login)/actions';
import { useActionState } from 'react';
import Image from 'next/image';
import { User } from '@/lib/db/schema';

type Asset = {
  name: string;
  url: string;
  isOwner?: boolean;
};

type AssetType = 'character' | 'poses' | 'garments' | 'environment';

interface ImageGenerationPanelProps {
  user: User | null | undefined;
  onClose?: () => void;
}

const assetCategories = [
  {
    type: 'character' as AssetType,
    title: 'Character',
    icon: UserIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    type: 'poses' as AssetType,
    title: 'Poses',
    icon: Camera,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    type: 'garments' as AssetType,
    title: 'Garments',
    icon: Shirt,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    type: 'environment' as AssetType,
    title: 'Environment',
    icon: Globe,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
];

const aspectRatios = [
  { value: '1:1', label: 'Square', icon: Square },
  { value: '9:16', label: 'Portrait', icon: Video },
  { value: '16:9', label: 'Landscape', icon: Film },
  { value: '3:2', label: 'Classic', icon: Aperture },
  { value: '2:3', label: 'Vertical', icon: ImageIcon },
];

  const processors = [
    { value: 'Nano Banana', label: 'Nano Banana', description: 'Fast & efficient' },
    { value: 'Kling', label: 'Kling', description: 'High quality' },
    { value: 'Gemini', label: 'Gemini', description: 'Prompt enhancement' },
    { value: 'OpenAI DALL-E', label: 'OpenAI DALL-E', description: 'Premium quality' },
    { value: 'Stable Diffusion', label: 'Stable Diffusion', description: 'Balanced' },
  ];

export default function ImageGenerationPanel({ user, onClose }: ImageGenerationPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Record<AssetType, Asset | null>>({
    character: null,
    poses: null,
    garments: null,
    environment: null,
  });
  const [activeLibrary, setActiveLibrary] = useState<AssetType | null>(null);
  const [assets, setAssets] = useState<Record<AssetType, Asset[]>>({
    character: [],
    poses: [],
    garments: [],
    environment: [],
  });
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [processor, setProcessor] = useState('Nano Banana');
  const [cameraView, setCameraView] = useState('front view');
  const [lensAngle, setLensAngle] = useState('wide angle');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generateState, generateAction, isGeneratingAction] = useActionState<any, FormData>(generateImage, null);

  // Load assets when library is opened
  useEffect(() => {
    if (activeLibrary) {
      loadAssets(activeLibrary);
    }
  }, [activeLibrary]);

  // Handle generation result
  useEffect(() => {
    if (generateState?.success && generateState?.imageUrl) {
      setGeneratedImages(prev => [generateState.imageUrl, ...prev]);
      setIsGenerating(false);
    } else if (generateState?.error) {
      console.error('Generation error:', generateState.error);
      setIsGenerating(false);
    }
  }, [generateState]);

  const loadAssets = async (type: AssetType) => {
    setIsAssetsLoading(true);
    try {
      // Simulate loading assets - replace with actual API call
      const mockAssets: Asset[] = Array.from({ length: 6 }, (_, i) => ({
        name: `${type} ${i + 1}`,
        url: `https://picsum.photos/400/400?random=${type}${i}`,
        isOwner: false,
      }));
      
      setAssets(prev => ({ ...prev, [type]: mockAssets }));
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setIsAssetsLoading(false);
    }
  };

  const handleAssetSelect = (type: AssetType, asset: Asset) => {
    setSelectedAssets(prev => ({ ...prev, [type]: asset }));
    setActiveLibrary(null);
  };

  const handleClearSelection = (type: AssetType) => {
    setSelectedAssets(prev => ({ ...prev, [type]: null }));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspectRatio', aspectRatio);
    formData.append('processor', processor);
    formData.append('cameraView', cameraView);
    formData.append('lensAngle', lensAngle);
    
    // Add selected assets
    Object.entries(selectedAssets).forEach(([type, asset]) => {
      if (asset) {
        formData.append(`${type}Url`, asset.url);
      }
    });
    
    await generateAction(formData);
  };

  const selectedAssetsCount = Object.values(selectedAssets).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Image Generator</h2>
              <p className="text-sm text-neutral-400">Create stunning images with AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-neutral-400">
              Credits: {user?.credits || 0}
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 bg-neutral-800 border-r border-neutral-700 flex flex-col">
            {/* Prompt Section */}
            <div className="p-4 border-b border-neutral-700">
              <label className="block text-sm font-medium text-white mb-2">
                Image Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full h-24 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Selected Assets Summary */}
            {selectedAssetsCount > 0 && (
              <div className="p-4 border-b border-neutral-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">Selected Assets</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAssets({ character: null, poses: null, garments: null, environment: null })}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="space-y-2">
                  {assetCategories.map(({ type, title, icon: Icon, color }) => {
                    const selected = selectedAssets[type];
                    if (!selected) return null;
                    
                    return (
                      <div key={type} className="flex items-center gap-2 p-2 bg-neutral-700 rounded-lg">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white truncate">{selected.name}</div>
                          <div className="text-xs text-neutral-400">{title}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClearSelection(type)}
                          className="w-6 h-6 p-0 text-neutral-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Asset Categories */}
            <div className="flex-1 p-4">
              <h3 className="text-sm font-medium text-white mb-3">Asset Categories</h3>
              <div className="space-y-2">
                {assetCategories.map(({ type, title, icon: Icon, color, bgColor, borderColor }) => {
                  const selected = selectedAssets[type];
                  return (
                    <div
                      key={type}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selected
                          ? `${bgColor} ${borderColor} border-2`
                          : 'bg-neutral-700 border-neutral-600 hover:bg-neutral-600'
                      }`}
                      onClick={() => setActiveLibrary(type)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{title}</div>
                          {selected && (
                            <div className="text-xs text-neutral-400 truncate">{selected.name}</div>
                          )}
                        </div>
                        {selected && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Settings */}
            <div className="p-4 border-t border-neutral-700 space-y-4">
              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {aspectRatios.map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={aspectRatio === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAspectRatio(value)}
                      className="justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Processor */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">AI Processor</label>
                <select
                  value={processor}
                  onChange={(e) => setProcessor(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {processors.map(({ value, label, description }) => (
                    <option key={value} value={value}>
                      {label} - {description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating || isGeneratingAction}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3"
              >
                {isGenerating || isGeneratingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Asset Library */}
            {activeLibrary && (
              <div className="p-6 border-b border-neutral-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {assetCategories.find(cat => cat.type === activeLibrary)?.title} Library
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveLibrary(null)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-6 gap-3">
                  {isAssetsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-neutral-700 animate-pulse" />
                    ))
                  ) : (
                    assets[activeLibrary].map((asset, index) => (
                      <button
                        key={index}
                        onClick={() => handleAssetSelect(activeLibrary, asset)}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-neutral-600 hover:border-blue-500 transition-all duration-200 group"
                      >
                        <Image
                          src={asset.url}
                          alt={asset.name}
                          fill
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                          sizes="(max-width: 768px) 16vw, (max-width: 1200px) 12vw, 10vw"
                        />
                        {selectedAssets[activeLibrary]?.url === asset.url && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Generated Images Gallery */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Generated Images</h3>
                {generatedImages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isGenerating && (
                  <div className="aspect-square rounded-lg bg-neutral-800 animate-pulse flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                  </div>
                )}
                {generatedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-800">
                    <Image
                      src={imageUrl}
                      alt={`Generated image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {generatedImages.length === 0 && !isGenerating && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <Wand2 className="w-16 h-16 text-neutral-600 mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No images generated yet</h4>
                    <p className="text-neutral-400 mb-4">Select assets, add a prompt, and generate your first image!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}