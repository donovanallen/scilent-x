'use client';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@scilent-one/ui';
import { LogOut } from 'lucide-react';

import { ThemeToggle } from './theme-toggle';

export function SidebarFooterContent() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    // TODO: Implement actual logout functionality
    console.log('Logout clicked');
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip='Logout'
          onClick={handleLogout}
          className='text-muted-foreground hover:text-destructive'
        >
          <LogOut />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-2'}`}
        >
          <ThemeToggle />
          {!isCollapsed && (
            <span className='ml-2 text-sm text-muted-foreground'>Theme</span>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
