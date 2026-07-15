import { hasAdminRole } from '@scilent-one/auth/roles';
import { PlatformBadgeList } from '@scilent-one/scilent-ui';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@scilent-one/ui';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';

import { ImpersonateUserButton } from './_components/impersonate-user-button';
import { ProfileTypeSelect } from './_components/profile-type-select';
import { SetUserRoleButton } from './_components/set-user-role-button';
import { getUsers, getUserCount } from './actions';

export const metadata: Metadata = {
  title: 'Users',
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

async function UserCountCard() {
  const count = await getUserCount();

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardDescription>Total Users</CardDescription>
        <CardTitle className='text-4xl'>{count}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-xs text-muted-foreground'>
          Registered accounts in the system
        </p>
      </CardContent>
    </Card>
  );
}

async function UsersTable() {
  const users = await getUsers();

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Users Found</CardTitle>
          <CardDescription>
            No users have been registered yet. Seed mock users with{' '}
            <code className='text-xs'>
              pnpm --filter @scilent-one/db db:seed
            </code>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const adminCount = users.filter((u) => hasAdminRole(u.role)).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          Promote or revoke admin role, or impersonate a non-admin to browse as
          them. Stop impersonating from the amber banner in the shell.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b text-left'>
                <th className='pb-3 font-medium text-muted-foreground'>Name</th>
                <th className='pb-3 font-medium text-muted-foreground'>
                  Email
                </th>
                <th className='pb-3 font-medium text-muted-foreground'>Role</th>
                <th className='pb-3 font-medium text-muted-foreground'>
                  Status
                </th>
                <th className='pb-3 font-medium text-muted-foreground'>
                  Profile Type
                </th>
                <th className='pb-3 font-medium text-muted-foreground'>
                  Connected
                </th>
                <th className='pb-3 font-medium text-muted-foreground'>
                  Created
                </th>
                <th className='pb-3 font-medium text-muted-foreground text-right'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className='border-b last:border-0'>
                  <td className='py-3'>
                    <div className='flex items-center gap-3'>
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name ?? 'User avatar'}
                          width={32}
                          height={32}
                          className='size-8 rounded-full object-cover'
                        />
                      ) : (
                        <div className='size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium'>
                          {user.name?.charAt(0)?.toUpperCase() ??
                            user.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className='font-medium'>{user.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className='py-3'>
                    <span className='font-mono text-sm'>{user.email}</span>
                  </td>
                  <td className='py-3'>
                    <Badge variant='outline' className='capitalize'>
                      {user.role ?? 'user'}
                    </Badge>
                  </td>
                  <td className='py-3'>
                    <Badge
                      variant='outline'
                      className={
                        user.emailVerified
                          ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20'
                          : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
                      }
                    >
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </td>
                  <td className='py-3'>
                    <ProfileTypeSelect
                      userId={user.id}
                      currentProfileType={user.profileType}
                    />
                  </td>
                  <td className='py-3'>
                    {user.connectedAccounts.length > 0 ? (
                      <PlatformBadgeList
                        platforms={user.connectedAccounts.map(
                          (a) => a.providerId
                        )}
                        colored
                        display='icon'
                        maxVisible={3}
                      />
                    ) : (
                      <span className='text-muted-foreground text-sm'>—</span>
                    )}
                  </td>
                  <td className='py-3 text-muted-foreground'>
                    {formatDate(user.createdAt)}
                  </td>
                  <td className='py-3 text-right'>
                    <div className='flex flex-col items-end gap-2'>
                      <SetUserRoleButton
                        userId={user.id}
                        userName={user.name}
                        userRole={user.role}
                        isLastAdmin={hasAdminRole(user.role) && adminCount <= 1}
                      />
                      <ImpersonateUserButton
                        userId={user.id}
                        userName={user.name}
                        userRole={user.role}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <div className='h-6 w-32 bg-muted animate-pulse rounded' />
        <div className='h-4 w-48 bg-muted animate-pulse rounded mt-2' />
      </CardHeader>
      <CardContent>
        <div className='h-40 bg-muted animate-pulse rounded' />
      </CardContent>
    </Card>
  );
}

function LoadingCountCard() {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='h-4 w-20 bg-muted animate-pulse rounded' />
        <div className='h-10 w-16 bg-muted animate-pulse rounded mt-1' />
      </CardHeader>
      <CardContent>
        <div className='h-4 w-40 bg-muted animate-pulse rounded' />
      </CardContent>
    </Card>
  );
}

export default function UsersPage() {
  return (
    <div className='w-full flex flex-col h-full min-h-0 space-y-6'>
      <div className='grid gap-6 md:grid-cols-3'>
        <Suspense fallback={<LoadingCountCard />}>
          <UserCountCard />
        </Suspense>
      </div>

      <Suspense fallback={<LoadingCard />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
