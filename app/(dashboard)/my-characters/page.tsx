'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, User, Calendar, Settings, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';

interface Character {
  id: number;
  name: string;
  url: string;
  metadata: {
    gender: string;
    availableModels?: string;
    trainingImages: string[];
    status: 'training' | 'ready' | 'failed';
    error?: string;
  };
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MyCharactersPage() {
  const { data, error, mutate } = useSWR<{ characters: Character[] }>('/api/characters', fetcher);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400 bg-green-900/20';
      case 'training': return 'text-yellow-400 bg-yellow-900/20';
      case 'failed': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready to Use';
      case 'training': return 'Training...';
      case 'failed': return 'Training Failed';
      default: return 'Unknown';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Characters</h1>
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            Failed to load characters. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Characters</h1>
            <p className="text-neutral-400">
              Manage your AI characters and their training status
            </p>
          </div>
          <Link href="/create-character">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create New Character
            </Button>
          </Link>
        </div>

        {/* Characters Grid */}
        {!data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-neutral-900 border-neutral-800 p-6 animate-pulse">
                <div className="aspect-square bg-neutral-800 rounded-lg mb-4"></div>
                <div className="h-4 bg-neutral-800 rounded mb-2"></div>
                <div className="h-3 bg-neutral-800 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : data.characters.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-16 w-16 text-neutral-600 mb-4" />
            <h3 className="text-xl font-semibold text-neutral-300 mb-2">No Characters Yet</h3>
            <p className="text-neutral-500 mb-6">
              Create your first AI character to get started
            </p>
            <Link href="/create-character">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Character
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.characters.map((character) => (
              <Card key={character.id} className="bg-neutral-900 border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors">
                <div className="aspect-square relative">
                  <Image
                    src={character.url}
                    alt={character.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.png';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(character.metadata.status)}`}>
                      {getStatusText(character.metadata.status)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{character.name}</h3>
                  
                  <div className="space-y-2 text-sm text-neutral-400">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {character.metadata.gender}
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(character.createdAt).toLocaleDateString()}
                    </div>
                    
                    {character.metadata.availableModels && (
                      <div className="text-xs text-neutral-500">
                        Models: {character.metadata.availableModels}
                      </div>
                    )}
                  </div>

                  {character.metadata.status === 'failed' && character.metadata.error && (
                    <div className="mt-3 p-2 bg-red-900/20 border border-red-500 rounded text-xs text-red-300">
                      Error: {character.metadata.error}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      onClick={() => setSelectedCharacter(character)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Character Detail Modal */}
        {selectedCharacter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedCharacter.name}</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedCharacter(null)}
                    className="text-neutral-400 hover:text-white"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm text-neutral-400">Gender</label>
                    <p className="text-white">{selectedCharacter.metadata.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400">Status</label>
                    <p className={`${getStatusColor(selectedCharacter.metadata.status)} px-2 py-1 rounded text-xs inline-block`}>
                      {getStatusText(selectedCharacter.metadata.status)}
                    </p>
                  </div>
                </div>

                {selectedCharacter.metadata.availableModels && (
                  <div className="mb-6">
                    <label className="text-sm text-neutral-400">Available Models</label>
                    <p className="text-white">{selectedCharacter.metadata.availableModels}</p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="text-sm text-neutral-400 mb-2 block">Training Images</label>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedCharacter.metadata.trainingImages?.map((url, index) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`Training image ${index + 1}`}
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

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={selectedCharacter.metadata.status !== 'ready'}
                  >
                    Use in Generation
                  </Button>
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
