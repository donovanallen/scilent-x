'use client';

import * as React from 'react';
import { cn, Badge } from '@scilent-one/ui';
import { Check, X, AlertTriangle, Loader2 } from 'lucide-react';

/** Maps connection status to badge variant */
const statusVariants = {
  connected: 'success-outline',
  disconnected: 'secondary',
  expired: 'warning',
  error: 'destructive-outline',
  loading: 'secondary',
  syncing: 'info',
} as const;

const statusIcons = {
  connected: Check,
  disconnected: X,
  expired: AlertTriangle,
  error: X,
  loading: Loader2,
  syncing: Loader2,
} as const;

const statusLabels = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  expired: 'Expired',
  error: 'Error',
  loading: 'Loading',
  syncing: 'Syncing',
} as const;

type ProviderSyncStatusType = keyof typeof statusLabels;

interface ProviderSyncStatusProps extends Omit<
  React.ComponentProps<typeof Badge>,
  'children' | 'variant'
> {
  /** The connection/sync status */
  status: ProviderSyncStatusType;
  /** Whether to show the status icon */
  showIcon?: boolean;
  /** Custom label (overrides default status label) */
  label?: string;
  /** Whether to show only the icon (no text) */
  iconOnly?: boolean;
}

/**
 * ProviderSyncStatus - displays provider connection/sync status with appropriate styling
 * Built on top of the base Badge component with status-specific variants
 */
function ProviderSyncStatus({
  status,
  showIcon = true,
  label,
  iconOnly = false,
  className,
  ...props
}: ProviderSyncStatusProps) {
  const Icon = statusIcons[status];
  const displayLabel = label ?? statusLabels[status];
  const isAnimating = status === 'loading' || status === 'syncing';
  const variant = statusVariants[status];

  return (
    <Badge variant={variant} className={className} {...props}>
      {showIcon && (
        <Icon
          className={cn(isAnimating && 'animate-spin')}
          aria-hidden="true"
        />
      )}
      {!iconOnly && <span>{displayLabel}</span>}
    </Badge>
  );
}

export {
  ProviderSyncStatus,
  type ProviderSyncStatusProps,
  type ProviderSyncStatusType,
};
export default ProviderSyncStatus;
