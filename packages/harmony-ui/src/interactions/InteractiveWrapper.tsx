'use client';

import * as React from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
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
}: InteractiveWrapperProps) {
  const interaction = useHarmonyInteraction();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // If interactions are completely disabled, just render children
  if (!interaction.enabled || disabled) {
    return <>{children}</>;
  }

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

  const handleMenuClose = React.useCallback(() => {
    setMenuOpen(false);
  }, []);

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

  // Build the menu content - always use 'context' since InteractiveWrapper uses ContextMenu
  const menuContent = hasContextMenu
    ? getMenuContent(entityType, entity, handleMenuClose, 'context')
    : null;

  // Wrap children in a span if className is provided, or keep as-is
  const wrappedChildren = className ? (
    <span className={className}>{children}</span>
  ) : (
    children
  );

  // Case 1: Both context menu and hover preview (web)
  // Use a single shared trigger element to avoid Radix asChild nesting issues
  if (hasContextMenu && hasHoverPreview) {
    return (
      <ContextMenu onOpenChange={setMenuOpen}>
        <HoverCard openDelay={interaction.hoverDelay} closeDelay={150}>
          <ContextMenuTrigger asChild>
            <HoverCardTrigger asChild>{wrappedChildren}</HoverCardTrigger>
          </ContextMenuTrigger>
          <HoverCardContent className="w-80" side={previewSide} align={previewAlign}>
            {previewContent}
          </HoverCardContent>
        </HoverCard>
        <ContextMenuContent className="w-56">{menuContent}</ContextMenuContent>
      </ContextMenu>
    );
  }

  // Case 2: Only context menu
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
        <HoverCardContent className="w-80" side={previewSide} align={previewAlign}>
          {previewContent}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return <>{wrappedChildren}</>;
}
