'use client';

import { useSession } from '@scilent-one/auth/client';
import { Button } from '@scilent-one/ui';
import Link from 'next/link';

import { ROUTES } from '../lib/routes';

import { ThemeToggle } from './theme-toggle';

export function AppNavMenu() {
  const { data: session } = useSession();
  return (
    // {/* Fixed navbar that overlays content - responsive padding */}
    <header className='flex items-center justify-between h-14 sm:h-16 md:h-[72px] px-4 sm:px-6 md:px-12 mx-auto fixed top-0 left-0 right-0 z-50 border-b border-primary/40 bg-background/60 backdrop-blur-xl'>
      {/* <Link
        href='/'
        className='text-3xl font-display font-black tracking-wide hover:font-semibold transition-all duration-200'
      >
        scilent<span className='text-muted-foreground'>music</span>
      </Link> */}

      <div className='flex items-center gap-1 sm:gap-2 ml-auto'>
        {session?.user ? (
          <Button
            variant='outline'
            size='sm'
            className='h-8 px-3 sm:h-9 sm:px-4'
            asChild
          >
            <Link href={ROUTES.profile.href}>Open App</Link>
          </Button>
        ) : (
          Object.values(ROUTES)
            .filter((route) => route.href !== '/')
            .filter((route) => !route.protected)
            .map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className='inline-flex min-h-[44px] items-center justify-center rounded-md px-3 sm:px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent/50 hover:text-accent-foreground active:bg-accent/70'
              >
                {route.label}
              </Link>
            ))
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
