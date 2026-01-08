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
import { User, ExternalLink, Link, Library } from 'lucide-react';
import { useHarmonyInteraction } from '../provider';
import type { HarmonizedEntity, MenuAction } from '../types';
import type { HarmonizedArtist } from '../../types';
import { formatPlatformName } from '../../utils';

export interface ArtistContextMenuProps {
  /** The artist entity */
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
 * Context menu content for artist entities.
 * Provides actions like: view artist, view discography, external links
 */
export function ArtistContextMenu({
  entity,
  onClose,
  menuType = 'context',
}: ArtistContextMenuProps) {
  const interaction = useHarmonyInteraction();
  const artist = entity as HarmonizedArtist;
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
      <MenuLabel className="truncate">{artist.name}</MenuLabel>
      {artist.disambiguation && (
        <div className="px-2 pb-1.5 text-xs text-muted-foreground truncate">
          {artist.disambiguation}
        </div>
      )}
      <MenuSeparator />

      {/* Navigation actions */}
      {interaction.onNavigate && (
        <MenuItem className="gap-2" onSelect={handleViewArtist}>
          <User className="size-4" />
          View Artist
        </MenuItem>
      )}

      {/* View credits/metadata */}
      {interaction.onViewCredits && (
        <MenuItem className="gap-2" onSelect={handleViewCredits}>
          <Library className="size-4" />
          View Discography
        </MenuItem>
      )}

      {/* External platform links */}
      {externalLinks.length > 0 && (
        <>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger className="flex gap-2">
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

      {/* Copy actions */}
      {interaction.onCopyLink && (
        <>
          <MenuSeparator />
          <MenuItem className="gap-2" onSelect={handleCopyLink}>
            <Link className="size-4" />
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
