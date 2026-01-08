'use client';

import { useSession } from '@scilent-one/auth/client';
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
  const { data: session } = useSession();
  console.log(session);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-14 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <div className='flex-1' />
        </header>
        <main className='flex flex-1 flex-col overflow-auto p-6'>
          <HarmonyInteractionProvider>{children}</HarmonyInteractionProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
