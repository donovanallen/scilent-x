'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  // SidebarSeparator,
} from '@scilent-one/ui';
import * as React from 'react';

import { SidebarAdminNav } from './sidebar-admin';
import { SidebarFooterContent } from './sidebar-footer';
import { SidebarLogo } from './sidebar-logo';
import { SidebarNav } from './sidebar-nav';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarNav />
        {/* <SidebarSeparator /> */}
        <SidebarAdminNav />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
      <SidebarRail className='cursor-ew-resize' />
    </Sidebar>
  );
}
