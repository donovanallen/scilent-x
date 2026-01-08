'use client';

import * as React from 'react';
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@scilent-one/ui';
import { Music, ExternalLink, Copy, Link, ScrollText, Type } from 'lucide-react';
import { useHarmonyInteraction } from '../provider';
import type { HarmonizedEntity, MenuAction, ProviderAction } from '../types';
import type { HarmonizedTrack } from '../../types';
import { formatPlatformName, formatArtistNames } from '../../utils';
import { ProviderActionsGroup } from './ProviderActionsGroup';

export interface TrackContextMenuProps {
  /** The track entity */
  entity: HarmonizedEntity;
  /** Callback when menu should close */
  onClose?: () => void;
  /**
   * Which menu type this content is rendered inside.
   * Determines whether to use ContextMenu* or DropdownMenu* components.
   * @default 'context'
   */
  menuType?: 'context' | 'dropdown';
}

/**
 * Context menu content for track entities.
 *
 * Organized into sections:
 * - Section 1: Core Actions (view track, view credits)
 * - Section 2: Copy Submenu (link, ISRC, title, artists)
 * - Section 3: Open In Submenu (external platform links)
 * - Section 4: Provider Actions (like, save, add to playlist - dynamic based on connected providers)
 * - Section 5: Custom Menu Items (app-specific)
 */
export function TrackContextMenu({
  entity,
  onClose,
  menuType = 'context',
}: TrackContextMenuProps) {
  const interaction = useHarmonyInteraction();
  const track = entity as HarmonizedTrack;
  const isContextMenu = menuType === 'context';

  // Menu components based on menu type (not platform)
  const MenuItem = isContextMenu ? ContextMenuItem : DropdownMenuItem;
  const MenuSeparator = isContextMenu
    ? ContextMenuSeparator
    : DropdownMenuSeparator;
  const MenuLabel = isContextMenu ? ContextMenuLabel : DropdownMenuLabel;
  const MenuSub = isContextMenu ? ContextMenuSub : DropdownMenuSub;
  const MenuSubTrigger = isContextMenu
    ? ContextMenuSubTrigger
    : DropdownMenuSubTrigger;
  const MenuSubContent = isContextMenu
    ? ContextMenuSubContent
    : DropdownMenuSubContent;

  // Build external links from sources
  const externalLinks = React.useMemo(() => {
    const links: { platform: string; url: string }[] = [];

    track.sources?.forEach((source) => {
      if (source.url) {
        links.push({
          platform: source.provider,
          url: source.url,
        });
      }
    });

    return links;
  }, [track.sources]);

  // Get provider actions for tracks
  const providerActions = (interaction.providerActions?.track ?? []) as ProviderAction<HarmonizedTrack>[];

  // Get custom menu items for tracks
  const customItems = interaction.customMenuItems?.track ?? [];

  // Determine if we have copy actions
  const hasCopyActions = track.isrc || interaction.onCopyLink || track.title || track.artists?.length;

  const handleViewTrack = React.useCallback(() => {
    interaction.onNavigate?.('track', track);
    onClose?.();
  }, [interaction, track, onClose]);

  const handleCopyISRC = React.useCallback(() => {
    if (track.isrc) {
      navigator.clipboard.writeText(track.isrc);
    }
    onClose?.();
  }, [track.isrc, onClose]);

  const handleCopyLink = React.useCallback(() => {
    interaction.onCopyLink?.(track, 'track');
    onClose?.();
  }, [interaction, track, onClose]);

  const handleCopyTitle = React.useCallback(() => {
    if (track.title) {
      navigator.clipboard.writeText(track.title);
    }
    onClose?.();
  }, [track.title, onClose]);

  const handleCopyArtists = React.useCallback(() => {
    if (track.artists?.length) {
      const artistNames = formatArtistNames(track.artists);
      navigator.clipboard.writeText(artistNames);
    }
    onClose?.();
  }, [track.artists, onClose]);

  const handleViewCredits = React.useCallback(() => {
    interaction.onViewCredits?.(track, 'track');
    onClose?.();
  }, [interaction, track, onClose]);

  const handleOpenExternal = React.useCallback(
    (url: string, platform: string) => {
      interaction.onOpenExternal?.(url, platform);
      onClose?.();
    },
    [interaction, onClose]
  );

  const handleCustomAction = React.useCallback(
    (action: MenuAction) => {
      if (action.onClick) {
        action.onClick();
      } else if (action.href) {
        window.open(action.href, '_blank');
      }
      onClose?.();
    },
    [onClose]
  );

  return (
    <>
      <MenuLabel className="truncate">{track.title}</MenuLabel>
      <MenuSeparator />

      {/* Section 1: Core Actions */}
      {interaction.onNavigate && (
        <MenuItem className="gap-2" onSelect={handleViewTrack}>
          <Music className="size-4" />
          View Track Details
        </MenuItem>
      )}

      {interaction.onViewCredits &&
        track.credits &&
        track.credits.length > 0 && (
          <MenuItem className="gap-2" onSelect={handleViewCredits}>
            <ScrollText className="size-4" />
            View Credits
          </MenuItem>
        )}

      {/* Section 2: Copy Submenu */}
      {hasCopyActions && (
        <>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger className="gap-2">
              <Copy className="size-4" />
              Copy
            </MenuSubTrigger>
            <MenuSubContent>
              {interaction.onCopyLink && (
                <MenuItem onSelect={handleCopyLink}>
                  <Link className="mr-2 size-4" />
                  Copy Link
                </MenuItem>
              )}
              {track.isrc && (
                <MenuItem onSelect={handleCopyISRC}>
                  <Copy className="mr-2 size-4" />
                  Copy ISRC
                </MenuItem>
              )}
              {track.title && (
                <MenuItem onSelect={handleCopyTitle}>
                  <Type className="mr-2 size-4" />
                  Copy Title
                </MenuItem>
              )}
              {track.artists && track.artists.length > 0 && (
                <MenuItem onSelect={handleCopyArtists}>
                  <Copy className="mr-2 size-4" />
                  Copy Artist{track.artists.length > 1 ? 's' : ''}
                </MenuItem>
              )}
            </MenuSubContent>
          </MenuSub>
        </>
      )}

      {/* Section 3: Open In Submenu (external platform links) */}
      {externalLinks.length > 0 && (
        <>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger className="gap-2">
              <ExternalLink className="size-4" />
              Open in...
            </MenuSubTrigger>
            <MenuSubContent>
              {externalLinks.map(({ platform, url }) => (
                <MenuItem
                  key={platform}
                  onSelect={() => handleOpenExternal(url, platform)}
                >
                  {formatPlatformName(platform)}
                </MenuItem>
              ))}
            </MenuSubContent>
          </MenuSub>
        </>
      )}

      {/* Section 4: Provider Actions */}
      {providerActions.length > 0 && (
        <ProviderActionsGroup<HarmonizedTrack>
          entityType="track"
          entity={track}
          actions={providerActions}
          onClose={onClose}
          menuType={menuType}
        />
      )}

      {/* Section 5: Custom menu items */}
      {customItems.length > 0 && (
        <>
          <MenuSeparator />
          {customItems.map((action) => (
            <MenuItem
              key={action.id}
              disabled={action.disabled ?? false}
              variant={action.destructive ? 'destructive' : 'default'}
              onSelect={() => handleCustomAction(action)}
              className="gap-2"
            >
              {action.icon && <action.icon className="size-4" />}
              {action.label}
            </MenuItem>
          ))}
        </>
      )}
    </>
  );
}
