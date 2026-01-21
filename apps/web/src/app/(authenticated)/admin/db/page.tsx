import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  cn,
} from '@scilent-one/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import {
  getDbStatus,
  getDbMetadata,
  getDbTables,
  getTableCounts,
  getAuthProviders,
  type AuthProviderInfo,
} from './actions';

export const metadata: Metadata = {
  title: 'Database',
};

function StatusBadge({
  status,
}: {
  status: 'connected' | 'error' | 'not_configured';
}) {
  const variants = {
    connected: {
      label: 'Connected',
      className: 'bg-success/15 text-success-dark border-success/20',
    },
    error: {
      label: 'Error',
      className: 'bg-destructive/15 text-destructive border-destructive/20',
    },
    not_configured: {
      label: 'Not Configured',
      className: 'bg-warning/15 text-warning border-warning/20',
    },
  };

  const variant = variants[status];

  return (
    <Badge
      variant='outline'
      className={cn(variant.className, 'rounded-full px-2 py-1')}
    >
      {variant.label}
    </Badge>
  );
}

async function DbStatusCard() {
  const status = await getDbStatus();

  return (
    <Card>
      <CardHeader className='flex justify-between'>
        <div className='flex items-center gap-2 md:justify-between'>
          <CardTitle>Connection Status</CardTitle>
          <StatusBadge status={status.status} />
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{status.message}</CardDescription>
        {status.latencyMs !== undefined && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span>Latency:</span>
            <span className='font-mono'>{status.latencyMs}ms</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function DbMetadataCard() {
  const metadata = await getDbMetadata();

  const fields = [
    { label: 'Provider', value: metadata.provider },
    { label: 'Host', value: metadata.host },
    { label: 'Port', value: metadata.port },
    { label: 'Database', value: metadata.database },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Metadata</CardTitle>
        <CardDescription>
          Connection details (credentials hidden)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className='grid grid-cols-2 gap-4 text-sm'>
          {fields.map((field) => (
            <div key={field.label}>
              <dt className='text-muted-foreground'>{field.label}</dt>
              <dd className='font-mono mt-1'>{field.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

async function DbTablesCard() {
  const [tables, counts] = await Promise.all([getDbTables(), getTableCounts()]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Tables</CardTitle>
        <CardDescription>Available tables from Prisma schema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {tables
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map((table) => (
              <div
                key={table.name}
                className='flex items-center justify-between py-2 px-3 rounded-md bg-muted/50'
              >
                <div>
                  <span className='font-medium'>{table.displayName}</span>
                  <span className='text-muted-foreground text-sm ml-2'>
                    ({table.name})
                  </span>
                </div>
                {counts[table.name] !== null && (
                  <Badge
                    variant='secondary'
                    className='font-mono rounded-full px-2 py-1'
                  >
                    {counts[table.name]} rows
                  </Badge>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProviderTypeBadge({ type }: { type: AuthProviderInfo['type'] }) {
  const variants = {
    email: {
      label: 'Email',
      className:
        'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
    },
    social: {
      label: 'Social',
      className:
        'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20',
    },
    oauth: {
      label: 'OAuth',
      className:
        'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20',
    },
  };

  const variant = variants[type];

  return (
    <Badge
      variant='outline'
      className={cn(variant.className, 'text-xs px-1.5 py-0.5')}
    >
      {variant.label}
    </Badge>
  );
}

async function AuthProvidersCard() {
  const providers = await getAuthProviders();
  const configuredCount = providers.filter((p) => p.configured).length;

  // Sort providers so configured ones appear first
  const sortedProviders = [...providers].sort((a, b) => {
    if (a.configured === b.configured) return 0;
    return a.configured ? -1 : 1;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth Providers</CardTitle>
        <CardDescription>
          {configuredCount} of {providers.length} providers configured
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {sortedProviders.map((provider) => (
            <div
              key={provider.id}
              className={cn(
                'flex items-center justify-between py-2 px-3 rounded-md',
                provider.configured ? 'bg-muted/50' : 'bg-muted/20 opacity-60'
              )}
            >
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'font-medium',
                    !provider.configured && 'text-muted-foreground'
                  )}
                >
                  {provider.name}
                </span>
                <ProviderTypeBadge type={provider.type} />
              </div>
              <Badge
                variant={provider.configured ? 'default' : 'secondary'}
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  provider.configured
                    ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20'
                    : ''
                )}
              >
                {provider.configured ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <div className='h-6 w-32 bg-muted animate-pulse rounded' />
        <div className='h-4 w-48 bg-muted animate-pulse rounded mt-2' />
      </CardHeader>
      <CardContent>
        <div className='h-20 bg-muted animate-pulse rounded' />
      </CardContent>
    </Card>
  );
}

export default function DatabasePage() {
  return (
    <div className='w-full flex flex-col h-full min-h-0 space-y-6'>
      <div className='flex items-center justify-end gap-2'>
        <Button variant='outline' asChild>
          <a
            href='http://localhost:5555'
            target='_blank'
            rel='noopener noreferrer'
          >
            Prisma Studio
          </a>
        </Button>
        <Button asChild>
          <Link href='/db/setup'>Setup Guide</Link>
        </Button>
      </div>

      <div className='grid gap-6'>
        <Suspense fallback={<LoadingCard />}>
          <DbStatusCard />
        </Suspense>

        <div className='grid gap-6 md:grid-cols-2'>
          <Suspense fallback={<LoadingCard />}>
            <DbMetadataCard />
          </Suspense>

          <Suspense fallback={<LoadingCard />}>
            <AuthProvidersCard />
          </Suspense>
        </div>

        <Suspense fallback={<LoadingCard />}>
          <DbTablesCard />
        </Suspense>
      </div>

      <Card className='border-dashed'>
        <CardHeader>
          <CardTitle className='text-lg'>Quick Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3 font-mono text-sm'>
            <div className='flex items-start gap-3'>
              <span className='text-muted-foreground shrink-0'>Generate:</span>
              <code className='bg-muted px-2 py-1 rounded'>
                pnpm --filter @scilent-one/db db:generate
              </code>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-muted-foreground shrink-0'>Push:</span>
              <code className='bg-muted px-2 py-1 rounded'>
                pnpm --filter @scilent-one/db db:push
              </code>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-muted-foreground shrink-0'>Migrate:</span>
              <code className='bg-muted px-2 py-1 rounded'>
                pnpm --filter @scilent-one/db db:migrate
              </code>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-muted-foreground shrink-0'>Studio:</span>
              <code className='bg-muted px-2 py-1 rounded'>
                pnpm --filter @scilent-one/db db:studio
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
