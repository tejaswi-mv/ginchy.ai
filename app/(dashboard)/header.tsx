'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut } from 'lucide-react';
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

const tokens = {
  maxW: 'max-w-[1200px]',
  gutter: 'px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8'
};

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
    <nav className="hidden md:flex items-center gap-6 text-sm">
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
      <a
        href="#faq"
        className="text-neutral-300 hover:text-white transition"
      >
        FAQ
      </a>
      <Link
        href="/generate"
        className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition"
        >
        Generate
        </Link>
    </nav>
  );
}

export default function DashboardHeader({ largeOnHome = false }: { largeOnHome?: boolean }) {
  const { data: user, isLoading } = useSWR<User>('/api/user', fetcher);
  return (
    <header
      className={`sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-black/95 backdrop-blur-md text-white ${tokens.gutter}`}
    >
      <div className={`mx-auto ${tokens.maxW} h-16 flex items-center`}>
        <div className="flex items-center gap-8">
          <span className={`text-white font-extrabold tracking-wide ${largeOnHome ? 'text-2xl' : ''}`}>
            GINCHY
          </span>
          <NavigationLinks />
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          {isLoading ? (
            <div className="h-9 w-16 bg-neutral-800 rounded-full animate-pulse" />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <Button
              asChild
              className="rounded-full bg-[#1E90FF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1E90FF]/90 transition"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
