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
import { User, ExternalLink, Link, Library, Copy, Type } from 'lucide-react';
import { useHarmonyInteraction } from '../provider';
import type { HarmonizedEntity, MenuAction, ProviderAction } from '../types';
import type { HarmonizedArtist } from '../../types';
import { formatPlatformName } from '../../utils';
import { ProviderActionsGroup } from './ProviderActionsGroup';

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
 *
 * Organized into sections:
 * - Section 1: Core Actions (view artist, view discography)
 * - Section 2: Copy Submenu (link, name)
 * - Section 3: Open In Submenu (external platform links)
 * - Section 4: Provider Actions (follow - dynamic based on connected providers)
 * - Section 5: Custom Menu Items (app-specific)
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

  // Get provider actions for artists
  const providerActions = (interaction.providerActions?.artist ?? []) as ProviderAction<HarmonizedArtist>[];

  // Get custom menu items for artists
  const customItems = interaction.customMenuItems?.artist ?? [];

  // Determine if we have copy actions
  const hasCopyActions = interaction.onCopyLink || artist.name;

  const handleViewArtist = React.useCallback(() => {
    interaction.onNavigate?.('artist', artist);
    onClose?.();
  }, [interaction, artist, onClose]);

  const handleCopyLink = React.useCallback(() => {
    interaction.onCopyLink?.(artist, 'artist');
    onClose?.();
  }, [interaction, artist, onClose]);

  const handleCopyName = React.useCallback(() => {
    if (artist.name) {
      navigator.clipboard.writeText(artist.name);
    }
    onClose?.();
  }, [artist.name, onClose]);

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

      {/* Section 1: Core Actions */}
      {interaction.onNavigate && (
        <MenuItem className="gap-2" onSelect={handleViewArtist}>
          <User className="size-4" />
          View Artist
        </MenuItem>
      )}

      {interaction.onViewCredits && (
        <MenuItem className="gap-2" onSelect={handleViewCredits}>
          <Library className="size-4" />
          View Discography
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
                <MenuItem className="gap-2" onSelect={handleCopyLink}>
                  <Link className="size-4" />
                  Copy Link
                </MenuItem>
              )}
              {artist.name && (
                <MenuItem className="gap-2" onSelect={handleCopyName}>
                  <Type className="size-4" />
                  Copy Name
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
        <ProviderActionsGroup<HarmonizedArtist>
          entityType="artist"
          entity={artist}
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
