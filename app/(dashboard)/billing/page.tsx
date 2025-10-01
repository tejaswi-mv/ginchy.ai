'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Check,
  ChevronDown
} from 'lucide-react';
import ProfileDropdown from '@/components/ProfileDropdown';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BillingPage() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  const billingHistory = [
    { invoice: "#12451-89954 - Dec 2025", amount: "USD $10.00", date: "Dec 1, 2025", status: "Paid" },
    { invoice: "#12451-89954 - Nov 2025", amount: "USD $10.00", date: "Nov 1, 2025", status: "Paid" },
    { invoice: "#12451-89954 - Oct 2025", amount: "USD $10.00", date: "Oct 1, 2025", status: "Paid" },
    { invoice: "#12451-89954 - Sep 2025", amount: "USD $10.00", date: "Sep 1, 2025", status: "Paid" },
    { invoice: "#12451-89954 - Aug 2025", amount: "USD $10.00", date: "Aug 1, 2025", status: "Paid" },
    { invoice: "#12451-89954 - Jul 2025", amount: "USD $10.00", date: "Jul 1, 2025", status: "Paid" },
    { invoice: "#12451-89954 - Jun 2025", amount: "USD $10.00", date: "Jun 1, 2025", status: "Paid" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-950/60">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-extrabold tracking-wide text-xl md:text-2xl">GINCHY</span>
            {user && <ProfileDropdown user={user} />}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
          <p className="text-neutral-400">Manage your billing and payment details.</p>
        </div>

        {/* Billing Card */}
        <div className="bg-neutral-900 rounded-xl p-6 space-y-8">
          {/* Current Plan Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Current plan</h2>
            <div className="bg-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Basic Plan</h3>
                  <p className="text-neutral-400 text-sm">Your plan renew on 26th, Oct, 2025</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600">
                    Manage Subscription
                  </Button>
                  <Button variant="outline" className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600">
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Credits Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">299 Credits</h3>
                <p className="text-neutral-400 text-sm">Your plan renew on 26th, Oct, 2025</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Buy More Credits
              </Button>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Promo code</h2>
            <div className="flex gap-3">
              <Input 
                placeholder="Glincy45" 
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Apply
              </Button>
            </div>
          </div>

          {/* Billing History Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Billing history</h2>
              <Button variant="outline" className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600">
                <Download className="w-4 h-4 mr-2" />
                Download all
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-3 px-4">
                      <input type="checkbox" className="rounded border-neutral-600 bg-neutral-800" />
                    </th>
                    <th className="text-left py-3 px-4 text-white font-medium">
                      Invoice <ChevronDown className="w-4 h-4 inline ml-1" />
                    </th>
                    <th className="text-left py-3 px-4 text-white font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((item, index) => (
                    <tr key={index} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                      <td className="py-3 px-4">
                        <input type="checkbox" className="rounded border-neutral-600 bg-neutral-800" />
                      </td>
                      <td className="py-3 px-4 text-white">{item.invoice}</td>
                      <td className="py-3 px-4 text-white">{item.amount}</td>
                      <td className="py-3 px-4 text-white">{item.date}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center text-green-400">
                          <Check className="w-4 h-4 mr-1" />
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-neutral-700 rounded">
                            <ExternalLink className="w-4 h-4 text-neutral-400" />
                          </button>
                          <button className="p-1 hover:bg-neutral-700 rounded">
                            <RefreshCw className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
