import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/components/providers/session-provider';
import './globals.css';
import { ToasterClient } from '@/components/ui/toaster-client';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Event Management System',
  description: 'Manage events, registrations, and check-ins with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <SessionProvider>
          <TooltipProvider>
            {children}
            <ToasterClient />
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
