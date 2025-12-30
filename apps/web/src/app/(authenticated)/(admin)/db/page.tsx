import { Suspense } from 'react';
import Link from 'next/link';
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
import {
  getDbStatus,
  getDbMetadata,
  getDbTables,
  getTableCounts,
} from './actions';

function StatusBadge({
  status,
}: {
  status: 'connected' | 'error' | 'not_configured';
}) {
  const variants = {
    connected: {
      label: 'Connected',
      className:
        'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20',
    },
    error: {
      label: 'Error',
      className:
        'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20',
    },
    not_configured: {
      label: 'Not Configured',
      className:
        'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
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
          {tables.map((table) => (
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
    <div className='w-full py-10 space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Database</h1>
          <p className='text-muted-foreground mt-1'>
            Monitor and manage your database connection
          </p>
        </div>
        <div className='flex items-center gap-2'>
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
            <DbTablesCard />
          </Suspense>
        </div>
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
