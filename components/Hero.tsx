"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, CircleIcon, Home, LogOut } from "lucide-react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const tokens = {
  maxW: "max-w-[1400px]",
  gutter: "px-2 sm:px-3 lg:px-4",
  grid: "grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8",
};

function UserMenu({ user }: { user: User }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1 bg-neutral-900 border-neutral-700 text-white">
        <DropdownMenuItem className="cursor-pointer text-white hover:bg-neutral-800 focus:bg-neutral-800">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer text-white hover:bg-neutral-800 focus:bg-neutral-800">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavigationLinks() {
  const pathname = usePathname();
  const isDashboard =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/generate') ||
    pathname?.startsWith('/pricing');

  if (isDashboard) {
    return (
      <nav className="hidden md:flex items-center gap-6 text-sm">
        <Link
          href="/"
          className="text-neutral-300 hover:text-white transition"
        >
          Home
        </Link>
        <Link
          href="/pricing"
          className="text-neutral-300 hover:text-white transition"
        >
          Pricing
        </Link>
        <Link
          href="/dashboard"
          className="text-neutral-300 hover:text-white transition"
        >
          Dashboard
        </Link>
        <Link
          href="/generate"
          className="text-neutral-300 hover:text-white transition"
        >
          Generate
        </Link>
        <Link
          href="/my-creations"
          className="text-neutral-300 hover:text-white transition"
        >
          My Creations
        </Link>
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-6 text-base">
      <a href="#about" className="text-neutral-300 hover:text-white transition">
        About
      </a>
      <a
        href="#features"
        className="text-neutral-300 hover:text-white transition"
      >
        Features
      </a>
      <a
        href="#examples"
        className="text-neutral-300 hover:text-white transition"
      >
        Examples
      </a>
      <Link
        href="/pricing"
        className="text-neutral-300 hover:text-white transition"
      >
        Pricing
      </Link>
     
      <Link
        href="/generate"
        className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition"
        >
        Generate
        </Link>
    </nav>
  );
}

export default function Hero({ largeOnHome = false }: { largeOnHome?: boolean }) {
  const { data: user, isLoading } = useSWR<User>('/api/user', fetcher);
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
    <section className={`text-white relative bg-black`}>
      {/* Background SVG on right side */}
      <div 
        className="absolute top-0 right-0 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 h-full opacity-80 pointer-events-none"
        style={{
          transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)',
          transformOrigin: 'right center'
        }}
      >
        <Image 
          src="/images/herogrd.svg" 
          alt="Hero gradient background" 
          fill
          className="object-cover object-right"
          unoptimized
        />
      </div>
      {/* Integrated Navbar */}
      <header className={`sticky top-0 z-50 text-white ${tokens.gutter}`}>
        <div className={`mx-auto ${tokens.maxW} h-16 flex items-center`}>
          <div className="flex items-center gap-8">
            <span className={`text-white font-extrabold tracking-wide ${largeOnHome ? 'text-2xl' : ''}`}>
              GINCHY
            </span>
            <NavigationLinks />
          </div>
          <div className="flex items-center space-x-4 ml-auto mr-25">
            {isLoading ? (
              <div className="h-9 w-16 bg-neutral-800 rounded-full animate-pulse" />
            ) : user ? (
              <UserMenu user={user} />
            ) : (
              <Button
                asChild
                className="rounded-full bg-[#1E90FF] px-5 py-2 text-base font-semibold text-white hover:bg-[#1E90FF]/90 transition"
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Content */}
      <div className={`${tokens.gutter} pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20`}>
        <div className={`mx-auto ${tokens.maxW}`}>
        <div className={tokens.grid}>
          {/* Left: copy */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
            <h1 className="font-['Aileron','Inter',system-ui,sans-serif] text-[32px] sm:text-[48px] md:text-[64px] lg:text-[88px] font-bold leading-[0.95] tracking-tight">
              <span className="text-[#1E90FF]">UNLOCK</span>
              <br />
              <span className="italic font-['IBM_Plex_Serif','Georgia',serif] text-white ml-[0.3em] sm:ml-[0.6em]">GROWTH</span>
            </h1>
            <p className="mt-4 sm:mt-6 ml-[0.3em] sm:ml-[0.6em] text-[14px] sm:text-[18px] md:text-[20px] lg:text-[24px] text-white max-w-[90%] sm:max-w-[560px] leading-tight sm:leading-none font-bold">
              Adopt the industry's leading AI platform<br className="hidden sm:block"/>
              <span className="sm:hidden"> </span>for in-house creation of PDP, Lookbook,<br className="hidden sm:block"/>
              <span className="sm:hidden"> </span>and Campaign visuals.
            </p>
            <p className="mt-4 sm:mt-6 ml-[0.3em] sm:ml-[0.6em] text-[#1E90FF] italic font-['IBM_Plex_Serif','Georgia',serif] text-[24px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-medium">[ with Ginchy ]</p>
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
                  <div className="col-span-12 lg:col-span-6 mt-6 sm:mt-8 lg:mt-0 lg:ml-[-4rem] xl:ml-[-8rem] lg:mr-25">
                    <div 
                      className="relative overflow-hidden border-2 border-white/20 shadow-2xl mx-auto"
                      style={{
                        aspectRatio: '3764/2056', // Custom aspect ratio based on your dimensions
                        maxWidth: '100%',
                        width: '100%'
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
      </div>
    </section>
  );
}
