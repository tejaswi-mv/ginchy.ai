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
  LogOut,
  RefreshCw
} from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  onBillingClick?: () => void;
}

export default function ProfileDropdown({ user, onBillingClick }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    mutate('/api/user');
    router.push('/');
  };

  const handleRefreshCredits = async () => {
    try {
      // Call the fix-credits API
      const response = await fetch('/api/fix-credits');
      if (response.ok) {
        // Refresh user data
        mutate('/api/user');
        alert('Credits updated to 400!');
      } else {
        alert('Failed to update credits');
      }
    } catch (error) {
      console.error('Error refreshing credits:', error);
      alert('Error updating credits');
    }
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">
            {user.credits ?? 0} credits
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefreshCredits();
            }}
            className="p-1 hover:bg-neutral-700 rounded transition-colors"
            title="Refresh credits"
          >
            <RefreshCw className="h-3 w-3 text-neutral-400 hover:text-white" />
          </button>
        </div>
        <Avatar className="size-8 border border-neutral-800">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback className="text-xs bg-neutral-800 text-white">
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4 text-neutral-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20">
            {/* User Info Section */}
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage alt={user.name || ''} />
                  <AvatarFallback className="text-sm bg-neutral-800 text-white">
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
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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

            {/* Menu Items */}
            <div className="py-2">
              <Link 
                href="/my-creations" 
                className="flex items-center gap-3 px-4 py-2 text-white hover:bg-neutral-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Grid3X3 className="h-4 w-4 text-neutral-400" />
                <span className="text-sm">My creations</span>
              </Link>
              
              <Link 
                href="/dashboard/general" 
                className="flex items-center gap-3 px-4 py-2 text-white hover:bg-neutral-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4 text-neutral-400" />
                <span className="text-sm">Settings</span>
              </Link>
              
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onBillingClick?.();
                }}
                className="flex items-center gap-3 px-4 py-2 text-white hover:bg-neutral-800 transition-colors w-full text-left"
              >
                <DollarSign className="h-4 w-4 text-neutral-400" />
                <span className="text-sm">Billing</span>
              </button>
              
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 text-white hover:bg-neutral-800 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4 text-neutral-400" />
                <span className="text-sm">Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
