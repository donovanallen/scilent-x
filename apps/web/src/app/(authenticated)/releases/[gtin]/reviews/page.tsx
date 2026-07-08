import { EntityReviewsPageClient } from '@/components/entity-reviews-page-client';

export const metadata = {
  title: 'Album reviews',
};

interface ReleaseReviewsPageProps {
  params: Promise<{ gtin: string }>;
}

export default async function ReleaseReviewsPage({
  params,
}: ReleaseReviewsPageProps) {
  const { gtin } = await params;

  return (
    <EntityReviewsPageClient
      queryKey={`/api/v1/reviews?gtin=${encodeURIComponent(gtin)}`}
      title='Album reviews'
    />
  );
}
