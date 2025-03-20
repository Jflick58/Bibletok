import './globals.css';
import { BibleContextProvider } from '@/components/contexts/BibleContext';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'BibleTok',
  description: 'Explore Bible verses in a fun, engaging format',
  icons: {
    icon: '/favicon.ico',
    apple: '/images/ios/AppIcon@3x.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'BibleTok',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Viewport meta tag is now handled by Next.js metadata */}
      </head>
      <body className="overflow-hidden">
        <BibleContextProvider>
          <div className="fixed inset-0 overflow-hidden">
            {children}
          </div>
        </BibleContextProvider>
      </body>
    </html>
  );
}