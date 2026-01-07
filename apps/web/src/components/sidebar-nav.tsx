'use client';

import { useEffect, useState } from 'react';
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

interface CurrentUser {
  id: string;
  username: string | null;
}

export function SidebarNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/v1/users/me');
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    }
    fetchUser();
  }, []);

  // Get protected routes (excluding admin routes for non-admins - can be enhanced later)
  const protectedRoutes = Object.values(ROUTES).filter(
    (route) => route.protected && !route.isAdmin
  );

  const getRouteHref = (route: (typeof protectedRoutes)[number]) => {
    // For profile, use the user's username if available
    if (route.href === '/profile' && currentUser?.username) {
      return `/profile/${currentUser.username}`;
    }
    return route.href;
  };

  const isRouteActive = (route: (typeof protectedRoutes)[number]) => {
    if (route.href === '/profile') {
      return pathname.startsWith('/profile/');
    }
    return pathname === route.href;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarMenu>
        {protectedRoutes.map((route) => {
          const Icon = route.icon;
          const href = getRouteHref(route);
          const isActive = isRouteActive(route);

          return (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton
                tooltip={route.label}
                isActive={isActive}
                asChild
              >
                <Link href={href}>
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
