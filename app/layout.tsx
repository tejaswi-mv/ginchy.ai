// Removed hardcoded background and text colors to use theme variables.
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Serif } from 'next/font/google';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Ginchy.ai',
  description: 'Get started quickly with virtual Photography.'
};

export const viewport: Viewport = {
  maximumScale: 1
};



const serif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
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
      className={`${serif.variable} dark`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-[100dvh]">
        <SWRConfig
          value={{
            fallback: {
              // Removed fallback data to prevent dynamic server usage during build
              // Components will fetch data client-side when needed
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
