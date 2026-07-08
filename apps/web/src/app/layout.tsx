import type { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';

import { PaletteProvider } from '@/components/palette-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { doto, spaceGrotesk, sourceSans, spaceMono } from '@/lib/fonts';
import { PALETTE_STORAGE_KEY } from '@/lib/themes';

import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Scilent X', template: '%s | Scilent X' },
};

// Applies the persisted palette to <html> before hydration to avoid a flash of
// the default palette. Mode (light/dark) is handled separately by next-themes.
const paletteNoFlashScript = `(function(){try{var p=localStorage.getItem('${PALETTE_STORAGE_KEY}');if(p&&p!=='default'){document.documentElement.dataset.theme=p;}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang='en' suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: paletteNoFlashScript }} />
        </head>
        <body
          className={`${spaceGrotesk.variable} ${sourceSans.variable} ${doto.variable} ${spaceMono.variable} antialiased bg-background text-foreground`}
        >
          <ThemeProvider>
            <PaletteProvider>
              <div className='flex flex-col h-screen overflow-hidden'>
                {children}
              </div>
            </PaletteProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
