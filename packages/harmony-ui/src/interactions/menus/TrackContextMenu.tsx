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
import { Music, ExternalLink, Copy, Link, ScrollText } from 'lucide-react';
import { useHarmonyInteraction } from '../provider';
import type { HarmonizedEntity, MenuAction } from '../types';
import type { HarmonizedTrack } from '../../types';
import { formatPlatformName } from '../../utils';

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
 * Provides actions like: view track, view album, view artist, external links, copy ISRC
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

  // Get custom menu items for tracks
  const customItems = interaction.customMenuItems?.track ?? [];

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

      {/* Navigation actions */}
      {interaction.onNavigate && (
        <MenuItem onSelect={handleViewTrack}>
          <Music className="mr-2 h-4 w-4" />
          View Track Details
        </MenuItem>
      )}

      {/* View credits if available */}
      {interaction.onViewCredits &&
        track.credits &&
        track.credits.length > 0 && (
          <MenuItem onSelect={handleViewCredits}>
            <ScrollText className="mr-2 h-4 w-4" />
            View Credits
          </MenuItem>
        )}

      {/* External platform links */}
      {externalLinks.length > 0 && (
        <>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger>
              <ExternalLink className="mr-2 h-4 w-4" />
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

      {/* Copy actions */}
      <MenuSeparator />
      {track.isrc && (
        <MenuItem onSelect={handleCopyISRC}>
          <Copy className="mr-2 h-4 w-4" />
          Copy ISRC
        </MenuItem>
      )}
      {interaction.onCopyLink && (
        <MenuItem onSelect={handleCopyLink}>
          <Link className="mr-2 h-4 w-4" />
          Copy Link
        </MenuItem>
      )}

      {/* Custom menu items */}
      {customItems.length > 0 && (
        <>
          <MenuSeparator />
          {customItems.map((action) => (
            <MenuItem
              key={action.id}
              disabled={action.disabled ?? false}
              variant={action.destructive ? 'destructive' : 'default'}
              onSelect={() => handleCustomAction(action)}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </MenuItem>
          ))}
        </>
      )}
    </>
  );
}
