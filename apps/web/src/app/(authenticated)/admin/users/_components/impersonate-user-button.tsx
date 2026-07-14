'use client';

import { Button } from '@scilent-one/ui';
import { UserRoundSearch } from 'lucide-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';

import { authClient, hasAdminRole, useSession } from '@/lib/auth-client';

type ImpersonateUserButtonProps = {
  userId: string;
  userName: string | null;
  userRole?: string | null;
  disabled?: boolean;
};

export function ImpersonateUserButton({
  userId,
  userName,
  userRole,
  disabled = false,
}: ImpersonateUserButtonProps) {
  const router = useTransitionRouter();
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = session?.user?.id;
  const isSelf = currentUserId === userId;
  const isImpersonating = Boolean(
    session?.session &&
    'impersonatedBy' in session.session &&
    session.session.impersonatedBy
  );
  const targetIsAdmin = hasAdminRole(userRole);
  const canImpersonate =
    !disabled &&
    !isSelf &&
    !isImpersonating &&
    !targetIsAdmin &&
    hasAdminRole(session?.user?.role as string | undefined);

  if (!canImpersonate) {
    return null;
  }

  const handleImpersonate = async () => {
    setIsPending(true);
    setError(null);

    const { error: impersonateError } = await authClient.admin.impersonateUser({
      userId,
    });

    if (impersonateError) {
      setError(impersonateError.message ?? 'Failed to impersonate user');
      setIsPending(false);
      return;
    }

    // Admin client may not revalidate useSession automatically — force refresh.
    await authClient.getSession();
    router.push('/profile');
    router.refresh();
  };

  return (
    <div className='flex flex-col items-end gap-1'>
      <Button
        type='button'
        size='sm'
        variant='outline'
        disabled={isPending}
        onClick={handleImpersonate}
        aria-label={`Impersonate ${userName ?? 'user'}`}
      >
        <UserRoundSearch className='size-3.5' />
        {isPending ? 'Switching…' : 'Impersonate'}
      </Button>
      {error ? (
        <span className='text-xs text-destructive max-w-40 text-right'>
          {error}
        </span>
      ) : null}
    </div>
  );
}
