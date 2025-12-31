'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@scilent-one/ui';
import * as React from 'react';

import { SidebarFooterContent } from './sidebar-footer';
import { SidebarLogo } from './sidebar-logo';
import { SidebarNav } from './sidebar-nav';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
