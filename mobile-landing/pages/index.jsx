import Head from 'next/head';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import PricingCard from '../components/PricingCard';
import SignupForm from '../components/SignupForm';

export default function Home() {
  return (
    <>
      <Head>
        <title>Ginchy - AI-Powered Content Creation | Create Stunning Visuals in Seconds</title>
        <meta name="description" content="Transform your ideas into professional AI-generated content in seconds. Perfect for creators, marketers, and businesses. Start your free trial today!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ginchy.ai/" />
        <meta property="og:title" content="Ginchy - AI-Powered Content Creation" />
        <meta property="og:description" content="Create professional AI-generated content in seconds. Perfect for creators, marketers, and businesses." />
        <meta property="og:image" content="/assets/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://ginchy.ai/" />
        <meta property="twitter:title" content="Ginchy - AI-Powered Content Creation" />
        <meta property="twitter:description" content="Create professional AI-generated content in seconds. Perfect for creators, marketers, and businesses." />
        <meta property="twitter:image" content="/assets/og-image.jpg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      <main id="main-content" className="relative">
        <Header />
        <Hero />
        <Features />
        <HowItWorks />
        <PricingCard />
        <SignupForm />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Ginchy
                </span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Create professional AI-generated content in seconds. 
                Perfect for creators, marketers, and businesses.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Product</h3>
              <div className="space-y-4">
                <a href="#features" className="block text-gray-400 hover:text-white transition-colors text-lg">Features</a>
                <a href="#pricing" className="block text-gray-400 hover:text-white transition-colors text-lg">Pricing</a>
                <a href="#how-it-works" className="block text-gray-400 hover:text-white transition-colors text-lg">How it Works</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">API</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Integrations</a>
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Company</h3>
              <div className="space-y-4">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">About</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Blog</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Careers</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Press</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Partners</a>
              </div>
            </div>

            {/* Support Links */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Support</h3>
              <div className="space-y-4">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Contact</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Privacy</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Terms</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-lg">Security</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-lg">
                © 2024 Ginchy. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
