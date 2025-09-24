"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const tokens = {
  maxW: "max-w-[1200px]",
  gutter: "px-4 sm:px-6 lg:px-8",
  grid: "grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8",
};

export default function Hero() {
  useEffect(() => {
    const video = document.getElementById('hero-video') as HTMLVideoElement;
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const progressFill = document.getElementById('progress-fill');
    
    if (video && playIcon && pauseIcon && progressFill) {
      const updateIcons = () => {
        if (video.paused) {
          playIcon.classList.remove('hidden');
          pauseIcon.classList.add('hidden');
        } else {
          playIcon.classList.add('hidden');
          pauseIcon.classList.remove('hidden');
        }
      };
      
      const updateProgress = () => {
        if (video.duration) {
          const percentage = (video.currentTime / video.duration) * 100;
          progressFill.style.width = `${percentage}%`;
        }
      };
      
      video.addEventListener('play', updateIcons);
      video.addEventListener('pause', updateIcons);
      video.addEventListener('timeupdate', updateProgress);
      
      // Initial state
      updateIcons();
    }
  }, []);

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
                      className="relative overflow-hidden border-2 border-white/20 shadow-2xl"
                      style={{
                        aspectRatio: '3764/2056', // Custom aspect ratio based on your dimensions
                        maxWidth: '95%',
                        width: '95%'
                      }}
                    >
              {/* Video Container with Custom Dimensions */}
              <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-black group">
                {/* Hero Video */}
                <video 
                  id="hero-video"
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                >
                  <source src="/images/hero.mp4" type="video/mp4" />
                  {/* Fallback image if video fails to load */}
                  <Image 
                    src="/images/video.png" 
                    alt="Hero video fallback" 
                    unoptimized
                    fill
                    className="object-cover"
                    priority
                  />
                </video>
                
                {/* Center Play/Pause Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => {
                      const video = document.getElementById('hero-video') as HTMLVideoElement;
                      if (video) {
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }}
                    className="bg-black/70 hover:bg-black/90 text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
                    title="Play/Pause"
                  >
                    <svg id="play-icon" className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                    <svg id="pause-icon" className="w-8 h-8 hidden" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a1 1 0 011-1h1.5a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4zM12 4a1 1 0 011-1H14.5a1 1 0 011 1v12a1 1 0 01-1 1H13a1 1 0 01-1-1V4z"/>
                    </svg>
                  </button>
                </div>

                {/* YouTube-style Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     onClick={(e) => {
                       const video = document.getElementById('hero-video') as HTMLVideoElement;
                       const progressBar = e.currentTarget;
                       const rect = progressBar.getBoundingClientRect();
                       const clickX = e.clientX - rect.left;
                       const percentage = clickX / rect.width;
                       if (video && video.duration) {
                         video.currentTime = percentage * video.duration;
                       }
                     }}
                >
                  {/* Background track */}
                  <div className="h-full bg-white/20 rounded-full">
                    {/* Watched portion - blue */}
                    <div 
                      id="progress-fill"
                      className="h-full bg-[#1E90FF] rounded-full transition-all duration-100 relative"
                      style={{ width: '0%' }}
                    >
                      {/* Hover indicator dot */}
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-[#1E90FF] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* CTA under hero showcase on desktop */}
            <div className="hidden lg:block mt-4" style={{marginLeft: 'calc(-8rem + 8rem)', width: '95%'}}>
              <a 
                href="#try" 
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#1E90FF] to-[#0EA5E9] px-8 py-2 text-white text-lg font-bold hover:shadow-lg transition-all duration-300 rounded-lg"
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
