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
import type { HarmonizedArtist } from '../../types';

export interface ArtistContextMenuProps {
  /** The artist entity */
  entity: HarmonizedEntity;
  /** Callback when menu should close */
  onClose?: () => void;
}

/**
 * Context menu content for artist entities.
 * Provides actions like: view artist, view discography, external links
 */
export function ArtistContextMenu({ entity, onClose }: ArtistContextMenuProps) {
  const interaction = useHarmonyInteraction();
  const artist = entity as HarmonizedArtist;
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
    
    artist.sources?.forEach((source) => {
      if (source.url) {
        links.push({
          platform: source.provider,
          url: source.url,
        });
      }
    });

    return links;
  }, [artist.sources]);

  // Get custom menu items for artists
  const customItems = interaction.customMenuItems?.artist ?? [];

  const handleViewArtist = React.useCallback(() => {
    interaction.onNavigate?.('artist', artist);
    onClose?.();
  }, [interaction, artist, onClose]);

  const handleCopyLink = React.useCallback(() => {
    interaction.onCopyLink?.(artist, 'artist');
    onClose?.();
  }, [interaction, artist, onClose]);

  const handleViewCredits = React.useCallback(() => {
    interaction.onViewCredits?.(artist, 'artist');
    onClose?.();
  }, [interaction, artist, onClose]);

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
      <MenuLabel className="truncate">{artist.name}</MenuLabel>
      {artist.disambiguation && (
        <div className="px-2 pb-1.5 text-xs text-muted-foreground truncate">
          {artist.disambiguation}
        </div>
      )}
      <MenuSeparator />

      {/* Navigation actions */}
      {interaction.onNavigate && (
        <MenuItem onSelect={handleViewArtist}>
          View Artist
        </MenuItem>
      )}

      {/* View credits/metadata */}
      {interaction.onViewCredits && (
        <MenuItem onSelect={handleViewCredits}>
          View Discography
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
      {interaction.onCopyLink && (
        <>
          <MenuSeparator />
          <MenuItem onSelect={handleCopyLink}>
            Copy Link
          </MenuItem>
        </>
      )}

      {/* Custom menu items */}
      {customItems.length > 0 && (
        <>
          <MenuSeparator />
          {customItems.map((action) => (
            <MenuItem
              key={action.id}
              disabled={action.disabled}
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
