import { auth } from '@scilent-one/auth/server';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@scilent-one/ui';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Profile',
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;

  return (
    <div className='w-full py-10 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold'>Profile</h1>
        <p className='text-muted-foreground mt-1'>Your account information</p>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-4'>
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? 'User avatar'}
                  className='size-16 rounded-full'
                />
              ) : (
                <div className='size-16 rounded-full bg-muted flex items-center justify-center text-xl font-medium'>
                  {user.name?.charAt(0)?.toUpperCase() ??
                    user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className='font-medium text-lg'>
                  {user.name ?? 'No name set'}
                </p>
                <p className='text-sm text-muted-foreground'>{user.email}</p>
              </div>
            </div>

            <div className='pt-4 border-t space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  Email Status
                </span>
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
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>User ID</span>
                <span className='font-mono text-sm'>{user.id}</span>
              </div>
              {user.createdAt && (
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>
                    Member Since
                  </span>
                  <span className='text-sm'>
                    {formatDate(new Date(user.createdAt))}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
            <CardDescription>Current session details</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Session ID</span>
              <span className='font-mono text-sm truncate max-w-[200px]'>
                {session.session.id}
              </span>
            </div>
            {session.session.expiresAt && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Expires</span>
                <span className='text-sm'>
                  {formatDate(new Date(session.session.expiresAt))}
                </span>
              </div>
            )}
            {session.session.ipAddress && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  IP Address
                </span>
                <span className='font-mono text-sm'>
                  {session.session.ipAddress}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
