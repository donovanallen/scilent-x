'use client';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@scilent-one/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROUTES } from '../lib/routes';

export function SidebarNav() {
  const pathname = usePathname();

  // Get protected routes (excluding admin routes for non-admins - can be enhanced later)
  const protectedRoutes = Object.values(ROUTES).filter(
    (route) => route.protected && !route.isAdmin
  );

  const isRouteActive = (route: (typeof protectedRoutes)[number]) => {
    return pathname === route.href;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarMenu>
        {protectedRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = isRouteActive(route);

          return (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton
                tooltip={route.label}
                isActive={isActive}
                asChild
              >
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
