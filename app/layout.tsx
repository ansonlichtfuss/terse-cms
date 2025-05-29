import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type React from 'react';

import { ReactQueryClientProvider } from '@/components/react-query-client-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { GitStatusProvider } from '@/context/git-status-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Markdown CMS - File Editor',
  description: 'A CMS for managing Markdown files with YAML front matter',
  generator: 'v0.dev'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryClientProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <GitStatusProvider>{children}</GitStatusProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
