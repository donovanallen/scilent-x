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
import type { HarmonizedRelease } from '../../types';

export interface AlbumContextMenuProps {
  /** The album/release entity */
  entity: HarmonizedEntity;
  /** Callback when menu should close */
  onClose?: () => void;
}

/**
 * Context menu content for album/release entities.
 * Provides actions like: view album, view artist, external links, copy UPC
 */
export function AlbumContextMenu({ entity, onClose }: AlbumContextMenuProps) {
  const interaction = useHarmonyInteraction();
  const release = entity as HarmonizedRelease;
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
    
    release.sources?.forEach((source) => {
      if (source.url) {
        links.push({
          platform: source.provider,
          url: source.url,
        });
      }
    });

    return links;
  }, [release.sources]);

  // Get primary artist for "View Artist" action
  const primaryArtist = release.artists?.[0];

  // Get custom menu items for albums
  const customItems = interaction.customMenuItems?.album ?? [];

  const handleViewAlbum = React.useCallback(() => {
    interaction.onNavigate?.('album', release);
    onClose?.();
  }, [interaction, release, onClose]);

  const handleViewArtist = React.useCallback(() => {
    if (primaryArtist) {
      // Navigate with artist credit info - the app can resolve to full artist
      interaction.onNavigate?.('artist', release);
    }
    onClose?.();
  }, [interaction, release, primaryArtist, onClose]);

  const handleCopyUPC = React.useCallback(() => {
    if (release.gtin) {
      navigator.clipboard.writeText(release.gtin);
    }
    onClose?.();
  }, [release.gtin, onClose]);

  const handleCopyLink = React.useCallback(() => {
    interaction.onCopyLink?.(release, 'album');
    onClose?.();
  }, [interaction, release, onClose]);

  const handleViewCredits = React.useCallback(() => {
    interaction.onViewCredits?.(release, 'album');
    onClose?.();
  }, [interaction, release, onClose]);

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
      <MenuLabel className="truncate">{release.title}</MenuLabel>
      <MenuSeparator />

      {/* Navigation actions */}
      {interaction.onNavigate && (
        <>
          <MenuItem onSelect={handleViewAlbum}>
            View Album Details
          </MenuItem>
          {primaryArtist && (
            <MenuItem onSelect={handleViewArtist}>
              View Artist
            </MenuItem>
          )}
        </>
      )}

      {/* View credits/metadata */}
      {interaction.onViewCredits && (
        <MenuItem onSelect={handleViewCredits}>
          View Credits & Metadata
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
      {release.gtin && (
        <MenuItem onSelect={handleCopyUPC}>
          Copy UPC/GTIN
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
