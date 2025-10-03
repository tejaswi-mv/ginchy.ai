'use client';

import { useState, useRef } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, X, Check, XCircle } from 'lucide-react';
import { createCharacter } from '@/app/(login)/actions';
import Image from 'next/image';
import Link from 'next/link';

export default function CreateCharacterPage() {
  const [createState, createAction, isCreating] = useActionState<any, FormData>(createCharacter, null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const goodExamples = [
    "/images/character-examples/good-1.jpg",
    "/images/character-examples/good-2.jpg", 
    "/images/character-examples/good-3.jpg",
    "/images/character-examples/good-4.jpg"
  ];

  const badExamples = [
    "/images/character-examples/bad-1.jpg",
    "/images/character-examples/bad-2.jpg",
    "/images/character-examples/bad-3.jpg"
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/generate">
            <Button variant="ghost" className="text-white hover:bg-neutral-800">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Generate
            </Button>
          </Link>
          <div className="text-right">
            <div className="text-sm text-neutral-400">Credits: 392</div>
          </div>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Create Your AI Character</h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Upload 5+ photos of a person to train a custom AI model. The more diverse photos you provide, the better your AI character will be.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Examples */}
          <div className="space-y-8">
            {/* Good Examples */}
            <div className="bg-neutral-900 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-green-500">Good Examples</h3>
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                Upload high-quality images showing different angles, expressions, and lighting conditions.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {goodExamples.map((src, index) => (
                  <div key={index} className="relative aspect-square border-2 border-green-500 rounded-lg overflow-hidden">
                    <Image 
                      src={src} 
                      alt={`Good example ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bad Examples */}
            <div className="bg-neutral-900 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-red-500">Avoid These</h3>
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                No group shots, masks, filters, or low-quality images.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {badExamples.map((src, index) => (
                  <div key={index} className="relative aspect-square border-2 border-red-500 rounded-lg overflow-hidden">
                    <Image 
                      src={src} 
                      alt={`Bad example ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Character Details Form */}
          <div className="bg-neutral-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Character Details</h2>
            
            {createState?.error && (
              <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
                {createState.error}
              </div>
            )}
            
            {createState?.success && (
              <div className="bg-green-900/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6">
                {createState.success}
              </div>
            )}

            <form action={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Character Name
                </label>
                <Input 
                  name="name" 
                  placeholder="Enter character name" 
                  className="bg-neutral-800 border-neutral-700 text-white" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Gender
                </label>
                <select 
                  name="gender" 
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-sm text-neutral-200" 
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Available Models
                </label>
                <Input 
                  name="availableModels" 
                  placeholder="e.g., Professional, Casual, Formal" 
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Upload Photos (5+ required)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <p className="text-neutral-300 mb-2">
                    Drag and drop images here or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-neutral-500">
                    PNG, JPG, JPEG up to 10MB each
                  </p>
                  <input 
                    ref={fileInputRef}
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
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-300">
                        {selectedFiles.length} files selected
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-neutral-800">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isCreating || selectedFiles.length < 5}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
              >
                {isCreating ? 'Creating Character...' : 'Create AI Character'}
              </Button>

              <p className="text-xs text-neutral-500 text-center">
                Your custom character and all generations are private and will not be used to train any datasets. 
                By submitting, you agree to our{' '}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                  Terms of Service
                </Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
