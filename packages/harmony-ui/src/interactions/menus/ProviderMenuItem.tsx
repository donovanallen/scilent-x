'use client';

import * as React from 'react';
import {
  ContextMenuItem,
  DropdownMenuItem,
} from '@scilent-one/ui';
import { Loader2 } from 'lucide-react';
import type { HarmonizedEntity, ProviderAction } from '../types';

export interface ProviderMenuItemProps<T extends HarmonizedEntity = HarmonizedEntity> {
  /** The provider action to render */
  action: ProviderAction<T>;
  /** The entity to pass to the action handler */
  entity: T;
  /** Callback when action completes or menu should close */
  onClose?: (() => void) | undefined;
  /** Whether this is inside a context menu or dropdown menu */
  menuType?: 'context' | 'dropdown';
}

/**
 * Individual provider action menu item with loading state support.
 * Handles async operations and displays loading indicator.
 */
export function ProviderMenuItem<T extends HarmonizedEntity = HarmonizedEntity>({
  action,
  entity,
  onClose,
  menuType = 'context',
}: ProviderMenuItemProps<T>) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isContextMenu = menuType === 'context';

  const MenuItem = isContextMenu ? ContextMenuItem : DropdownMenuItem;

  const handleSelect = React.useCallback(async () => {
    if (action.disabled || isLoading) return;

    setIsLoading(true);
    try {
      await action.onAction(entity);
    } catch (error) {
      // Error handling is delegated to the action itself
      console.error(`Provider action failed: ${action.id}`, error);
    } finally {
      setIsLoading(false);
      onClose?.();
    }
  }, [action, entity, isLoading, onClose]);

  const Icon = action.icon;
  const showLoading = isLoading || action.loading;
  const isDisabled = action.disabled === true || showLoading === true;

  return (
    <MenuItem
      disabled={isDisabled}
      onSelect={(e) => {
        // Prevent default close behavior - we'll close after async action completes
        e.preventDefault();
        handleSelect();
      }}
      className="gap-2"
    >
      {showLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        Icon && <Icon className="size-4" />
      )}
      {action.label}
    </MenuItem>
  );
}
