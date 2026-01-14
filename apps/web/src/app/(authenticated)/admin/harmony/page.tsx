import { ProviderIcon, type IconProvider } from '@scilent-one/harmony-ui';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@scilent-one/ui';
import {
  CheckCircle2,
  Circle,
  Zap,
  Disc3,
  Music2,
  Mic2,
  Search,
  Lock,
  CircleX,
} from 'lucide-react';
import { Suspense } from 'react';

import { getEngineStatus, type ProviderCapabilities } from '../actions';

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

const CAPABILITY_CONFIG = {
  userAuth: {
    label: 'Profile',
    description: 'Fetch connected user profile from provider',
    icon: Lock,
    requiresUserAuth: true,
  },
  releaseLookup: {
    label: 'Releases',
    description: 'Release/album lookup by GTIN/UPC',
    icon: Disc3,
    requiresUserAuth: false,
  },
  trackLookup: {
    label: 'Tracks',
    description: 'Track lookup by ISRC',
    icon: Music2,
    requiresUserAuth: false,
  },
  artistLookup: {
    label: 'Artists',
    description: 'Artist lookup and search',
    icon: Mic2,
    requiresUserAuth: false,
  },
  search: {
    label: 'Search',
    description: 'General catalog search',
    icon: Search,
    requiresUserAuth: false,
  },
} as const;

function CapabilityBadges({
  capabilities,
}: {
  capabilities: ProviderCapabilities;
}) {
  return (
    <TooltipProvider>
      <div className='flex flex-wrap gap-1.5 mt-2'>
        {(Object.keys(CAPABILITY_CONFIG) as (keyof ProviderCapabilities)[]).map(
          (key) => {
            const config = CAPABILITY_CONFIG[key];
            const isSupported = capabilities[key];
            const Icon = config.icon;
            const isUserAuth = config.requiresUserAuth;

            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <Badge
                    variant={isSupported ? 'outline' : 'secondary'}
                    className={`gap-1 text-xs ${
                      isSupported
                        ? 'border-primary/30 text-primary'
                        : 'opacity-40'
                    }`}
                  >
                    <Icon className='h-3 w-3' />
                    {config.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className='flex items-center gap-1'>
                  {isSupported ? (
                    <CheckCircle2 className='h-3 w-3' />
                  ) : (
                    <CircleX className='h-3 w-3' />
                  )}
                  <span className='text-xs'>{config.description}</span>
                  <span className='text-xs'>
                    {isUserAuth && ' (requires user OAuth token)'}
                  </span>
                </TooltipContent>
              </Tooltip>
            );
          }
        )}
      </div>
    </TooltipProvider>
  );
}

async function EngineStatusCard() {
  const status = await getEngineStatus();

  const allProviders = [
    {
      name: 'musicbrainz',
      displayName: 'MusicBrainz',
      authType: 'None (rate limited)',
    },
    {
      name: 'spotify',
      displayName: 'Spotify',
      authType: 'OAuth Client Credentials',
    },
    {
      name: 'tidal',
      displayName: 'Tidal',
      authType: 'OAuth Client Credentials',
    },
  ];

  const enabledNames = new Set(status.enabledProviders.map((p) => p.name));

  return (
    <div className='space-y-6 pb-6'>
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
                <div key={provider.name} className='py-4 first:pt-0 last:pb-0'>
                  <div className='flex items-start justify-between gap-2'>
                    <ProviderIcon provider={provider.name as IconProvider} />
                    <div className='space-y-1 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>
                          {provider.displayName}
                        </span>
                        <StatusBadge enabled={isEnabled} />
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Auth: {provider.authType}
                      </p>
                      {isEnabled && enabledInfo && (
                        <CapabilityBadges
                          capabilities={enabledInfo.capabilities}
                        />
                      )}
                    </div>
                    {isEnabled && enabledInfo && (
                      <div className='text-right shrink-0 ml-4'>
                        <div className='text-sm font-medium'>
                          Priority: {enabledInfo.priority}
                        </div>
                      </div>
                    )}
                  </div>
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
            <p className='text-muted-foreground'>
              Configuration details are managed securely on the server and are
              not displayed in this dashboard.
            </p>
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
    <div className='w-full flex flex-col h-full min-h-0 space-y-6'>
      <div>
        <h2>Harmony Engine</h2>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <EngineStatusCard />
      </Suspense>
    </div>
  );
}
