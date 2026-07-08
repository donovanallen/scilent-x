'use client';

import type {
  HarmonizedArtistCredit,
  HarmonizedRelease,
  HarmonizedTrack,
  LookupResult,
  PartialDate,
} from '@scilent-one/harmony-engine';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@scilent-one/ui';
import {
  AlertCircle,
  Barcode,
  Clock,
  Disc3,
  Link as LinkIcon,
  Loader2,
  Music2,
  Search,
  SearchX,
} from 'lucide-react';
import { useState, useTransition } from 'react';

import {
  lookupByGtin,
  lookupByIsrc,
  lookupByUrl,
  type UrlLookupResult,
} from '../../actions';

type LookupMode = 'gtin' | 'isrc' | 'url';

type LookupResultState =
  | { mode: 'gtin'; result: LookupResult<HarmonizedRelease> }
  | { mode: 'isrc'; result: LookupResult<HarmonizedTrack> }
  | { mode: 'url'; result: UrlLookupResult };

const MODE_CONFIG: Record<
  LookupMode,
  { label: string; icon: typeof Barcode; placeholder: string; hint: string }
> = {
  gtin: {
    label: 'GTIN',
    icon: Barcode,
    placeholder: 'e.g. 00602577089839',
    hint: 'Look up a release by its UPC/EAN barcode.',
  },
  isrc: {
    label: 'ISRC',
    icon: Music2,
    placeholder: 'e.g. USUM71703861',
    hint: 'Look up a track by its International Standard Recording Code.',
  },
  url: {
    label: 'URL',
    icon: LinkIcon,
    placeholder: 'e.g. https://open.spotify.com/track/...',
    hint: 'Resolve a release or track from a provider link.',
  },
};

function formatArtists(artists: HarmonizedArtistCredit[]): string {
  if (artists.length === 0) return 'Unknown artist';
  return artists
    .map((artist, index) => {
      const name = artist.creditedName ?? artist.name;
      const isLast = index === artists.length - 1;
      const join = artist.joinPhrase ?? (isLast ? '' : ', ');
      return `${name}${join}`;
    })
    .join('');
}

function formatReleaseDate(date: PartialDate | undefined): string | null {
  if (!date?.year) return null;
  const parts = [date.year];
  if (date.month) parts.push(date.month);
  if (date.day) parts.push(date.day);
  return parts.map((p) => String(p).padStart(2, '0')).join('-');
}

