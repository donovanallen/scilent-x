'use client';

import {
  HarmonyInteractionProvider as BaseProvider,
  type HarmonyInteractionConfig,
  type EntityType,
  type HarmonizedEntity,
  type ProviderActions,
  type EnabledProvider,
  type HarmonizedRelease,
  type HarmonizedTrack,
} from '@scilent-one/scilent-ui';
import { useTransitionRouter } from 'next-view-transitions';
import { useCallback, useMemo, type ReactNode } from 'react';
import { toast } from 'sonner';

interface HarmonyInteractionProviderProps {
  children: ReactNode;
  config?: Partial<HarmonyInteractionConfig>;
  connectedProviders?: EnabledProvider[];
}

export function HarmonyInteractionProvider({
  children,
  config,
  connectedProviders = [],
}: HarmonyInteractionProviderProps) {
  const router = useTransitionRouter();

  const handleNavigate = useCallback(
    (entityType: EntityType, entity: HarmonizedEntity) => {
      switch (entityType) {
        case 'album':
          if ('gtin' in entity && entity.gtin) {
            router.push(`/releases/${entity.gtin}`);
          }
          break;
        case 'track':
          if ('isrc' in entity && entity.isrc) {
            router.push(`/tracks/${entity.isrc}`);
          }
          break;
        case 'artist':
          if ('externalIds' in entity && entity.externalIds?.musicbrainz) {
            router.push(`/artists/${entity.externalIds.musicbrainz}`);
          }
          break;
      }
    },
    [router]
  );

  const handleOpenExternal = useCallback((url: string, platform: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(`Opening ${platform}...`);
  }, []);

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

  const handleViewCredits = useCallback(
    (entity: HarmonizedEntity, entityType: EntityType) => {
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

  const handleWriteReview = useCallback(
    (entityType: 'album' | 'track', entity: HarmonizedEntity) => {
      if (entityType === 'album') {
        const release = entity as HarmonizedRelease;
        if (release.gtin) {
          router.push(
            `/reviews/new?gtin=${encodeURIComponent(release.gtin)}&type=RELEASE`
          );
          return;
        }
        if (release.externalIds?.musicbrainz) {
          router.push(
            `/reviews/new?url=${encodeURIComponent(`https://musicbrainz.org/release/${release.externalIds.musicbrainz}`)}`
          );
        }
        return;
      }

      const track = entity as HarmonizedTrack;
      if (track.isrc) {
        router.push(
          `/reviews/new?isrc=${encodeURIComponent(track.isrc)}&type=TRACK`
        );
        return;
      }
      const sourceUrl = track.sources[0]?.url;
      if (sourceUrl) {
        router.push(`/reviews/new?url=${encodeURIComponent(sourceUrl)}`);
      }
    },
    [router]
  );

  const providerActions = useMemo<ProviderActions>(
    () => ({
      track: [],
      album: [],
      artist: [],
    }),
    []
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
        onWriteReview: handleWriteReview,
        providerActions,
        enabledProviders: connectedProviders,
        ...config,
      }}
    >
      {children}
    </BaseProvider>
  );
}
