'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@scilent-one/ui';
import * as React from 'react';

import { SidebarAdminNav } from './sidebar-admin';
import { SidebarFooterContent } from './sidebar-footer';
import { SidebarLogo } from './sidebar-logo';
import { SidebarNav } from './sidebar-nav';

export function AppSidebar({
  isAdmin = false,
  ...props
}: React.ComponentProps<typeof Sidebar> & { isAdmin?: boolean }) {
  return (
    <Sidebar variant='inset' collapsible='icon' expandOnHover {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarNav />
        {isAdmin ? <SidebarAdminNav /> : null}
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
      <SidebarRail className='cursor-ew-resize' />
    </Sidebar>
  );
}
