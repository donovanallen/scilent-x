import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/theme-provider';
import { doto, spaceGrotesk, sourceSans, spaceMono } from '@/lib/fonts';

import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Scilent X', template: '%s | Scilent X' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${sourceSans.variable} ${doto.variable} ${spaceMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <div className='flex flex-col h-screen'>{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
