'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Play, Download, Sparkles, Clock, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { generateImage } from '@/app/(login)/actions';

export default function CreateVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('5');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [quality, setQuality] = useState('hd');
  const [generateState, generateAction, isGenerating] = useActionState<any, FormData>(generateImage, null);

  const handleGenerate = () => {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('processor', 'Kling'); // Use Kling for video generation
    formData.append('aspectRatio', aspectRatio);
    formData.append('duration', duration);
    formData.append('quality', quality);
    generateAction(formData);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild>
              <Link href="/generate">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Generate
              </Link>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
              <Video className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Create AI Videos</h1>
            <p className="text-xl text-neutral-400">
              Generate professional fashion videos with AI
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Video Generation Form */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Video Generation
                </CardTitle>
                <CardDescription>
                  Create stunning fashion videos using our advanced AI technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="prompt">Video Description</Label>
                  <textarea
                    id="prompt"
                    placeholder="Describe the video you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-white placeholder-neutral-400 focus:border-primary focus:outline-none"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-white focus:border-primary focus:outline-none"
                    >
                      <option value="3">3 seconds</option>
                      <option value="5">5 seconds</option>
                      <option value="10">10 seconds</option>
                      <option value="15">15 seconds</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                    <select
                      id="aspectRatio"
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-white focus:border-primary focus:outline-none"
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="4:3">4:3 (Classic)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quality">Quality</Label>
                  <select
                    id="quality"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-white focus:border-primary focus:outline-none"
                  >
                    <option value="standard">Standard (720p)</option>
                    <option value="hd">HD (1080p)</option>
                    <option value="4k">4K (2160p)</option>
                  </select>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={!prompt || isGenerating}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>

                {generateState?.error && (
                  <div className="text-red-400 text-sm">
                    {generateState.error}
                  </div>
                )}

                {generateState?.success && generateState.imageUrl && (
                  <div className="space-y-4">
                    <div className="text-green-400 text-sm">
                      Video generated successfully!
                    </div>
                    <div className="relative w-full h-64 bg-neutral-800 rounded-lg overflow-hidden">
                      <video 
                        src={generateState.imageUrl} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Button asChild className="w-full">
                      <a href={generateState.imageUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features & Info */}
            <div className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Generate videos from text descriptions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Multiple video formats and durations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Professional quality output</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Custom aspect ratios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Fashion-focused AI models</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-neutral-400">
                    <p>• Be specific about the fashion style and mood</p>
                    <p>• Include details about lighting and camera angles</p>
                    <p>• Mention the type of movement you want</p>
                    <p>• Shorter videos (3-5s) generate faster</p>
                    <p>• Higher quality settings use more credits</p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button asChild variant="outline" className="border-neutral-700">
                  <Link href="/generate">Try Image Generation Instead</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}