'use client';

import DashboardHeader from './header';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return (
    <section className="flex flex-col min-h-screen">
      <DashboardHeader largeOnHome={isHomePage} />
      {children}
    </section>
  );
}