function formatDuration(seconds: number | undefined): string | null {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function SourceBadges({ sources }: { sources: string[] }) {
  if (sources.length === 0) return null;
  return (
    <div className='flex flex-wrap gap-1.5'>
      {sources.map((source) => (
        <Badge key={source} variant='outline' className='gap-1 text-xs'>
          {source}
        </Badge>
      ))}
    </div>
  );
}

function ReleaseResultCard({
  result,
}: {
  result: LookupResult<HarmonizedRelease>;
}) {
  const release = result.data;
  if (!release) return null;

  const releaseDate = formatReleaseDate(release.releaseDate);

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0'>
            <Disc3 className='h-5 w-5 text-primary' />
          </div>
          <div className='space-y-1 min-w-0'>
            <CardTitle className='truncate'>{release.title}</CardTitle>
            <CardDescription className='truncate'>
              {formatArtists(release.artists)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-wrap gap-2'>
          <Badge variant='secondary' className='capitalize'>
            {release.releaseType}
          </Badge>
          {releaseDate ? (
            <Badge variant='secondary'>{releaseDate}</Badge>
          ) : null}
          {release.gtin ? (
            <Badge variant='outline' className='font-mono gap-1'>
              <Barcode className='h-3 w-3' />
              {release.gtin}
            </Badge>
          ) : null}
        </div>
        <div className='space-y-1.5'>
          <p className='text-xs font-medium text-muted-foreground'>Sources</p>
          <SourceBadges sources={result.sources} />
        </div>
        {result.cached ? (
          <p className='text-xs text-muted-foreground'>Served from cache</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TrackResultCard({
  result,
}: {
  result: LookupResult<HarmonizedTrack>;
}) {
  const track = result.data;
  if (!track) return null;

  const duration = formatDuration(track.duration);

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0'>
            <Music2 className='h-5 w-5 text-primary' />
          </div>
          <div className='space-y-1 min-w-0'>
            <CardTitle className='truncate'>{track.title}</CardTitle>
            <CardDescription className='truncate'>
              {formatArtists(track.artists)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-wrap gap-2'>
          {track.isrc ? (
            <Badge variant='outline' className='font-mono gap-1'>
              <Music2 className='h-3 w-3' />
              {track.isrc}
            </Badge>
          ) : null}
          {duration ? (
            <Badge variant='secondary' className='gap-1'>
              <Clock className='h-3 w-3' />
              {duration}
            </Badge>
          ) : null}
          {track.explicit ? <Badge variant='secondary'>Explicit</Badge> : null}
        </div>
        <div className='space-y-1.5'>
          <p className='text-xs font-medium text-muted-foreground'>Sources</p>
          <SourceBadges sources={result.sources} />
        </div>
        {result.cached ? (
          <p className='text-xs text-muted-foreground'>Served from cache</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function NoResultCard() {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0'>
            <SearchX className='h-5 w-5 text-muted-foreground' />
          </div>
          <div>
            <CardTitle>No results</CardTitle>
            <CardDescription>
              No matching release or track was found for that identifier.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function ResultView({ state }: { state: LookupResultState }) {
  if (state.mode === 'gtin') {
    return state.result.data ? (
      <ReleaseResultCard result={state.result} />
    ) : (
      <NoResultCard />
    );
  }

  if (state.mode === 'isrc') {
    return state.result.data ? (
      <TrackResultCard result={state.result} />
    ) : (
      <NoResultCard />
    );
  }

  const { release, track } = state.result;
  const hasRelease = release?.data != null;
  const hasTrack = track?.data != null;

  if (!hasRelease && !hasTrack) {
    return <NoResultCard />;
  }

  return (
    <div className='space-y-4'>
      {hasRelease && release ? <ReleaseResultCard result={release} /> : null}
      {hasTrack && track ? <TrackResultCard result={track} /> : null}
    </div>
  );
}

export function LookupForm() {
  const [mode, setMode] = useState<LookupMode>('gtin');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResultState | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleModeChange = (nextMode: string) => {
    setMode(nextMode as LookupMode);
    setValue('');
    setError(null);
    setResult(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;

    startTransition(async () => {
      setError(null);
      setResult(null);

      if (mode === 'gtin') {
        const { error: err, data } = await lookupByGtin(query);
        if (err) {
          setError(err);
          return;
        }
        if (data) setResult({ mode: 'gtin', result: data });
        return;
      }

      if (mode === 'isrc') {
        const { error: err, data } = await lookupByIsrc(query);
        if (err) {
          setError(err);
          return;
        }
        if (data) setResult({ mode: 'isrc', result: data });
        return;
      }

      const { error: err, data } = await lookupByUrl(query);
      if (err) {
        setError(err);
        return;
      }
      if (data) setResult({ mode: 'url', result: data });
    });
  };

  const config = MODE_CONFIG[mode];

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Metadata Lookup</CardTitle>
          <CardDescription>
            Resolve releases and tracks across enabled providers by GTIN, ISRC,
            or provider URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={handleModeChange}>
            <TabsList className='grid w-full grid-cols-3 sm:w-auto sm:inline-grid'>
              {(Object.keys(MODE_CONFIG) as LookupMode[]).map((key) => {
                const Icon = MODE_CONFIG[key].icon;
                return (
                  <TabsTrigger key={key} value={key} className='gap-1.5'>
                    <Icon className='h-4 w-4' />
                    {MODE_CONFIG[key].label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(Object.keys(MODE_CONFIG) as LookupMode[]).map((key) => (
              <TabsContent key={key} value={key} className='mt-4'>
                <form onSubmit={handleSubmit} className='space-y-3'>
                  <div className='flex flex-col gap-2 sm:flex-row'>
                    <Input
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={MODE_CONFIG[key].placeholder}
                      aria-label={`${MODE_CONFIG[key].label} lookup`}
                      autoComplete='off'
                      spellCheck={false}
                      disabled={isPending}
                    />
                    <Button
                      type='submit'
                      disabled={isPending || value.trim().length === 0}
                      className='gap-1.5'
                    >
                      {isPending ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Search className='h-4 w-4' />
                      )}
                      Look up
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground'>{config.hint}</p>
                </form>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {error ? (
        <Card className='border-destructive/50'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 shrink-0'>
                <AlertCircle className='h-5 w-5 text-destructive' />
              </div>
              <div>
                <CardTitle>Lookup failed</CardTitle>
                <CardDescription>{error}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      ) : null}

      {result && !error ? <ResultView state={result} /> : null}
    </div>
  );
}
