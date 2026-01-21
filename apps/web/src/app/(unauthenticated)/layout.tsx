import { AppNavMenu } from '../../components/app-nav-menu';

export default function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNavMenu />
      {/* Account for fixed header height on mobile (h-14) and desktop (h-18) */}
      <main className='container mx-auto min-h-screen h-full w-full overflow-y-auto pt-14 sm:pt-16 md:pt-18 px-3 sm:px-4 md:px-6'>
        {children}
      </main>
    </>
  );
}
