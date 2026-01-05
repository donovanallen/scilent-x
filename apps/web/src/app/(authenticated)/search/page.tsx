import { Suspense } from 'react';

import { getEnabledProviders } from './actions';
import { SearchContainer } from './search-container';

export const metadata = {
  title: 'Search',
  description: 'Search for music releases, artists, and tracks',
};

async function SearchPageContent() {
  const providers = await getEnabledProviders();

  return <SearchContainer providers={providers} />;
}

export default function SearchPage() {
  return (
    <div className='flex flex-col h-full min-h-0'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Search</h1>
        <p className='text-muted-foreground mt-1'>
          Search for music across all connected providers
        </p>
      </div>
      <Suspense
        fallback={
          <div className='flex-1 flex items-center justify-center'>
            <div className='animate-pulse text-muted-foreground'>
              Loading search...
            </div>
          </div>
        }
      >
        <SearchPageContent />
      </Suspense>
    </div>
  );
}
