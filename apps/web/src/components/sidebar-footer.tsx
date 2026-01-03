'use client';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@scilent-one/ui';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { signOut, useSession } from '@/lib/auth-client';
import { ROUTES } from '@/lib/routes';

export function SidebarFooterContent() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(ROUTES.login.href);
        },
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {session?.user && (
          <SidebarMenuButton
            tooltip='Logout'
            onClick={handleLogout}
            className='text-muted-foreground hover:text-destructive'
          >
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
