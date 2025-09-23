"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const tokens = {
  maxW: "max-w-[1200px]",
  gutter: "px-4 sm:px-6 lg:px-8",
  grid: "grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8",
};

export default function Hero() {
  return (
    <section className={`${tokens.gutter} pt-24 pb-20 bg-black text-white relative`}>
      
      <div className={`mx-auto ${tokens.maxW}`}>
        <div className={tokens.grid}>
          {/* Left: copy */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
            <h1 className="font-['Aileron','Inter',system-ui,sans-serif] text-[48px] sm:text-[64px] lg:text-[88px] font-bold leading-[0.95] tracking-tight">
              <span className="text-[#1E90FF]">UNLOCK</span>
              <br />
              <span className="italic font-['IBM_Plex_Serif','Georgia',serif] text-white ml-[0.6em]">GROWTH</span>
            </h1>
            <p className="mt-6 text-[18px] sm:text-[20px] lg:text-[24px] text-white max-w-[560px] leading-relaxed font-bold">
              Adopt the industry's leading AI platform<br/>
              for in-house creation of PDP, Lookbook,<br/>
              and Campaign visuals.
            </p>
            <p className="mt-6 ml-[0.6em] text-[#1E90FF] italic font-['IBM_Plex_Serif','Georgia',serif] text-[32px] sm:text-[36px] lg:text-[40px] font-medium">[ with Ginchy ]</p>
            <div className="mt-6">
              <a 
                href="#try" 
                className="inline-flex lg:hidden items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#1E90FF] to-[#0EA5E9] px-8 py-4 text-white text-lg font-bold hover:shadow-lg transition-all duration-300"
              >
                <span>Try it now</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

                  {/* Right: Hero Image with Custom Dimensions */}
                  <div className="col-span-12 lg:col-span-6 mt-10 lg:mt-0 lg:ml-[-8rem]">
                    <div 
                      className="relative overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl"
                      style={{
                        aspectRatio: '3764/2056', // Custom aspect ratio based on your dimensions
                        maxWidth: '75%',
                        width: '75%'
                      }}
                    >
              {/* Image Container with Custom Dimensions */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-black">
                {/* Placeholder for your custom photo (3764w × 2056h) */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900">
                  <div className="text-center text-white/60">
                    <div className="text-sm font-mono mb-2">Photo Placeholder</div>
                    <div className="text-xs font-mono">3764 × 2056</div>
                  </div>
                </div>
                
                {/* Current image as fallback */}
                <Image 
                  src="/images/video.png" 
                  alt="Hero video" 
                  unoptimized
                  fill
                  className="object-cover opacity-30"
                  priority
                />
              </div>
            </div>
            {/* CTA under hero showcase on desktop */}
            <div className="hidden lg:block mt-4" style={{marginLeft: 'calc(-8rem + 7rem)', width: '75%'}}>
              <a 
                href="#try" 
                className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#1E90FF] to-[#0EA5E9] px-8 py-4 text-white text-lg font-bold hover:shadow-lg transition-all duration-300"
              >
                <span>Try it now</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
