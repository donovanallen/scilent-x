import * as React from 'react';
import {
  cn,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Skeleton,
} from '@scilent-one/ui';
import type { HarmonizedRelease, ReleaseType } from '../../types';
import { AlbumCard, AlbumCardSkeleton } from '../album/AlbumCard';

export interface ArtistDiscographyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of releases for the artist */
  releases: HarmonizedRelease[];
  /** Optional map of release GTINs/IDs to artwork URLs */
  artworkMap?: Record<string, string> | undefined;
  /** Release types to show as tabs */
  releaseTypes?: ReleaseType[] | undefined;
  /** Default selected tab */
  defaultTab?: ReleaseType | 'all' | undefined;
  /** Callback when a release is clicked */
  onReleaseClick?: ((release: HarmonizedRelease) => void) | undefined;
}

const releaseTypeLabels: Record<ReleaseType | 'all', string> = {
  all: 'All',
  album: 'Albums',
  single: 'Singles',
  ep: 'EPs',
  compilation: 'Compilations',
  soundtrack: 'Soundtracks',
  live: 'Live',
  remix: 'Remixes',
  other: 'Other',
};

export function ArtistDiscography({
  releases,
  artworkMap = {},
  releaseTypes = ['album', 'single', 'ep'],
  defaultTab = 'all',
  onReleaseClick,
  className,
  ...props
}: ArtistDiscographyProps) {
  const groupedReleases = React.useMemo(() => {
    const groups: Record<string, HarmonizedRelease[]> = { all: releases };

    releases.forEach((release) => {
      const type = release.releaseType;
      if (!groups[type]) groups[type] = [];
      groups[type]?.push(release);
    });

    return groups;
  }, [releases]);

  const availableTabs = React.useMemo(() => {
    const tabs: (ReleaseType | 'all')[] = ['all'];
    releaseTypes.forEach((type) => {
      const typeReleases = groupedReleases[type];
      if (typeReleases && typeReleases.length > 0) {
        tabs.push(type);
      }
    });
    return tabs;
  }, [releaseTypes, groupedReleases]);

  const getArtworkUrl = (release: HarmonizedRelease) => {
    const id = release.gtin || Object.values(release.externalIds)[0];
    return id ? artworkMap[id] : undefined;
  };

  return (
    <div className={cn('space-y-4', className)} {...props}>
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {releaseTypeLabels[tab]}
              {groupedReleases[tab] && (
                <span className="ml-1 text-xs text-muted-foreground">
                  {`(${groupedReleases[tab]?.length ?? 0})`}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableTabs.map((tab) => {
          const tabReleases = groupedReleases[tab] ?? [];
          return (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tabReleases.map((release) => {
                  const releaseId =
                    release.gtin || Object.values(release.externalIds)[0];
                  return (
                    <AlbumCard
                      key={releaseId}
                      release={release}
                      artworkUrl={getArtworkUrl(release)}
                      onClick={onReleaseClick}
                      previewSide="bottom"
                      previewAlign="start"
                    />
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export interface ArtistDiscographySkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export function ArtistDiscographySkeleton({
  count = 10,
  className,
  ...props
}: ArtistDiscographySkeletonProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-16" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
        {Array.from({ length: count }).map((_, i) => (
          <AlbumCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
