'use client';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@scilent-one/ui';
import { usePathname } from 'next/navigation';
import { Link } from 'next-view-transitions';

import { hasAdminRole, useSession } from '@/lib/auth-client';

import { ROUTES } from '../lib/routes';

export function SidebarAdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isImpersonating = Boolean(
    session?.session &&
    'impersonatedBy' in session.session &&
    session.session.impersonatedBy
  );
  const showAdmin = hasAdminRole(session?.user?.role as string | undefined);

  if (!showAdmin || isImpersonating) {
    return null;
  }

  const adminRoutes = Object.values(ROUTES).filter((route) => route.isAdmin);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarMenu>
        {adminRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;

          return (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton isActive={isActive} asChild>
                <Link href={route.href}>
                  <Icon />
                  <span>{route.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
