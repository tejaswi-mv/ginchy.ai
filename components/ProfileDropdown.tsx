'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/db/schema';
import { signOut } from '@/app/(login)/actions';
import { mutate } from 'swr';
import { 
  ChevronDown, 
  Grid3X3, 
  Settings, 
  DollarSign, 
  LogOut 
} from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    mutate('/api/user');
    router.push('/');
  };

  return (
    <div className="relative">
      {/* Profile Button - Match the screenshot exactly */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-neutral-800/50 transition-colors rounded-lg px-2 py-1"
      >
        <span className="text-white text-sm font-medium">
          {user.credits ?? 0} credits
        </span>
        <Avatar className="size-8 rounded-full border border-neutral-800">
          <AvatarImage alt={user.name || ''} className="rounded-full" />
          <AvatarFallback className="text-xs bg-neutral-800 text-white rounded-full">
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4 text-neutral-400" />
      </button>

      {/* Dropdown Menu - Match screenshot design */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content - Compact design like screenshot */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20">
            {/* User Info Section - Compact layout */}
            <div className="p-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                {/* Circular Profile Picture */}
                <Avatar className="size-8 rounded-full">
                  <AvatarImage alt={user.name || ''} className="rounded-full" />
                  <AvatarFallback className="text-xs bg-neutral-800 text-white rounded-full">
                    {user.email
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium text-sm">
                    {user.name || 'User'}
                  </p>
                  <div className="flex items-center gap-1">
                    {/* Blue checkmark icon */}
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">
                      {user.credits ?? 0} credits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items - Compact spacing */}
            <div className="py-1">
              <Link 
                href="/my-creations" 
                className="flex items-center gap-3 px-3 py-2 text-white hover:bg-neutral-800 transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                <Grid3X3 className="h-4 w-4 text-neutral-400" />
                <span>My creations</span>
              </Link>
              
              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-3 px-3 py-2 text-white hover:bg-neutral-800 transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4 text-neutral-400" />
                <span>Settings</span>
              </Link>
              
              <Link 
                href="/billing" 
                className="flex items-center gap-3 px-3 py-2 text-white hover:bg-neutral-800 transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                <DollarSign className="h-4 w-4 text-neutral-400" />
                <span>Billing</span>
              </Link>
              
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 text-white hover:bg-neutral-800 transition-colors w-full text-left text-sm"
              >
                <LogOut className="h-4 w-4 text-neutral-400" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
