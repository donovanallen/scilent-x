'use client';

// import { useSession } from '@scilent-one/auth/client';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Separator,
} from '@scilent-one/ui';
import * as React from 'react';

import { AppSidebar } from '../../components/app-sidebar';
import { HarmonyInteractionProvider } from '../../components/harmony-interaction-provider';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { data: session } = useSession();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-14 shrink-0 items-center gap-2 px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='mr-2 data-[orientation=vertical]:h-4'
          />
          <div className='flex-1' />
        </header>
        <main className='flex flex-1 flex-col overflow-auto p-4 pt-0'>
          <HarmonyInteractionProvider>{children}</HarmonyInteractionProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
