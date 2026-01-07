// apps/web/src/app/(authenticated)/(admin)/harmonization/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@scilent-one/ui';
import { Suspense } from 'react';

import { getEngineStatus } from '../actions';

import { HarmonizationTestForm } from './test-form'; // Client component for interactivity

export const metadata = {
  title: 'Harmonization Engine',
};

async function EngineStatusCard() {
  const status = await getEngineStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engine Status</CardTitle>
        <CardDescription>Enabled metadata providers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {status.enabledProviders.map((provider) => (
            <div
              key={provider.name}
              className='flex justify-between items-center py-2 px-3 bg-muted/50 rounded-md'
            >
              <span className='font-medium'>{provider.displayName}</span>
              <span className='text-sm text-muted-foreground'>
                Priority: {provider.priority}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HarmonizationPage() {
  return (
    <div className='w-full py-10 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold'>Harmonization Engine</h1>
        <p className='text-muted-foreground mt-1'>
          Test music metadata lookups and search
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <EngineStatusCard />
      </Suspense>

      <HarmonizationTestForm />
    </div>
  );
}
