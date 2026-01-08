import { Suspense } from 'react';

import { SearchContainer } from './_components/search-container';
import { getEnabledProviders } from './actions';

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
        <h2>Search</h2>
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
