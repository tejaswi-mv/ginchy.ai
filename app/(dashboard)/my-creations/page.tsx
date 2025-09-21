'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type GeneratedImage = {
  id: number;
  prompt: string;
  imageUrl: string;
  createdAt: string;
};

export default function MyCreationsPage() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    async function fetchImages() {
      if (!user) return;
      
      try {
        const response = await fetch('/api/my-creations');
        const data = await response.json();
        setImages(data.images || []);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [user]);

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ginchy-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const response = await fetch('/api/my-creations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });
      
      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild>
              <Link href="/generate">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Generate
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/generate">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Generate
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Creations</h1>
              <p className="text-neutral-400">{images.length} generated images</p>
            </div>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/generate">Generate More</Link>
          </Button>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
                <div className="text-4xl">🎨</div>
              </div>
              <h1 className="text-4xl font-bold mb-4">My Creations</h1>
              <p className="text-xl text-neutral-400 mb-8">
                Your generated images will appear here
              </p>
            </div>
            
            <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-5 w-5 text-primary">✨</div>
                <span className="text-lg font-semibold">No creations yet</span>
              </div>
              <p className="text-neutral-400 mb-6">
                Start generating amazing fashion images to see them here
              </p>
              <div className="space-y-3 text-sm text-neutral-500">
                <p>• Generate images with AI models</p>
                <p>• Create fashion content for your brand</p>
                <p>• Download and share your creations</p>
                <p>• Manage your image library</p>
              </div>
            </div>
            
            <div className="mt-8">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/generate">Start Creating</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-900">
                <Image
                  src={image.imageUrl}
                  alt={image.prompt}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(image.imageUrl, image.prompt)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-sm text-white truncate">{image.prompt}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] bg-neutral-900 rounded-2xl overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="relative aspect-[3/4] max-h-[80vh]">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.prompt}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Prompt</h3>
              <p className="text-neutral-300 mb-4">{selectedImage.prompt}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.prompt)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={() => handleDelete(selectedImage.id)}
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
