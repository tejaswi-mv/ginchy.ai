// Removed hardcoded background and text colors to use theme variables.
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Serif } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Ginchy.ai',
  description: 'Get started quickly with virtual Photography.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' });
const serif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${serif.variable} dark`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-blue-900 to-black">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
