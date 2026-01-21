'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Separator,
} from '@scilent-one/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { ROUTES } from '@/lib/routes';

import { AppSidebar } from '../../components/app-sidebar';
import { HarmonyInteractionProvider } from '../../components/harmony-interaction-provider';

// Map route paths to their labels
const pathLabels: Record<string, string> = Object.values(ROUTES).reduce(
  (acc, route) => {
    acc[route.href] = route.label;
    return acc;
  },
  {} as Record<string, string>
);

// Additional labels for paths not in ROUTES
const additionalLabels: Record<string, string> = {
  '/admin': 'Admin',
  '/post': 'Post',
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { href: string; label: string; isLast: boolean }[] = [];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;

    // Try to get label from ROUTES, additional labels, or capitalize segment
    let label = pathLabels[currentPath] || additionalLabels[currentPath];

    if (!label) {
      // Capitalize segment as fallback (handle IDs or unknown paths)
      const segment = segments[i];
      // Skip UUID-like segments for display (show "Post" instead of the ID)
      if (segment && segment.length > 20) {
        label = 'Details';
      } else if (segment) {
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
    }

    if (label) {
      breadcrumbs.push({ href: currentPath, label, isLast });
    }
  }

  return breadcrumbs;
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-14 shrink-0 items-center gap-2 px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='mr-2 data-[orientation=vertical]:h-4'
          />
          {breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <div className='flex-1' />
        </header>
        <main className='flex flex-1 flex-col overflow-auto p-4 pt-0'>
          <HarmonyInteractionProvider>{children}</HarmonyInteractionProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
