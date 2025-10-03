'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Users, 
  Camera, 
  Video, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  Lightbulb
} from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              GINCHY
            </h1>
            <p className="text-xl md:text-2xl text-neutral-300 mb-8 max-w-3xl mx-auto">
              The future of virtual photoshoots and AI-powered content creation
            </p>
            <p className="text-lg text-neutral-400 max-w-4xl mx-auto leading-relaxed">
              GINCHY revolutionizes how companies and creators produce visual content. 
              No more expensive traditional shoots - just AI models, your products, and unlimited creativity.
            </p>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
              <Camera className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI Model Library</h3>
              <p className="text-neutral-400">
                Choose from pre-trained models or upload photos to create custom AI characters for your brand.
              </p>
            </div>
            
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
              <Zap className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Digital Clothing</h3>
              <p className="text-neutral-400">
                Upload your product shots and watch AI automatically dress your models with your clothing.
              </p>
            </div>
            
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
              <Video className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Video Generation</h3>
              <p className="text-neutral-400">
                Create stunning videos with AI models showcasing your products in motion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How GINCHY Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign Up & Choose Package</h3>
              <p className="text-neutral-400">
                Create your profile and select a package that fits your needs and budget.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Select or Train AI Model</h3>
              <p className="text-neutral-400">
                Choose from our library or upload photos to train your custom AI model.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Your Products</h3>
              <p className="text-neutral-400">
                Upload clothing, accessories, or any products you want to showcase.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Generate Content</h3>
              <p className="text-neutral-400">
                Create professional photos and videos with AI models wearing your products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tools Integration */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Powered by Advanced AI</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">NanoBanana</h3>
              <p className="text-neutral-400 text-sm">
                Model training and clothing application engine
              </p>
            </div>
            
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kling</h3>
              <p className="text-neutral-400 text-sm">
                Video generation and editing
              </p>
            </div>
            
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">MidJourney</h3>
              <p className="text-neutral-400 text-sm">
                High-quality image generation
              </p>
            </div>
            
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Magnifique</h3>
              <p className="text-neutral-400 text-sm">
                Image upscaling and enhancement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Choose Your Package</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
              <h3 className="text-2xl font-bold mb-4">Standard</h3>
              <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-neutral-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />100 credits/month</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />5 AI models</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />Basic model library</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />Clothing AI</li>
              </ul>
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-xl border border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="text-4xl font-bold mb-6">$79<span className="text-lg text-neutral-300">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />300 credits/month</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />20 AI models</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />Custom model training</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />Video generation</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />Upscaling</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />Priority support</li>
              </ul>
              <Button className="w-full bg-purple-500 hover:bg-purple-600">
                Get Started
              </Button>
            </div>
            
            <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800">
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <div className="text-4xl font-bold mb-6">$199<span className="text-lg text-neutral-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />1000 credits/month</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />100 AI models</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />All AI integrations</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />API access</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />Priority rendering</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-3" />24/7 support</li>
              </ul>
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why GINCHY */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose GINCHY?</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Traditional Shoots vs GINCHY</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white text-sm">✗</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-400 mb-2">Traditional Shoots</h4>
                    <p className="text-neutral-400">Expensive models, photographers, studios, and time-consuming setup</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">GINCHY AI</h4>
                    <p className="text-neutral-400">Affordable, instant, unlimited variations, and available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-6">Perfect For</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 p-4 rounded-lg">
                  <Target className="w-8 h-8 text-blue-400 mb-3" />
                  <h4 className="font-semibold mb-2">E-commerce</h4>
                  <p className="text-sm text-neutral-400">Product photography at scale</p>
                </div>
                <div className="bg-neutral-900 p-4 rounded-lg">
                  <Users className="w-8 h-8 text-purple-400 mb-3" />
                  <h4 className="font-semibold mb-2">Fashion Brands</h4>
                  <p className="text-sm text-neutral-400">Model diversity and styling</p>
                </div>
                <div className="bg-neutral-900 p-4 rounded-lg">
                  <Lightbulb className="w-8 h-8 text-yellow-400 mb-3" />
                  <h4 className="font-semibold mb-2">Content Creators</h4>
                  <p className="text-sm text-neutral-400">Social media content</p>
                </div>
                <div className="bg-neutral-900 p-4 rounded-lg">
                  <Globe className="w-8 h-8 text-green-400 mb-3" />
                  <h4 className="font-semibold mb-2">Marketing Agencies</h4>
                  <p className="text-sm text-neutral-400">Client campaigns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Content Creation?</h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join thousands of creators and brands already using GINCHY to produce stunning visual content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-black hover:bg-neutral-200">
                View Pricing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/generate">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                Try Now
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
