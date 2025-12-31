import Link from 'next/link';

import { ThemeToggle } from '../../components/theme-toggle';
import { ROUTES } from '../../lib/routes';

export default function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Fixed navbar that overlays content */}
      <header className='flex items-center justify-between h-14 px-12 mx-auto fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60'>
        <Link
          href='/'
          className='text-2xl font-display font-black tracking-wide hover:font-semibold transition-all duration-200'
        >
          Scilent Music
        </Link>

        <div className='flex items-center gap-1'>
          {Object.values(ROUTES)
            .filter((route) => route.href !== '/')
            .filter((route) => !route.protected)
            .map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className='inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent/50 hover:text-accent-foreground'
              >
                {route.label}
              </Link>
            ))}
          <ThemeToggle />
        </div>
      </header>
      <main className='relative container mx-auto min-h-screen h-full w-full overflow-y-auto p-6 pt-14'>
        {children}
      </main>
    </>
  );
}
