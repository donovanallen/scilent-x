'use client';

import {
  HarmonyInteractionProvider as BaseProvider,
  type HarmonyInteractionConfig,
  type EntityType,
  type HarmonizedEntity,
  type ProviderActions,
  type EnabledProvider,
} from '@scilent-one/scilent-ui';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, type ReactNode } from 'react';
import { toast } from 'sonner';

interface HarmonyInteractionProviderProps {
  children: ReactNode;
  config?: Partial<HarmonyInteractionConfig>;
  /**
   * List of connected providers (OAuth tokens stored for user)
   * When implemented, this will come from user session/context
   */
  connectedProviders?: EnabledProvider[];
}

/**
 * App-specific wrapper around HarmonyInteractionProvider that configures
 * interaction callbacks for navigation, external links, and clipboard operations.
 *
 * Also builds provider-specific actions based on connected accounts.
 * Provider actions allow users to like/save tracks, follow artists, etc.
 * directly from context menus.
 */
export function HarmonyInteractionProvider({
  children,
  config,
  connectedProviders = [],
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

  // Build provider actions based on connected accounts
  // TODO: Implement actual API calls when connected accounts feature is ready
  const providerActions = useMemo<ProviderActions>(() => {
    const actions: ProviderActions = {
      track: [],
      album: [],
      artist: [],
    };

    // For each connected provider, add appropriate actions
    connectedProviders.forEach((provider) => {
      if (!provider.connected) return;

      // Example: Spotify actions (when connected)
      // These will be implemented when OAuth integration is complete
      /*
      if (provider.name === 'spotify') {
        if (provider.capabilities.canSaveTracks) {
          actions.track?.push({
            id: 'spotify-save-track',
            provider: 'spotify',
            actionType: 'like',
            label: 'Save to Spotify Library',
            icon: HeartIcon,
            onAction: async (entity) => {
              // await spotifyApi.saveTrack(entity.externalIds?.spotify);
              toast.success('Saved to Spotify Library');
            },
          });
        }

        if (provider.capabilities.canFollowArtists) {
          actions.artist?.push({
            id: 'spotify-follow-artist',
            provider: 'spotify',
            actionType: 'follow',
            label: 'Follow on Spotify',
            icon: UserPlusIcon,
            onAction: async (entity) => {
              // await spotifyApi.followArtist(entity.externalIds?.spotify);
              toast.success('Following artist on Spotify');
            },
          });
        }
      }
      */
    });

    return actions;
  }, [connectedProviders]);

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
        providerActions,
        enabledProviders: connectedProviders,
        ...config,
      }}
    >
      {children}
    </BaseProvider>
  );
}
