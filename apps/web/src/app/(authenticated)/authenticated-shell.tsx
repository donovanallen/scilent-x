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
import { usePathname } from 'next/navigation';
import { Link } from 'next-view-transitions';
import * as React from 'react';

import { ROUTES } from '@/lib/routes';

import { AppSidebar } from '../../components/app-sidebar';
import { HarmonyInteractionProvider } from '../../components/harmony-interaction-provider';

const pathLabels: Record<string, string> = Object.values(ROUTES).reduce(
  (acc, route) => {
    acc[route.href] = route.label;
    return acc;
  },
  {} as Record<string, string>
);

const additionalLabels: Record<string, string> = {
  '/admin': 'Admin',
  '/post': 'Post',
  '/review': 'Review',
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { href: string; label: string; isLast: boolean }[] = [];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;

    let label = pathLabels[currentPath] || additionalLabels[currentPath];

    if (!label) {
      const segment = segments[i];
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

export function AuthenticatedShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <SidebarProvider>
      <AppSidebar isAdmin={isAdmin} />
      <SidebarInset>
        <header className='flex h-12 sm:h-14 shrink-0 items-center gap-2 px-3 sm:px-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <SidebarTrigger className='-ml-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0' />
          <Separator
            orientation='vertical'
            className='mr-2 data-[orientation=vertical]:h-4 hidden sm:block'
          />
          {breadcrumbs.length > 0 ? (
            <Breadcrumb className='hidden sm:flex'>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 ? <BreadcrumbSeparator /> : null}
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
          ) : null}
          {breadcrumbs.length > 0 ? (
            <span className='text-sm font-medium truncate text-brand-dark dark:text-brand sm:hidden'>
              {breadcrumbs[breadcrumbs.length - 1]?.label}
            </span>
          ) : null}
          <div className='flex-1' />
        </header>
        <main
          className='flex flex-1 flex-col overflow-auto p-3 sm:p-4 pt-0'
          style={{ viewTransitionName: 'page-content' }}
        >
          <HarmonyInteractionProvider>{children}</HarmonyInteractionProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
