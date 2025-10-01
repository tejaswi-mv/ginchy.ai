'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  ExternalLink, 
  Check,
  ArrowLeft,
  Calendar,
  CreditCard,
  Gift
} from 'lucide-react';

interface BillingPageProps {
  user: {
    credits: number;
    name: string;
  };
  onBack: () => void;
}

export default function BillingPage({ user, onBack }: BillingPageProps) {
  const [promoCode, setPromoCode] = useState('');

  // Mock billing history data
  const billingHistory = [
    { id: '12451-89954', amount: '$10.00', date: 'Dec 1, 2025', status: 'Paid' },
    { id: '12451-89953', amount: '$10.00', date: 'Nov 1, 2025', status: 'Paid' },
    { id: '12451-89952', amount: '$10.00', date: 'Oct 1, 2025', status: 'Paid' },
    { id: '12451-89951', amount: '$10.00', date: 'Sep 1, 2025', status: 'Paid' },
    { id: '12451-89950', amount: '$10.00', date: 'Aug 1, 2025', status: 'Paid' },
    { id: '12451-89949', amount: '$10.00', date: 'Jul 1, 2025', status: 'Paid' },
    { id: '12451-89948', amount: '$10.00', date: 'Jun 1, 2025', status: 'Paid' },
  ];

  const creditsUsed = 1; // Assuming 1 credit used out of 300
  const creditsRemaining = user.credits - creditsUsed;
  const progressPercentage = (creditsRemaining / 300) * 100;

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
        <p className="text-neutral-400">Manage your billing and payment details.</p>
      </div>

      {/* Current Plan Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Current plan</h2>
        
        {/* Basic Plan */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Basic Plan</h3>
              <p className="text-neutral-400">Your plan renew on 26th, Oct, 2025</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                Manage Subscription
              </Button>
              <Button variant="ghost" className="text-white hover:bg-neutral-800">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{user.credits} Credits</h3>
              <p className="text-neutral-400">Your plan renew on 26th, Oct, 2025</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Buy More Credits
            </Button>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Promo code</h2>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex gap-4">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Click and enter promo code here."
              className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
            />
            <Button variant="ghost" className="text-white hover:bg-neutral-800">
              Enter code
            </Button>
          </div>
        </div>
      </div>

      {/* Billing History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Billing history</h2>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Download all
          </Button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-neutral-800 bg-neutral-950">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-neutral-600 bg-neutral-800" />
              <span className="text-sm font-medium text-neutral-300">Invoice</span>
            </div>
            <div className="text-sm font-medium text-neutral-300">Amount</div>
            <div className="text-sm font-medium text-neutral-300">Date</div>
            <div className="text-sm font-medium text-neutral-300">Status</div>
            <div className="text-sm font-medium text-neutral-300">Actions</div>
          </div>

          {/* Table Rows */}
          {billingHistory.map((invoice, index) => (
            <div key={invoice.id} className="grid grid-cols-5 gap-4 p-4 border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/50">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-neutral-600 bg-neutral-800" />
                <span className="text-sm text-white">#{invoice.id} - {invoice.date.split(',')[1]?.trim()}</span>
              </div>
              <div className="text-sm text-white">{invoice.amount}</div>
              <div className="text-sm text-white">{invoice.date}</div>
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-900 text-green-300 text-xs">
                  <Check className="h-3 w-3" />
                  {invoice.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-neutral-700 rounded">
                  <ExternalLink className="h-4 w-4 text-neutral-400" />
                </button>
                <button className="p-1 hover:bg-neutral-700 rounded">
                  <Download className="h-4 w-4 text-neutral-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
