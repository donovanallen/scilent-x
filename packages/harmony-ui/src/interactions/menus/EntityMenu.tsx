'use client';

import * as React from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@scilent-one/ui';
import { useHarmonyInteraction } from '../provider';
import type { EntityType, HarmonizedEntity } from '../types';
import { TrackContextMenu } from './TrackContextMenu';
import { AlbumContextMenu } from './AlbumContextMenu';
import { ArtistContextMenu } from './ArtistContextMenu';

export interface EntityMenuProps {
  /** Type of entity */
  entityType: EntityType;
  /** The entity data */
  entity: HarmonizedEntity;
  /** Child element to wrap as the menu trigger */
  children: React.ReactNode;
  /** Whether the menu is disabled */
  disabled?: boolean;
}

/**
 * Platform-adaptive menu wrapper that switches between ContextMenu (web)
 * and DropdownMenu (mobile) based on the provider configuration.
 * 
 * Renders the appropriate entity-specific menu content based on entityType.
 */
export function EntityMenu({
  entityType,
  entity,
  children,
  disabled = false,
}: EntityMenuProps) {
  const interaction = useHarmonyInteraction();
  const [isOpen, setIsOpen] = React.useState(false);

  // If interactions are disabled or context menus are off, just render children
  if (!interaction.enabled || !interaction.enableContextMenu || disabled) {
    return <>{children}</>;
  }

  // Get the menu content based on entity type
  const menuContent = React.useMemo(() => {
    switch (entityType) {
      case 'track':
        return <TrackContextMenu entity={entity} onClose={() => setIsOpen(false)} />;
      case 'album':
        return <AlbumContextMenu entity={entity} onClose={() => setIsOpen(false)} />;
      case 'artist':
        return <ArtistContextMenu entity={entity} onClose={() => setIsOpen(false)} />;
      default:
        return null;
    }
  }, [entityType, entity]);

  // Web platform: use right-click context menu
  if (interaction.platform === 'web') {
    return (
      <ContextMenu onOpenChange={setIsOpen}>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          {menuContent}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // Mobile platform: use dropdown menu with long-press trigger
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
        >
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {menuContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
