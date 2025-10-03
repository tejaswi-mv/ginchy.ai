'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { GINCHY_PACKAGES, getAllPackages } from '@/lib/packages/ginchy-packages';
import Link from 'next/link';

export default function GINCHYPricingPage() {
  const [selectedPackage, setSelectedPackage] = useState<string>('pro');
  const packages = getAllPackages();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Choose Your GINCHY Plan
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Unlock the power of AI fashion generation with our tailored packages designed for creators, professionals, and enterprises.
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative transition-all duration-300 hover:scale-105 ${
                pkg.tier === 'pro' 
                  ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/20 bg-gradient-to-br from-blue-900/20 to-purple-900/20' 
                  : 'border border-neutral-700 bg-neutral-900/50 hover:border-neutral-600'
              }`}
            >
              {/* Popular Badge */}
              {pkg.tier === 'pro' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  {pkg.tier === 'standard' && <Sparkles className="h-8 w-8 text-green-400" />}
                  {pkg.tier === 'pro' && <Zap className="h-8 w-8 text-blue-400" />}
                  {pkg.tier === 'premium' && <Crown className="h-8 w-8 text-purple-400" />}
                </div>
                <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                <CardDescription className="text-neutral-400">
                  {pkg.tier === 'standard' && 'Perfect for getting started'}
                  {pkg.tier === 'pro' && 'Best for professionals'}
                  {pkg.tier === 'premium' && 'For teams and enterprises'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    ${(pkg.price / 100).toFixed(0)}
                    <span className="text-lg text-neutral-400">/month</span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {pkg.monthlyCredits} credits included
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>{pkg.monthlyCredits} AI generations per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Up to {pkg.maxModels} custom models</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Up to {pkg.maxVideos} video generations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Character training & AI models</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Clothing AI & detection</span>
                  </div>
                  
                  {pkg.features.hasUpscaling && (
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      <span className="text-blue-400">Image upscaling (2x-4x)</span>
                    </div>
                  )}
                  
                  {pkg.features.hasBatchProcessing && (
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      <span className="text-blue-400">Batch processing</span>
                    </div>
                  )}
                  
                  {pkg.features.hasPrioritySupport && (
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-purple-400 flex-shrink-0" />
                      <span className="text-purple-400">Priority support</span>
                    </div>
                  )}
                  
                  {pkg.features.hasAPI && (
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-purple-400 flex-shrink-0" />
                      <span className="text-purple-400">API access</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full ${
                    pkg.tier === 'pro' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                  asChild
                >
                  <Link href={`/sign-up?package=${pkg.id}`}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                {/* Limits */}
                <div className="pt-4 border-t border-neutral-700">
                  <h4 className="text-sm font-semibold mb-2 text-neutral-300">Monthly Limits</h4>
                  <div className="space-y-1 text-xs text-neutral-400">
                    <div>Images: {pkg.limits.maxImageGenerations}</div>
                    <div>Videos: {pkg.limits.maxVideoGenerations}</div>
                    {pkg.features.hasUpscaling && (
                      <div>Upscales: {pkg.limits.maxUpscales}</div>
                    )}
                    <div>Clothing AI: {pkg.limits.maxClothingApplications}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Compare All Features
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-4 px-4">Features</th>
                    {packages.map((pkg) => (
                      <th key={pkg.id} className="text-center py-4 px-4 font-semibold">
                        {pkg.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-neutral-800">
                    <td className="py-4 px-4">Monthly Credits</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-4 px-4">
                        {pkg.monthlyCredits}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-4 px-4">Custom Models</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-4 px-4">
                        {pkg.maxModels}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-4 px-4">Video Generation</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-4 px-4">
                        {pkg.maxVideos}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-4 px-4">Image Upscaling</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-4 px-4">
                        {pkg.features.hasUpscaling ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-4 px-4">Batch Processing</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-4 px-4">
                        {pkg.features.hasBatchProcessing ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-4 px-4">API Access</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-4 px-4">
                        {pkg.features.hasAPI ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4">Priority Support</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="text-center py-4 px-4">
                        {pkg.features.hasPrioritySupport ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">What are credits?</h3>
              <p className="text-neutral-400">
                Credits are used for AI operations. Each image generation costs 1 credit, 
                video generation costs 3 credits, and upscaling costs 2 credits.
              </p>
            </div>
            
            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Can I upgrade my plan?</h3>
              <p className="text-neutral-400">
                Yes! You can upgrade your plan at any time. Unused credits from your 
                current plan will be prorated and added to your new plan.
              </p>
            </div>
            
            <div className="bg-neutral-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">What happens if I exceed my limits?</h3>
              <p className="text-neutral-400">
                You can purchase additional credits or upgrade your plan. We'll notify 
                you when you're approaching your limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}