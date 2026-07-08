import { EntityReviewsPageClient } from '@/components/entity-reviews-page-client';

export const metadata = {
  title: 'Track reviews',
};

interface TrackReviewsPageProps {
  params: Promise<{ isrc: string }>;
}

export default async function TrackReviewsPage({
  params,
}: TrackReviewsPageProps) {
  const { isrc } = await params;

  return (
    <EntityReviewsPageClient
      queryKey={`/api/v1/reviews?isrc=${encodeURIComponent(isrc)}`}
      title='Track reviews'
    />
  );
}
