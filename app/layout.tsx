import './globals.css';
import { BibleContextProvider } from '@/components/contexts/BibleContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BibleTok',
  description: 'Explore Bible verses in a fun, engaging format',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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