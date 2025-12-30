import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@scilent-one/ui';
import { doto, spaceGrotesk, sourceSans, spaceMono } from '@/lib/fonts';

import './globals.css';

export const metadata: Metadata = {
  title: 'Scilent One - Digital Project Template',
  description:
    'A modern web application template built with Next.js, React, TypeScript, Tailwind CSS, and Turborepo',
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
          {/* Fixed navbar that overlays content */}
          <header className='flex items-center justify-between h-14 px-4 mx-auto fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60'>
            <Link
              href='/'
              className='text-2xl font-display font-black tracking-wide hover:font-semibold transition-all duration-200'
            >
              Scilent One
            </Link>

            <div className='flex items-center gap-2'>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      asChild
                    >
                      <Link href='/styles'>Styles</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      asChild
                    >
                      <Link href='/components'>Components</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      asChild
                    >
                      <Link href='/db'>Database</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              <ThemeToggle />
            </div>
          </header>
          <main className='relative container mx-auto min-h-screen w-full overflow-y-auto px-6 pt-14'>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
