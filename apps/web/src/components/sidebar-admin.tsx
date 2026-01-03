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

export function SidebarAdminNav() {
  const pathname = usePathname();
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
