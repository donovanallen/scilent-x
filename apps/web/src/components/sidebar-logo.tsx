'use client';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@scilent-one/ui';
import { Music2 } from 'lucide-react';
import Link from 'next/link';

export function SidebarLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
          asChild
        >
          <Link href='/'>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Music2 className='size-4' />
            </div>
            <div className='flex-1 text-center text-lg leading-tight'>
              <span className='truncate font-display font-black tracking-wide'>
                scilentmusic
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
