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

/** Duration in ms for touch to be considered a long-press */
const LONG_PRESS_DURATION = 500;
/** Movement threshold in px - if touch moves beyond this, cancel long-press */
const MOVE_THRESHOLD = 10;

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

  // Long-press state for mobile
  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    longPressTimerRef.current = setTimeout(() => {
      setIsOpen(true);
      longPressTimerRef.current = null;
    }, LONG_PRESS_DURATION);
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!longPressTimerRef.current || !touchStartPosRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);

    // Cancel long-press if touch moved too far (user is scrolling)
    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      touchStartPosRef.current = null;
    }
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartPosRef.current = null;
  }, []);

  const handleTouchCancel = React.useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartPosRef.current = null;
  }, []);

  // If interactions are disabled or context menus are off, just render children
  if (!interaction.enabled || !interaction.enableContextMenu || disabled) {
    return <>{children}</>;
  }

  // Get the menu content based on entity type
  const menuContent = React.useMemo(() => {
    switch (entityType) {
      case 'track':
        return (
          <TrackContextMenu entity={entity} onClose={() => setIsOpen(false)} />
        );
      case 'album':
        return (
          <AlbumContextMenu entity={entity} onClose={() => setIsOpen(false)} />
        );
      case 'artist':
        return (
          <ArtistContextMenu entity={entity} onClose={() => setIsOpen(false)} />
        );
      default:
        return null;
    }
  }, [entityType, entity]);

  // Web platform: use right-click context menu
  if (interaction.platform === 'web') {
    return (
      <ContextMenu onOpenChange={setIsOpen}>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">{menuContent}</ContextMenuContent>
      </ContextMenu>
    );
  }

  // Mobile platform: use dropdown menu with long-press trigger
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          onContextMenu={(e) => {
            // Still handle right-click for hybrid devices (e.g., tablets with stylus/keyboard)
            e.preventDefault();
            setIsOpen(true);
          }}
          style={{ touchAction: 'auto' }}
        >
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">{menuContent}</DropdownMenuContent>
    </DropdownMenu>
  );
}
