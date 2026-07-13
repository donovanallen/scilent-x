import type {
  HarmonizedRelease,
  HarmonizedTrack,
} from '@scilent-one/harmony-engine';
import { Suspense } from 'react';

import { resolveReviewSubject } from '@/lib/review-subject';

import { NewReviewPageClient } from './_components/new-review-page-client';

export const metadata = {
  title: 'Write a review',
  description: 'Share your thoughts on an album or track',
};

interface NewReviewPageProps {
  searchParams: Promise<{
    url?: string;
    gtin?: string;
    isrc?: string;
    type?: 'RELEASE' | 'TRACK';
  }>;
}

async function NewReviewContent({
  searchParams,
}: {
  searchParams: NewReviewPageProps['searchParams'];
}) {
  const params = await searchParams;
  const hasPrefill = Boolean(params.url || params.gtin || params.isrc);

  if (!hasPrefill) {
    return <NewReviewPageClient />;
  }

  try {
    const resolved = await resolveReviewSubject({
      ...(params.url ? { url: params.url } : {}),
      ...(params.gtin ? { gtin: params.gtin } : {}),
      ...(params.isrc ? { isrc: params.isrc } : {}),
      ...(params.type ? { type: params.type } : {}),
    });

    return (
      <NewReviewPageClient
        initialSubject={{
          type: resolved.type,
          ...(resolved.gtin ? { gtin: resolved.gtin } : {}),
          ...(resolved.isrc ? { isrc: resolved.isrc } : {}),
          title: resolved.title,
          artistLabel: resolved.artistLabel,
          ...(resolved.artworkUrl ? { artworkUrl: resolved.artworkUrl } : {}),
          snapshot: resolved.snapshot as HarmonizedRelease | HarmonizedTrack,
        }}
      />
    );
  } catch {
    return (
      <div className='mx-auto max-w-2xl p-4 md:max-w-4xl'>
        <p className='text-destructive mb-4'>
          Could not load the music for this review. Try searching manually.
        </p>
        <NewReviewPageClient />
      </div>
    );
  }
}

export default function NewReviewPage({ searchParams }: NewReviewPageProps) {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center p-8 text-muted-foreground'>
          Loading…
        </div>
      }
    >
      <NewReviewContent searchParams={searchParams} />
    </Suspense>
  );
}
