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
  Type,
} from 'lucide-react';
import { useHarmonyInteraction } from '../provider';
import type { HarmonizedEntity, MenuAction, ProviderAction } from '../types';
import type { HarmonizedRelease } from '../../types';
import { formatPlatformName, formatArtistNames } from '../../utils';
import { ProviderActionsGroup } from './ProviderActionsGroup';

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
 *
 * Organized into sections:
 * - Section 1: Core Actions (view album, view artist, view credits)
 * - Section 2: Copy Submenu (link, UPC/GTIN, title, artists)
 * - Section 3: Open In Submenu (external platform links)
 * - Section 4: Provider Actions (save, add to library - dynamic based on connected providers)
 * - Section 5: Custom Menu Items (app-specific)
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

  // Get provider actions for albums
  const providerActions = (interaction.providerActions?.album ?? []) as ProviderAction<HarmonizedRelease>[];

  // Get custom menu items for albums
  const customItems = interaction.customMenuItems?.album ?? [];

  // Determine if we have copy actions
  const hasCopyActions = release.gtin || interaction.onCopyLink || release.title || release.artists?.length;

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

  const handleCopyTitle = React.useCallback(() => {
    if (release.title) {
      navigator.clipboard.writeText(release.title);
    }
    onClose?.();
  }, [release.title, onClose]);

  const handleCopyArtists = React.useCallback(() => {
    if (release.artists?.length) {
      const artistNames = formatArtistNames(release.artists);
      navigator.clipboard.writeText(artistNames);
    }
    onClose?.();
  }, [release.artists, onClose]);

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

      {/* Section 1: Core Actions */}
      {interaction.onNavigate && (
        <>
          <MenuItem className="gap-2" onSelect={handleViewAlbum}>
            <Disc3 className="size-4" />
            View Album Details
          </MenuItem>
          {primaryArtist && (
            <MenuItem className="gap-2" onSelect={handleViewArtist}>
              <User className="size-4" />
              View Artist
            </MenuItem>
          )}
        </>
      )}

      {interaction.onViewCredits && (
        <MenuItem className="gap-2" onSelect={handleViewCredits}>
          <ScrollText className="size-4" />
          View Credits & Metadata
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
              {release.gtin && (
                <MenuItem onSelect={handleCopyUPC}>
                  <Copy className="mr-2 size-4" />
                  Copy UPC/GTIN
                </MenuItem>
              )}
              {release.title && (
                <MenuItem onSelect={handleCopyTitle}>
                  <Type className="mr-2 size-4" />
                  Copy Title
                </MenuItem>
              )}
              {release.artists && release.artists.length > 0 && (
                <MenuItem onSelect={handleCopyArtists}>
                  <Copy className="mr-2 size-4" />
                  Copy Artist{release.artists.length > 1 ? 's' : ''}
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
        <ProviderActionsGroup<HarmonizedRelease>
          entityType="album"
          entity={release}
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
