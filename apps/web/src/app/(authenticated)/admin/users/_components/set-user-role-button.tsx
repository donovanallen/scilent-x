'use client';

import { Button } from '@scilent-one/ui';
import { Shield, ShieldOff } from 'lucide-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';

import { authClient, hasAdminRole, useSession } from '@/lib/auth-client';

type SetUserRoleButtonProps = {
  userId: string;
  userName: string | null;
  userRole?: string | null;
  /** True when this row is the only admin — demote is blocked. */
  isLastAdmin?: boolean;
  disabled?: boolean;
};

export function SetUserRoleButton({
  userId,
  userName,
  userRole,
  isLastAdmin = false,
  disabled = false,
}: SetUserRoleButtonProps) {
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
  const actorIsAdmin = hasAdminRole(session?.user?.role as string | undefined);

  if (!actorIsAdmin || isImpersonating || disabled) {
    return null;
  }

  // Promoting: always allowed for other users (and self is already admin).
  // Demoting: block self and the last remaining admin.
  const nextRole = targetIsAdmin ? 'user' : 'admin';
  const isDemote = nextRole === 'user';

  if (isDemote && isSelf) {
    return null;
  }

  const demoteBlocked = isDemote && isLastAdmin;

  const handleSetRole = async () => {
    if (demoteBlocked) return;

    setIsPending(true);
    setError(null);

    const { error: setRoleError } = await authClient.admin.setRole({
      userId,
      role: nextRole,
    });

    if (setRoleError) {
      setError(setRoleError.message ?? 'Failed to update role');
      setIsPending(false);
      return;
    }

    router.refresh();
    setIsPending(false);
  };

  const label = targetIsAdmin ? 'Revoke admin' : 'Make admin';
  const pendingLabel = targetIsAdmin ? 'Revoking…' : 'Promoting…';
  const Icon = targetIsAdmin ? ShieldOff : Shield;

  return (
    <div className='flex flex-col items-end gap-1'>
      <Button
        type='button'
        size='sm'
        variant='outline'
        disabled={isPending || demoteBlocked}
        onClick={handleSetRole}
        title={
          demoteBlocked
            ? 'Cannot revoke the last admin'
            : `${label} for ${userName ?? 'user'}`
        }
        aria-label={`${label} ${userName ?? 'user'}`}
      >
        <Icon className='size-3.5' />
        {isPending ? pendingLabel : label}
      </Button>
      {demoteBlocked ? (
        <span className='text-xs text-muted-foreground max-w-40 text-right'>
          Last admin
        </span>
      ) : null}
      {error ? (
        <span className='text-xs text-destructive max-w-40 text-right'>
          {error}
        </span>
      ) : null}
    </div>
  );
}
