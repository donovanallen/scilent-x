'use client';

import {
  HarmonyInteractionProvider as BaseProvider,
  type HarmonyInteractionConfig,
  type EntityType,
  type HarmonizedEntity,
} from '@scilent-one/harmony-ui';
import { useRouter } from 'next/navigation';
import { useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';

interface HarmonyInteractionProviderProps {
  children: ReactNode;
  config?: Partial<HarmonyInteractionConfig>;
}

/**
 * App-specific wrapper around HarmonyInteractionProvider that configures
 * interaction callbacks for navigation, external links, and clipboard operations.
 */
export function HarmonyInteractionProvider({
  children,
  config,
}: HarmonyInteractionProviderProps) {
  const router = useRouter();

  // Navigate to entity detail pages
  const handleNavigate = useCallback(
    (entityType: EntityType, entity: HarmonizedEntity) => {
      // Build the navigation URL based on entity type
      switch (entityType) {
        case 'album':
          // Navigate to release/album detail page
          if ('gtin' in entity && entity.gtin) {
            router.push(`/releases/${entity.gtin}`);
          }
          break;
        case 'track':
          // Navigate to track detail page
          if ('isrc' in entity && entity.isrc) {
            router.push(`/tracks/${entity.isrc}`);
          }
          break;
        case 'artist':
          // Navigate to artist detail page
          if ('externalIds' in entity && entity.externalIds?.musicbrainz) {
            router.push(`/artists/${entity.externalIds.musicbrainz}`);
          }
          break;
      }
    },
    [router]
  );

  // Open external platform links
  const handleOpenExternal = useCallback((url: string, platform: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(`Opening ${platform}...`);
  }, []);

  // Copy link to clipboard
  const handleCopyLink = useCallback(
    (entity: HarmonizedEntity, entityType: EntityType) => {
      let url = window.location.origin;

      switch (entityType) {
        case 'album':
          if ('gtin' in entity && entity.gtin) {
            url += `/releases/${entity.gtin}`;
          }
          break;
        case 'track':
          if ('isrc' in entity && entity.isrc) {
            url += `/tracks/${entity.isrc}`;
          }
          break;
        case 'artist':
          if ('externalIds' in entity && entity.externalIds?.musicbrainz) {
            url += `/artists/${entity.externalIds.musicbrainz}`;
          }
          break;
      }

      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    },
    []
  );

  // View entity credits/metadata
  const handleViewCredits = useCallback(
    (entity: HarmonizedEntity, entityType: EntityType) => {
      // Navigate to credits view or open a modal
      // For now, navigate to the entity page with a query param
      switch (entityType) {
        case 'album':
          if ('gtin' in entity && entity.gtin) {
            router.push(`/releases/${entity.gtin}?tab=credits`);
          }
          break;
        case 'track':
          if ('isrc' in entity && entity.isrc) {
            router.push(`/tracks/${entity.isrc}?tab=credits`);
          }
          break;
        case 'artist':
          if ('externalIds' in entity && entity.externalIds?.musicbrainz) {
            router.push(`/artists/${entity.externalIds.musicbrainz}?tab=about`);
          }
          break;
      }
    },
    [router]
  );

  return (
    <BaseProvider
      config={{
        platform: 'auto',
        enableContextMenu: true,
        enableHoverPreview: true,
        hoverDelay: 300,
        onNavigate: handleNavigate,
        onOpenExternal: handleOpenExternal,
        onCopyLink: handleCopyLink,
        onViewCredits: handleViewCredits,
        ...config,
      }}
    >
      {children}
    </BaseProvider>
  );
}
