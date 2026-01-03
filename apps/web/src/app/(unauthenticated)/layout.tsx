import { AppNavMenu } from '../../components/app-nav-menu';

export default function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNavMenu />
      <main className='relative container mx-auto min-h-screen h-full w-full overflow-y-auto p-6 pt-14'>
        {children}
      </main>
    </>
  );
}
