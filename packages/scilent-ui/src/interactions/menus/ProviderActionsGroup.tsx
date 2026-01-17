'use client';

import * as React from 'react';
import {
  ContextMenuSeparator,
  ContextMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@scilent-one/ui';
import type { EntityType, HarmonizedEntity, ProviderAction } from '../types';
import { ProviderMenuItem } from './ProviderMenuItem';

export interface ProviderActionsGroupProps<T extends HarmonizedEntity = HarmonizedEntity> {
  /** The entity type (track, album, artist) */
  entityType: EntityType;
  /** The entity to pass to action handlers */
  entity: T;
  /** List of provider actions to render */
  actions: ProviderAction<T>[];
  /** Callback when an action completes or menu should close */
  onClose?: (() => void) | undefined;
  /** Whether this is inside a context menu or dropdown menu */
  menuType?: 'context' | 'dropdown';
  /** Whether to show a section label */
  showLabel?: boolean;
  /** Custom label for the section */
  label?: string;
}

/**
 * Renders a group of provider-specific actions in a context/dropdown menu.
 * Groups actions logically and provides consistent styling.
 */
export function ProviderActionsGroup<T extends HarmonizedEntity = HarmonizedEntity>({
  entity,
  actions,
  onClose,
  menuType = 'context',
  showLabel = false,
  label = 'Quick Actions',
}: ProviderActionsGroupProps<T>) {
  const isContextMenu = menuType === 'context';

  // If no actions, render nothing
  if (!actions || actions.length === 0) {
    return null;
  }

  const MenuSeparator = isContextMenu
    ? ContextMenuSeparator
    : DropdownMenuSeparator;
  const MenuLabel = isContextMenu ? ContextMenuLabel : DropdownMenuLabel;

  return (
    <>
      <MenuSeparator />
      {showLabel && (
        <MenuLabel className="text-xs text-muted-foreground">{label}</MenuLabel>
      )}
      {actions.map((action) => (
        <ProviderMenuItem<T>
          key={action.id}
          action={action}
          entity={entity}
          onClose={onClose}
          menuType={menuType}
        />
      ))}
    </>
  );
}
