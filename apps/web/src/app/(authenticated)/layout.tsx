import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/api-utils';
import {
  isAdminPath,
  isAdminUser,
  sanitizeInternalRedirect,
} from '@/lib/auth-guards';

import { AuthenticatedShell } from './authenticated-shell';

/**
 * Authoritative session gate for all authenticated routes.
 * Middleware only checks cookie presence; this validates the session.
 * `/admin/*` role enforcement is also handled by `admin/layout.tsx`.
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') ?? '/feed';
  const user = await getCurrentUser();

  if (!user) {
    const safe = sanitizeInternalRedirect(pathname) ?? '/feed';
    redirect(`/login?redirect=${encodeURIComponent(safe)}`);
  }

  const admin = isAdminUser(user);
  if (isAdminPath(pathname) && !admin) {
    redirect('/feed');
  }

  return <AuthenticatedShell isAdmin={admin}>{children}</AuthenticatedShell>;
}
