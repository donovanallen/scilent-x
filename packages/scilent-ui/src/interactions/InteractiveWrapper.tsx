'use client';

import * as React from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  cn,
} from '@scilent-one/ui';
import { useHarmonyInteraction } from './provider';
import type {
  InteractiveWrapperProps,
  EntityType,
  HarmonizedEntity,
} from './types';
import { TrackContextMenu, AlbumContextMenu, ArtistContextMenu } from './menus';
import {
  TrackHoverPreview,
  AlbumHoverPreview,
  ArtistHoverPreview,
} from './previews';

/** Duration in ms for a touch to be considered a long-press */
const LONG_PRESS_DURATION = 500;
/** Movement threshold in px - if the touch moves beyond this, cancel the long-press */
const MOVE_THRESHOLD = 10;

/**
 * Get the appropriate menu content component for the entity type
 */
function getMenuContent(
  entityType: EntityType,
  entity: HarmonizedEntity,
  onClose: () => void,
  menuType: 'context' | 'dropdown' = 'context'
) {
  switch (entityType) {
    case 'track':
      return (
        <TrackContextMenu
          entity={entity}
          onClose={onClose}
          menuType={menuType}
        />
      );
    case 'album':
      return (
        <AlbumContextMenu
          entity={entity}
          onClose={onClose}
          menuType={menuType}
        />
      );
    case 'artist':
      return (
        <ArtistContextMenu
          entity={entity}
          onClose={onClose}
          menuType={menuType}
        />
      );
    default:
      return null;
  }
}

/**
 * Get the appropriate preview content component for the entity type
 */
function getPreviewContent(
  entityType: EntityType,
  entity: HarmonizedEntity,
  mode: 'mini' | 'full' | 'links'
) {
  switch (entityType) {
    case 'track':
      return <TrackHoverPreview entity={entity} mode={mode} />;
    case 'album':
      return <AlbumHoverPreview entity={entity} mode={mode} />;
    case 'artist':
      return <ArtistHoverPreview entity={entity} mode={mode} />;
    default:
      return null;
  }
}

/**
 * Wrapper component that adds interactive behaviors to any child element.
 *
 * Based on provider configuration, this wraps children with:
 * - Context menus (right-click on web, long-press on mobile)
 * - Hover previews (web only)
 *
 * The active platform is resolved by `HarmonyInteractionProvider` (respecting the
 * `platform: 'web' | 'mobile' | 'auto'` config). On mobile, the menu opens via a
 * long-press (500ms, cancelled if the finger moves past a small threshold to allow
 * scrolling) and renders as a `DropdownMenu`; on web it uses a right-click
 * `ContextMenu` plus an optional `HoverCard` preview.
 *
 * When used outside of a HarmonyInteractionProvider, simply renders children unchanged.
 *
 * @example
 * ```tsx
 * <InteractiveWrapper entityType="track" entity={track}>
 *   <TrackCard track={track} />
 * </InteractiveWrapper>
 * ```
 */
export function InteractiveWrapper({
  entityType,
  entity,
  children,
  className,
  disabled = false,
  previewSide = 'right',
  previewAlign = 'start',
  preventTextSelection = true,
}: InteractiveWrapperProps) {
  const interaction = useHarmonyInteraction();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Long-press state for mobile menus
  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null);

  // Cleanup any pending long-press timer on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const handleMenuClose = React.useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    longPressTimerRef.current = setTimeout(() => {
      setMenuOpen(true);
      longPressTimerRef.current = null;
    }, LONG_PRESS_DURATION);
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!longPressTimerRef.current || !touchStartPosRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);

    // Cancel long-press if the touch moved too far (user is scrolling)
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

  // If interactions are completely disabled, just render children
  if (!interaction.enabled || disabled) {
    return <>{children}</>;
  }

  const isMobile = interaction.platform === 'mobile';
  const hasContextMenu = interaction.enableContextMenu;
  const hasHoverPreview =
    interaction.enableHoverPreview && interaction.platform === 'web';

  // If neither feature is enabled, just render children
  if (!hasContextMenu && !hasHoverPreview) {
    return <>{children}</>;
  }

  // Get preview mode for this entity type
  const previewMode = interaction.previewContent?.[entityType] ?? 'mini';
  const isCustomPreview = typeof previewMode === 'function';

  // Build the preview content
  const previewContent = hasHoverPreview
    ? isCustomPreview
      ? React.createElement(previewMode, { entityType, entity })
      : getPreviewContent(
          entityType,
          entity,
          previewMode as 'mini' | 'full' | 'links'
        )
    : null;

  // Menu content type mirrors the presentation: DropdownMenu on mobile,
  // ContextMenu on web.
  const menuType: 'context' | 'dropdown' = isMobile ? 'dropdown' : 'context';
  const menuContent = hasContextMenu
    ? getMenuContent(entityType, entity, handleMenuClose, menuType)
    : null;

  // Wrap children in a span if className or preventTextSelection is needed
  const needsWrapper = className || preventTextSelection;
  const wrappedChildren = needsWrapper ? (
    <span className={cn(preventTextSelection && 'select-none', className)}>
      {children}
    </span>
  ) : (
    children
  );

  // Mobile: long-press opens a DropdownMenu. Hover previews are web-only, so
  // the menu is the only interactive affordance here.
  if (isMobile && hasContextMenu) {
    return (
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <span
            className={cn(preventTextSelection && 'select-none', className)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onContextMenu={(e) => {
              // Support right-click on hybrid devices (tablets with a mouse/stylus)
              e.preventDefault();
              setMenuOpen(true);
            }}
          >
            {children}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {menuContent}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Case 1: Both context menu and hover preview (web)
  // Use a single shared trigger element to avoid Radix asChild nesting issues
  if (hasContextMenu && hasHoverPreview) {
    return (
      <ContextMenu onOpenChange={setMenuOpen}>
        <HoverCard openDelay={interaction.hoverDelay} closeDelay={150}>
          <ContextMenuTrigger asChild>
            <HoverCardTrigger asChild>{wrappedChildren}</HoverCardTrigger>
          </ContextMenuTrigger>
          <HoverCardContent
            className="w-80"
            side={previewSide}
            align={previewAlign}
          >
            {previewContent}
          </HoverCardContent>
        </HoverCard>
        <ContextMenuContent className="w-56">{menuContent}</ContextMenuContent>
      </ContextMenu>
    );
  }

  // Case 2: Only context menu (web right-click)
  if (hasContextMenu) {
    return (
      <ContextMenu onOpenChange={setMenuOpen}>
        <ContextMenuTrigger asChild>{wrappedChildren}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">{menuContent}</ContextMenuContent>
      </ContextMenu>
    );
  }

  // Case 3: Only hover preview (web)
  if (hasHoverPreview) {
    return (
      <HoverCard openDelay={interaction.hoverDelay} closeDelay={150}>
        <HoverCardTrigger asChild>{wrappedChildren}</HoverCardTrigger>
        <HoverCardContent
          className="w-80"
          side={previewSide}
          align={previewAlign}
        >
          {previewContent}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return <>{wrappedChildren}</>;
}
