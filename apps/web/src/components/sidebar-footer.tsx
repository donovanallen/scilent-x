'use client';

import {
  Button,
  Separator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  UserAvatar,
} from '@scilent-one/ui';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { signOut, useSession } from '@/lib/auth-client';
import { ROUTES } from '@/lib/routes';

import { ThemeToggle } from './theme-toggle';

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

  const user = session?.user;

  return (
    <SidebarMenu>
      <Separator />
      {user && (
        <SidebarMenuItem className='flex items-center gap-1'>
          <SidebarMenuButton
            asChild
            className='flex-1 group-data-[state=expanded]:h-auto group-data-[state=expanded]:py-3 md:group-data-[state=expanded]:py-2'
          >
            <Link
              href={ROUTES.profile.href}
              className='flex items-center gap-2 min-h-[44px] md:min-h-0'
            >
              <UserAvatar
                name={user.name}
                image={user.image}
                size='sm'
                className='shrink-0 group-data-[state=collapsed]:size-4'
              />
              <div className='flex flex-col items-start overflow-hidden group-data-[state=collapsed]:hidden'>
                <span className='truncate text-sm font-medium'>
                  {user.name}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  {user.email}
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
          <div className='flex shrink-0 items-center gap-1 group-data-[state=collapsed]:hidden'>
            <ThemeToggle />
            <Button
              asChild
              size='icon'
              variant='ghost'
              aria-label='Settings'
              className='text-muted-foreground'
            >
              <Link href={ROUTES.settings.href}>
                <Settings />
              </Link>
            </Button>
          </div>
        </SidebarMenuItem>
      )}
      {user && (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogout}
            className='cursor-pointer text-muted-foreground hover:text-destructive active:text-destructive min-h-[44px] md:min-h-0'
          >
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
