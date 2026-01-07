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
import { useHarmonyInteraction } from '../provider';
import type { HarmonizedEntity, MenuAction } from '../types';
import type { HarmonizedTrack } from '../../types';

export interface TrackContextMenuProps {
  /** The track entity */
  entity: HarmonizedEntity;
  /** Callback when menu should close */
  onClose?: () => void;
}

/**
 * Context menu content for track entities.
 * Provides actions like: view track, view album, view artist, external links, copy ISRC
 */
export function TrackContextMenu({ entity, onClose }: TrackContextMenuProps) {
  const interaction = useHarmonyInteraction();
  const track = entity as HarmonizedTrack;
  const isWeb = interaction.platform === 'web';

  // Menu components based on platform
  const MenuItem = isWeb ? ContextMenuItem : DropdownMenuItem;
  const MenuSeparator = isWeb ? ContextMenuSeparator : DropdownMenuSeparator;
  const MenuLabel = isWeb ? ContextMenuLabel : DropdownMenuLabel;
  const MenuSub = isWeb ? ContextMenuSub : DropdownMenuSub;
  const MenuSubTrigger = isWeb ? ContextMenuSubTrigger : DropdownMenuSubTrigger;
  const MenuSubContent = isWeb ? ContextMenuSubContent : DropdownMenuSubContent;

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

  const handleOpenExternal = React.useCallback((url: string, platform: string) => {
    interaction.onOpenExternal?.(url, platform);
    onClose?.();
  }, [interaction, onClose]);

  const handleCustomAction = React.useCallback((action: MenuAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      window.open(action.href, '_blank');
    }
    onClose?.();
  }, [onClose]);

  return (
    <>
      <MenuLabel className="truncate">{track.title}</MenuLabel>
      <MenuSeparator />

      {/* Navigation actions */}
      {interaction.onNavigate && (
        <MenuItem onSelect={handleViewTrack}>
          View Track Details
        </MenuItem>
      )}

      {/* View credits if available */}
      {interaction.onViewCredits && track.credits && track.credits.length > 0 && (
        <MenuItem onSelect={handleViewCredits}>
          View Credits
        </MenuItem>
      )}

      {/* External platform links */}
      {externalLinks.length > 0 && (
        <>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger>Open in...</MenuSubTrigger>
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
          Copy ISRC
        </MenuItem>
      )}
      {interaction.onCopyLink && (
        <MenuItem onSelect={handleCopyLink}>
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

/**
 * Format platform name for display
 */
function formatPlatformName(platform: string): string {
  const names: Record<string, string> = {
    spotify: 'Spotify',
    musicbrainz: 'MusicBrainz',
    tidal: 'Tidal',
    apple: 'Apple Music',
    deezer: 'Deezer',
    youtube: 'YouTube Music',
  };
  return names[platform.toLowerCase()] ?? platform;
}
