'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Sign Up',
    description: 'Create your free account in seconds. No credit card required to get started.',
    icon: '👤',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    title: 'Choose Your Style',
    description: 'Select from our library of professional templates or upload your own reference images.',
    icon: '🎨',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '03',
    title: 'Generate Content',
    description: 'Describe what you want to create and let our AI generate stunning visuals instantly.',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    number: '04',
    title: 'Download & Share',
    description: 'Get your high-resolution files ready for any platform. Download and use immediately.',
    icon: '📥',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-gradient-to-br from-green-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Simple Process
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            How It Works
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              In 4 Simple Steps
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get started in minutes with our simple 4-step process. 
            No technical skills required.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Step Visual */}
              <div className="flex-shrink-0 relative">
                <div className="relative">
                  {/* Main Circle */}
                  <div className={`w-32 h-32 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-2xl`}>
                    {step.number}
                  </div>
                  
                  {/* Icon Circle */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="max-w-2xl mx-auto lg:mx-0">
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of creators who are already using Ginchy to create amazing content. 
                Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="#contact" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Creating Now
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a 
                  href="#features" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
