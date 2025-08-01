import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type React from 'react';
import { Suspense } from 'react';

import { ReactQueryClientProvider } from '@/components/react-query-client-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { GitStatusProvider } from '@/context/git-status-context';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Terse CMS - File Editor',
  description: 'A CMS for managing Markdown files with YAML front matter'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryClientProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(inter.className, 'max-h-screen min-h-screen flex flex-col')}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <Suspense>
              <GitStatusProvider>{children}</GitStatusProvider>
            </Suspense>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
