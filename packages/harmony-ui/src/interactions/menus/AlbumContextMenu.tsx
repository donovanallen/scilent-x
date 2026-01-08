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
import {
  Disc3,
  User,
  ExternalLink,
  Copy,
  Link,
  ScrollText,
} from 'lucide-react';
import { useHarmonyInteraction } from '../provider';
import type { HarmonizedEntity, MenuAction } from '../types';
import type { HarmonizedRelease } from '../../types';
import { formatPlatformName } from '../../utils';

export interface AlbumContextMenuProps {
  /** The album/release entity */
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
 * Context menu content for album/release entities.
 * Provides actions like: view album, view artist, external links, copy UPC
 */
export function AlbumContextMenu({
  entity,
  onClose,
  menuType = 'context',
}: AlbumContextMenuProps) {
  const interaction = useHarmonyInteraction();
  const release = entity as HarmonizedRelease;
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
      // Build a minimal HarmonizedArtist from the credit info
      // The app can use externalIds to resolve to the full artist entity
      const artistEntity = {
        name: primaryArtist.creditedName ?? primaryArtist.name,
        externalIds: primaryArtist.externalIds ?? {},
        sources: [],
        mergedAt: new Date(),
        confidence: 1,
      };
      interaction.onNavigate?.('artist', artistEntity);
    }
    onClose?.();
  }, [interaction, primaryArtist, onClose]);

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
      <MenuLabel className="truncate">{release.title}</MenuLabel>
      <MenuSeparator />

      {/* Navigation actions */}
      {interaction.onNavigate && (
        <>
          <MenuItem onSelect={handleViewAlbum}>
            <Disc3 className="mr-2 h-4 w-4" />
            View Album Details
          </MenuItem>
          {primaryArtist && (
            <MenuItem onSelect={handleViewArtist}>
              <User className="mr-2 h-4 w-4" />
              View Artist
            </MenuItem>
          )}
        </>
      )}

      {/* View credits/metadata */}
      {interaction.onViewCredits && (
        <MenuItem onSelect={handleViewCredits}>
          <ScrollText className="mr-2 h-4 w-4" />
          View Credits & Metadata
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
      {release.gtin && (
        <MenuItem onSelect={handleCopyUPC}>
          <Copy className="mr-2 h-4 w-4" />
          Copy UPC/GTIN
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
