'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  cn,
} from '@scilent-one/ui';
import type {
  HarmonizedRelease,
  HarmonizedTrack,
} from '@scilent-one/harmony-engine';
import { AlbumListItem } from '../album/AlbumListItem';
import { TrackCard } from '../track/TrackCard';

export type MusicPickerType = 'release' | 'track';

export interface SelectedMusicSubject {
  type: 'RELEASE' | 'TRACK';
  gtin?: string;
  isrc?: string;
  title: string;
  artistLabel: string;
  artworkUrl?: string;
  snapshot: HarmonizedRelease | HarmonizedTrack;
}

export interface MusicSubjectPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (subject: SelectedMusicSubject) => void;
  initialType?: MusicPickerType;
}

async function searchReleases(query: string): Promise<HarmonizedRelease[]> {
  const response = await fetch(
    `/api/v1/releases/search?q=${encodeURIComponent(query)}&limit=20`
  );
  if (!response.ok) return [];
  const data = (await response.json()) as { items: HarmonizedRelease[] };
  return data.items ?? [];
}

async function searchTracks(query: string): Promise<HarmonizedTrack[]> {
  const response = await fetch(
    `/api/v1/tracks/search?q=${encodeURIComponent(query)}&limit=20`
  );
  if (!response.ok) return [];
  const data = (await response.json()) as { items: HarmonizedTrack[] };
  return data.items ?? [];
}

function getPrimaryArtist(
  credits: Array<{ name: string; creditedName?: string | undefined }>
): string {
  const first = credits[0];
  if (!first) return 'Unknown Artist';
  return first.creditedName || first.name;
}

function getArtworkUrl(
  artwork: Array<{ url: string; type: string }> | undefined
): string | undefined {
  if (!artwork?.length) return undefined;
  return artwork.find((a) => a.type === 'front')?.url ?? artwork[0]?.url;
}

export function MusicSubjectPicker({
  open,
  onOpenChange,
  onSelect,
  initialType = 'release',
}: MusicSubjectPickerProps) {
  const [pickerType, setPickerType] =
    React.useState<MusicPickerType>(initialType);
  const [query, setQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [releases, setReleases] = React.useState<HarmonizedRelease[]>([]);
  const [tracks, setTracks] = React.useState<HarmonizedTrack[]>([]);

  React.useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setReleases([]);
      setTracks([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (pickerType === 'release') {
          setReleases(await searchReleases(trimmed));
        } else {
          setTracks(await searchTracks(trimmed));
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [open, query, pickerType]);

  const handleSelectRelease = (release: HarmonizedRelease) => {
    const artworkUrl = getArtworkUrl(release.artwork);
    onSelect({
      type: 'RELEASE',
      ...(release.gtin ? { gtin: release.gtin } : {}),
      title: release.title,
      artistLabel: getPrimaryArtist(release.artists),
      ...(artworkUrl ? { artworkUrl } : {}),
      snapshot: release,
    });
    onOpenChange(false);
  };

  const handleSelectTrack = (track: HarmonizedTrack) => {
    onSelect({
      type: 'TRACK',
      ...(track.isrc ? { isrc: track.isrc } : {}),
      title: track.title,
      artistLabel: getPrimaryArtist(track.artists),
      snapshot: track,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex max-h-[80vh] flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Attach music</DialogTitle>
        </DialogHeader>

        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            size="sm"
            variant={pickerType === 'release' ? 'default' : 'outline'}
            onClick={() => setPickerType('release')}
          >
            Releases
          </Button>
          <Button
            type="button"
            size="sm"
            variant={pickerType === 'track' ? 'default' : 'outline'}
            onClick={() => setPickerType('track')}
          >
            Tracks
          </Button>
        </div>

        <Input
          className="shrink-0"
          placeholder={
            pickerType === 'release' ? 'Search albums…' : 'Search tracks…'
          }
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />

        <div className="min-h-0 max-h-[300px] overflow-y-auto overscroll-contain pr-3">
          {isSearching ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Searching…
            </p>
          ) : query.trim().length < 2 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Type at least 2 characters to search
            </p>
          ) : pickerType === 'release' ? (
            <div className="space-y-1">
              {releases.map((release) => (
                <button
                  key={`${release.gtin ?? release.title}-${release.sources[0]?.id ?? ''}`}
                  type="button"
                  className={cn(
                    'w-full text-left rounded-md hover:bg-muted/60 transition-colors'
                  )}
                  onClick={() => handleSelectRelease(release)}
                >
                  <AlbumListItem release={release} interactive={false} />
                </button>
              ))}
              {releases.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No releases found
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track) => (
                <button
                  key={`${track.isrc ?? track.title}-${track.sources[0]?.id ?? ''}`}
                  type="button"
                  className={cn(
                    'w-full text-left rounded-md hover:bg-muted/60 transition-colors'
                  )}
                  onClick={() => handleSelectTrack(track)}
                >
                  <TrackCard track={track} variant="list" interactive={false} />
                </button>
              ))}
              {tracks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No tracks found
                </p>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
