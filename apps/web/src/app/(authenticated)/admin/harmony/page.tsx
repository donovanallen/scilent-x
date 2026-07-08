import { ProviderIcon, type IconProvider } from '@scilent-one/scilent-ui';
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
  ListOrdered,
} from 'lucide-react';
import { Suspense } from 'react';

import { getEngineStatus, type ProviderCapabilities } from '../actions';

import { ProviderToggle, ProviderPriorityControl } from './_components';
import { getProviderSettings, getProviderCredentialsStatus } from './actions';
import { PROVIDER_METADATA } from './provider-metadata';

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

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function LookupRankBadge({ rank }: { rank: number }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant='outline'
            className='gap-1 border-primary/30 text-primary'
          >
            <ListOrdered className='h-3 w-3' />
            {ordinal(rank)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className='flex items-center gap-1'>
          <span className='text-xs'>
            Queried {ordinal(rank)} when resolving metadata
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
  // Fetch engine status, provider settings, and credentials in parallel
  const [status, providerSettings, credentialsStatus] = await Promise.all([
    getEngineStatus(),
    getProviderSettings(),
    getProviderCredentialsStatus(),
  ]);

  // Create maps for quick lookup
  const settingsMap = new Map(providerSettings.map((s) => [s.providerName, s]));
  const enabledInfoMap = new Map(
    status.enabledProviders.map((p) => [p.name, p])
  );
  const enabledNames = new Set(status.enabledProviders.map((p) => p.name));

  // Compute the per-provider view model, resolving the effective priority from
  // the database setting, then the live engine, then the built-in default.
  const providerRows = PROVIDER_METADATA.map((meta) => {
    const isEnabled = enabledNames.has(meta.name);
    const enabledInfo = enabledInfoMap.get(meta.name);
    const hasCredentials = credentialsStatus.get(meta.name) ?? false;
    const setting = settingsMap.get(meta.name);
    // Provider is considered toggled ON if:
    // - there is a DB setting: has credentials AND setting.enabled
    // - or there is no DB setting: fall back to engine status (isEnabled)
    const isToggledOn =
      setting !== undefined ? hasCredentials && setting.enabled : isEnabled;
    const effectivePriority =
      setting?.priority ?? enabledInfo?.priority ?? meta.defaultPriority;

    return {
      meta,
      isEnabled,
      enabledInfo,
      hasCredentials,
      setting,
      isToggledOn,
      effectivePriority,
    };
  });

  // Sort by effective priority (highest first) so the list visually mirrors
  // the order the engine queries providers in.
  const sortedRows = providerRows.toSorted(
    (a, b) => b.effectivePriority - a.effectivePriority
  );

  // Only enabled providers are actually queried, so rank lookup order among
  // those. Ties fall back to the sorted order above.
  const rankByName = new Map(
    sortedRows
      .filter((row) => row.isEnabled)
      .map((row, index) => [row.meta.name, index + 1])
  );

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
                {status.enabledProviders.length} of {PROVIDER_METADATA.length}{' '}
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
            Data sources for music metadata lookups, ordered by priority.
            Enabled providers are queried highest-priority first, and the first
            match wins — raise a provider&apos;s priority to prefer its results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='divide-y'>
            {sortedRows.map((row) => {
              const {
                meta,
                isEnabled,
                enabledInfo,
                hasCredentials,
                isToggledOn,
                effectivePriority,
              } = row;
              const rank = rankByName.get(meta.name);

              return (
                <div key={meta.name} className='py-4 first:pt-0 last:pb-0'>
                  <div className='flex items-start justify-between gap-2'>
                    <ProviderIcon provider={meta.name as IconProvider} />
                    <div className='space-y-1 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='font-medium'>{meta.displayName}</span>
                        <StatusBadge enabled={isEnabled} />
                        {isEnabled && rank !== undefined && (
                          <LookupRankBadge rank={rank} />
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Auth: {meta.authType}
                      </p>
                      {isEnabled && enabledInfo && (
                        <CapabilityBadges
                          capabilities={enabledInfo.capabilities}
                        />
                      )}
                    </div>
                    <div className='flex items-center gap-4 shrink-0 ml-4'>
                      <ProviderPriorityControl
                        providerName={meta.name}
                        displayName={meta.displayName}
                        priority={effectivePriority}
                        disabled={!hasCredentials}
                        disabledReason='Add the required credentials (environment variables) to configure this provider.'
                      />
                      <ProviderToggle
                        providerName={meta.name}
                        enabled={isToggledOn}
                        hasCredentials={hasCredentials}
                      />
                    </div>
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
      <Suspense fallback={<LoadingSkeleton />}>
        <EngineStatusCard />
      </Suspense>
    </div>
  );
}
