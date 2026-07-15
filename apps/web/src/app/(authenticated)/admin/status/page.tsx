import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from '@scilent-one/ui';
import {
  Activity,
  Boxes,
  CheckCircle2,
  Clock3,
  Database,
  Fingerprint,
  KeyRound,
  Music2,
  Server,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import type { Metadata } from 'next';

import { collectAdminStatus, type AdminStatus } from '@/lib/admin-status';

export const metadata: Metadata = {
  title: 'System Status',
};

export const dynamic = 'force-dynamic';

type StatusTone = 'healthy' | 'warning' | 'error' | 'neutral';

const STATUS_STYLES: Record<StatusTone, string> = {
  healthy:
    'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  warning:
    'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  error: 'border-destructive/20 bg-destructive/10 text-destructive',
  neutral: 'border-border bg-muted text-muted-foreground',
};

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <Badge
      variant='outline'
      className={cn('rounded-full px-2.5 py-1', STATUS_STYLES[tone])}
    >
      {tone === 'healthy' ? (
        <CheckCircle2 className='mr-1 size-3.5' />
      ) : tone === 'error' ? (
        <TriangleAlert className='mr-1 size-3.5' />
      ) : null}
      {label}
    </Badge>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className='min-w-0 rounded-lg border bg-background/60 p-3'>
      <dt className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
        {label}
      </dt>
      <dd
        className={cn('mt-1 truncate text-sm font-medium', mono && 'font-mono')}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function databaseTone(status: AdminStatus['database']['status']): StatusTone {
  if (status === 'connected') return 'healthy';
  if (status === 'not configured' || status === 'timeout') return 'warning';
  return 'error';
}

function harmonyTone(status: AdminStatus['harmony']['status']): StatusTone {
  if (status === 'online') return 'healthy';
  if (status === 'offline' || status === 'timeout') return 'warning';
  return 'error';
}

export default async function AdminStatusPage() {
  const status = await collectAdminStatus();
  const databaseHealthy = status.database.status === 'connected';
  const harmonyHealthy = status.harmony.status === 'online';
  const overallHealthy = databaseHealthy && harmonyHealthy;
  const updatedAt = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(status.application.timestamp));

  return (
    <main className='w-full space-y-6 pb-8'>
      <section className='relative overflow-hidden rounded-2xl border bg-linear-to-br from-card via-card to-primary/5 p-6 shadow-sm'>
        <div className='absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl' />
        <div className='relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
          <div className='space-y-3'>
            <div className='flex size-11 items-center justify-center rounded-xl border bg-background shadow-sm'>
              <Activity className='size-5 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                System status
              </h1>
              <p className='mt-1 max-w-2xl text-sm text-muted-foreground'>
                A read-only view of this deployment, core services, and
                server-side configuration.
              </p>
            </div>
          </div>
          <StatusBadge
            label={overallHealthy ? 'Operational' : 'Attention needed'}
            tone={overallHealthy ? 'healthy' : 'warning'}
          />
        </div>
      </section>

      <section className='grid gap-6 xl:grid-cols-2'>
        <Card className='overflow-hidden'>
          <CardHeader className='border-b bg-muted/20'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex gap-3'>
                <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10'>
                  <Server className='size-4 text-primary' />
                </div>
                <div>
                  <CardTitle>Application</CardTitle>
                  <CardDescription>Build and runtime identity</CardDescription>
                </div>
              </div>
              <StatusBadge
                label={status.application.environment}
                tone='neutral'
              />
            </div>
          </CardHeader>
          <CardContent className='pt-6'>
            <dl className='grid gap-3 sm:grid-cols-2'>
              <Detail
                label='Application version'
                value={`v${status.application.version}`}
                mono
              />
              <Detail
                label={`Last ${status.application.timestampSource}`}
                value={`${updatedAt} UTC`}
              />
              <Detail
                label='Commit'
                value={status.application.commit ?? 'Local build'}
                mono
              />
              <Detail
                label='Region'
                value={status.application.region ?? 'Local / unspecified'}
                mono
              />
            </dl>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader className='border-b bg-muted/20'>
            <div className='flex gap-3'>
              <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10'>
                <Boxes className='size-4 text-primary' />
              </div>
              <div>
                <CardTitle>Versions</CardTitle>
                <CardDescription>
                  Runtime and workspace packages
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='grid gap-x-6 gap-y-3 sm:grid-cols-2'>
              {status.packages.map((item) => (
                <div
                  key={item.name}
                  className='flex items-center justify-between gap-3 border-b py-2 last:border-0'
                >
                  <span className='truncate text-sm text-muted-foreground'>
                    {item.name}
                  </span>
                  <code className='rounded bg-muted px-2 py-0.5 text-xs'>
                    {item.version}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader className='border-b bg-muted/20'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex gap-3'>
                <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10'>
                  <Database className='size-4 text-primary' />
                </div>
                <div>
                  <CardTitle>Database</CardTitle>
                  <CardDescription>{status.database.message}</CardDescription>
                </div>
              </div>
              <StatusBadge
                label={status.database.status}
                tone={databaseTone(status.database.status)}
              />
            </div>
          </CardHeader>
          <CardContent className='pt-6'>
            <dl className='grid gap-3 sm:grid-cols-2'>
              <Detail label='Host' value={status.database.host} mono />
              <Detail label='Port' value={status.database.port} mono />
              <Detail
                label='Database environment'
                value={status.database.environment}
              />
              <Detail
                label='Query latency'
                value={
                  status.database.latencyMs === null
                    ? 'Unavailable'
                    : `${status.database.latencyMs} ms`
                }
                mono
              />
            </dl>
            <p className='mt-4 flex items-center gap-2 text-xs text-muted-foreground'>
              <ShieldCheck className='size-3.5' />
              Credentials, database names, and connection URLs are never
              returned.
            </p>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader className='border-b bg-muted/20'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex gap-3'>
                <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10'>
                  <Music2 className='size-4 text-primary' />
                </div>
                <div>
                  <CardTitle>Harmony engine</CardTitle>
                  <CardDescription>{status.harmony.message}</CardDescription>
                </div>
              </div>
              <StatusBadge
                label={status.harmony.status}
                tone={harmonyTone(status.harmony.status)}
              />
            </div>
          </CardHeader>
          <CardContent className='space-y-4 pt-6'>
            <div className='flex flex-wrap gap-2'>
              {status.harmony.enabledProviders.length > 0 ? (
                status.harmony.enabledProviders.map((provider) => (
                  <Badge
                    key={provider.name}
                    variant='secondary'
                    className='rounded-full'
                  >
                    {provider.displayName}
                    <span className='ml-1 text-muted-foreground'>
                      · P{provider.priority}
                    </span>
                  </Badge>
                ))
              ) : (
                <span className='text-sm text-muted-foreground'>
                  No enabled providers
                </span>
              )}
            </div>
            <div className='rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground'>
              Configuration status only. This page does not contact external
              metadata providers.
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className='overflow-hidden'>
        <CardHeader className='border-b bg-muted/20'>
          <div className='flex gap-3'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10'>
              <KeyRound className='size-4 text-primary' />
            </div>
            <div>
              <CardTitle>Authentication providers</CardTitle>
              <CardDescription>
                Provider names and configuration state only
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-2'>
          <div className='divide-y'>
            {status.authProviders.map((provider) => (
              <div
                key={provider.name}
                className='flex items-center justify-between gap-4 py-4'
              >
                <div className='flex min-w-0 items-center gap-3'>
                  <Fingerprint className='size-4 shrink-0 text-muted-foreground' />
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium'>
                      {provider.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {provider.purpose}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  label={provider.configured ? 'Configured' : 'Not configured'}
                  tone={provider.configured ? 'healthy' : 'neutral'}
                />
              </div>
            ))}
          </div>
          <p className='flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground'>
            <Clock3 className='size-3.5' />
            Secrets, tokens, client IDs, and redirect URLs are intentionally
            omitted.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
