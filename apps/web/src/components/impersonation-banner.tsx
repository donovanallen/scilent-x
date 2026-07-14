'use client';

import { Button } from '@scilent-one/ui';
import { UserRoundX } from 'lucide-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';

import { authClient, useSession } from '@/lib/auth-client';

/**
 * Persistent banner shown while an admin is impersonating another user.
 * Calls Better Auth `stopImpersonating` to restore the admin session.
 */
export function ImpersonationBanner() {
  const router = useTransitionRouter();
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);

  const impersonatedBy =
    session?.session &&
    'impersonatedBy' in session.session &&
    typeof session.session.impersonatedBy === 'string'
      ? session.session.impersonatedBy
      : null;

  if (!impersonatedBy || !session?.user) {
    return null;
  }

  const handleStop = async () => {
    setIsPending(true);
    const { error } = await authClient.admin.stopImpersonating();
    if (error) {
      setIsPending(false);
      return;
    }
    await authClient.getSession();
    router.push('/admin/users');
    router.refresh();
  };

  return (
    <div
      role='status'
      className='flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100 sm:px-4'
    >
      <p>
        Impersonating{' '}
        <span className='font-medium'>
          {session.user.name ?? session.user.email}
        </span>
        . You are browsing as this user.
      </p>
      <Button
        type='button'
        size='sm'
        variant='outline'
        disabled={isPending}
        onClick={handleStop}
        className='border-amber-600/40 bg-background/60'
      >
        <UserRoundX className='size-3.5' />
        {isPending ? 'Restoring…' : 'Stop impersonating'}
      </Button>
    </div>
  );
}
