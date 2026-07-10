import { Suspense } from 'react';

import { getEnabledProviders } from '../search/actions';

import { ArtistsContainer } from './_components/artists-container';

export const metadata = {
  title: 'My Artists',
  description:
    'Your followed and library artists across connected music providers',
};

async function ArtistsPageContent() {
  const providers = await getEnabledProviders();

  return <ArtistsContainer providers={providers} />;
}

export default function ArtistsPage() {
  return (
    <div className='flex flex-col h-full min-h-0'>
      <Suspense
        fallback={
          <div className='flex-1 flex items-center justify-center'>
            <div className='animate-pulse text-muted-foreground'>
              Loading artists...
            </div>
          </div>
        }
      >
        <ArtistsPageContent />
      </Suspense>
    </div>
  );
}
