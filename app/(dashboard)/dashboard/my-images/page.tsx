'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Trash2, Eye, Calendar, FileImage } from 'lucide-react';
import { User } from '@/lib/db/schema';

type UserUploadedImage = {
  id: number;
  userId: number;
  fileName: string;
  originalName: string;
  imageUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedAt: string;
};

export default function MyImagesPage() {
  const [images, setImages] = useState<UserUploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<UserUploadedImage | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch user data
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(data));

    // Fetch user's uploaded images
    fetchUserImages();
  }, []);

  const fetchUserImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/my-images');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/my-images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        setSelectedImage(null);
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleDownloadImage = (image: UserUploadedImage) => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = image.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">My Images</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Images</h1>
          <p className="text-neutral-400 mt-1">
            {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = '/generate'}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FileImage className="w-4 h-4 mr-2" />
          Upload More
        </Button>
      </div>

      {images.length === 0 ? (
        <Card className="bg-neutral-900 border-neutral-800 p-8 text-center">
          <FileImage className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No images uploaded yet</h3>
          <p className="text-neutral-400 mb-4">
            Upload images from the Generate page to see them here
          </p>
          <Button 
            onClick={() => window.location.href = '/generate'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Generate
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card 
              key={image.id} 
              className="bg-neutral-900 border-neutral-800 overflow-hidden group cursor-pointer hover:border-neutral-600 transition-colors"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square relative">
                <Image
                  src={image.imageUrl}
                  alt={image.originalName}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.png';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(image);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-white truncate" title={image.originalName}>
                  {image.originalName}
                </p>
                <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
                  <span>{formatFileSize(image.fileSize)}</span>
                  <span>{formatDate(image.uploadedAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl border border-neutral-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedImage.originalName}</h3>
                <p className="text-sm text-neutral-400">
                  {formatFileSize(selectedImage.fileSize)} • {formatDate(selectedImage.uploadedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadImage(selectedImage)}
                  className="border-neutral-600 text-white hover:bg-neutral-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteImage(selectedImage.id)}
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="text-white hover:bg-neutral-800"
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="relative aspect-video bg-neutral-800 rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.originalName}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
