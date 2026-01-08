import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@scilent-one/ui';
import { CheckCircle2, Circle, Zap } from 'lucide-react';
import { Suspense } from 'react';

import { getEngineStatus } from '../actions';

export const metadata = {
  title: 'Harmony Engine',
};

function StatusBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Badge variant='default' className='gap-1'>
      <CheckCircle2 className='h-3 w-3' />
      Enabled
    </Badge>
  ) : (
    <Badge variant='secondary' className='gap-1'>
      <Circle className='h-3 w-3' />
      Disabled
    </Badge>
  );
}

async function EngineStatusCard() {
  const status = await getEngineStatus();

  const allProviders = [
    {
      name: 'musicbrainz',
      displayName: 'MusicBrainz',
      description: 'Open music encyclopedia with comprehensive metadata',
      authType: 'None (rate limited)',
    },
    {
      name: 'spotify',
      displayName: 'Spotify',
      description: 'Streaming service with extensive catalog data',
      authType: 'OAuth Client Credentials',
    },
    {
      name: 'tidal',
      displayName: 'Tidal',
      description: 'High-fidelity streaming with detailed metadata',
      authType: 'OAuth Client Credentials',
    },
  ];

  const enabledNames = new Set(status.enabledProviders.map((p) => p.name));

  return (
    <div className='space-y-6'>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Zap className='h-5 w-5 text-primary' />
            </div>
            <div>
              <CardTitle>Engine Status</CardTitle>
              <CardDescription>
                {status.enabledProviders.length} of {allProviders.length}{' '}
                providers active
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='rounded-lg border p-4'>
              <div className='text-2xl font-bold'>
                {status.enabledProviders.length}
              </div>
              <div className='text-sm text-muted-foreground'>
                Active Providers
              </div>
            </div>
            <div className='rounded-lg border p-4'>
              <div className='text-2xl font-bold'>
                {status.enabledProviders.length > 0 ? 'Online' : 'Offline'}
              </div>
              <div className='text-sm text-muted-foreground'>Engine Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers List */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata Providers</CardTitle>
          <CardDescription>
            Configured data sources for music metadata lookups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='divide-y'>
            {allProviders.map((provider) => {
              const isEnabled = enabledNames.has(provider.name);
              const enabledInfo = status.enabledProviders.find(
                (p) => p.name === provider.name
              );

              return (
                <div
                  key={provider.name}
                  className='flex items-center justify-between py-4 first:pt-0 last:pb-0'
                >
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {provider.displayName}
                      </span>
                      <StatusBadge enabled={isEnabled} />
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {provider.description}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Auth: {provider.authType}
                    </p>
                  </div>
                  {isEnabled && enabledInfo && (
                    <div className='text-right'>
                      <div className='text-sm font-medium'>
                        Priority: {enabledInfo.priority}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Environment variables and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3 text-sm'>
            <div className='flex justify-between rounded-lg bg-muted/50 px-3 py-2'>
              <span className='text-muted-foreground'>MUSICBRAINZ_CONTACT</span>
              <span className='font-mono'>
                {process.env.MUSICBRAINZ_CONTACT
                  ? '••••••••'
                  : 'Not set (using default)'}
              </span>
            </div>
            <div className='flex justify-between rounded-lg bg-muted/50 px-3 py-2'>
              <span className='text-muted-foreground'>SPOTIFY_CLIENT_ID</span>
              <span className='font-mono'>
                {process.env.SPOTIFY_CLIENT_ID ? '••••••••' : 'Not configured'}
              </span>
            </div>
            <div className='flex justify-between rounded-lg bg-muted/50 px-3 py-2'>
              <span className='text-muted-foreground'>
                SPOTIFY_CLIENT_SECRET
              </span>
              <span className='font-mono'>
                {process.env.SPOTIFY_CLIENT_SECRET
                  ? '••••••••'
                  : 'Not configured'}
              </span>
            </div>
            <div className='flex justify-between rounded-lg bg-muted/50 px-3 py-2'>
              <span className='text-muted-foreground'>TIDAL_CLIENT_ID</span>
              <span className='font-mono'>
                {process.env.TIDAL_CLIENT_ID ? '••••••••' : 'Not configured'}
              </span>
            </div>
            <div className='flex justify-between rounded-lg bg-muted/50 px-3 py-2'>
              <span className='text-muted-foreground'>TIDAL_CLIENT_SECRET</span>
              <span className='font-mono'>
                {process.env.TIDAL_CLIENT_SECRET
                  ? '••••••••'
                  : 'Not configured'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='h-6 w-48 animate-pulse rounded bg-muted' />
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2'>
            {[1, 2].map((i) => (
              <div key={i} className='h-20 animate-pulse rounded-lg bg-muted' />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HarmonyDashboardPage() {
  return (
    <div className='w-full space-y-6 py-10'>
      <div>
        <h1 className='text-3xl font-bold'>Harmony Engine</h1>
        <p className='mt-1 text-muted-foreground'>
          Music metadata harmonization configuration and status
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <EngineStatusCard />
      </Suspense>
    </div>
  );
}
