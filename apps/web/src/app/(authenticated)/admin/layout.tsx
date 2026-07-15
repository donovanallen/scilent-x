import { hasAdminRole } from '@scilent-one/auth/roles';
import { auth } from '@scilent-one/auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server-side gate for /admin/* routes.
 *
 * Better Auth's admin plugin enforces permissions on admin API endpoints.
 * This layout covers the UI surface: only users with the `admin` role (or an
 * adminUserIds bootstrap entry) can render admin pages.
 *
 * While impersonating a non-admin user, `session.user.role` is the target's
 * role — so admin UI is blocked until the admin stops impersonating (banner
 * in the authenticated shell).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login?redirect=/admin/users');
  }

  if (!hasAdminRole(session.user.role as string | undefined)) {
    redirect('/');
  }

  return children;
}
