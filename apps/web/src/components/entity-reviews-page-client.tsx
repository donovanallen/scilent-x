'use client';

import { ReviewCard } from '@scilent-one/scilent-ui';
import { useInfiniteScroll } from '@scilent-one/ui';
import { useTransitionRouter } from 'next-view-transitions';
import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';

import { fetcher } from '@/lib/swr';

interface ReviewsPageItem {
  id: string;
  content: string;
  contentHtml?: string | null;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    image: string | null;
  };
  createdAt: string;
  _count?: { likes: number; comments: number; reposts: number };
  isLiked?: boolean;
  isReposted?: boolean;
  reviewSubject?: {
    type: 'RELEASE' | 'TRACK';
    title: string;
    artistLabel: string | null;
    artworkUrl: string | null;
    releaseDate: string | null;
    gtin: string | null;
    isrc: string | null;
  };
}

interface ReviewsPageResponse {
  items: ReviewsPageItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface EntityReviewsPageClientProps {
  queryKey: string;
  title: string;
}

export function EntityReviewsPageClient({
  queryKey,
  title,
}: EntityReviewsPageClientProps) {
  const router = useTransitionRouter();

  const getKey = (
    pageIndex: number,
    previousPageData: ReviewsPageResponse | null
  ) => {
    if (pageIndex === 0) return queryKey;
    if (!previousPageData?.hasMore || !previousPageData.nextCursor) return null;
    return `${queryKey}&cursor=${encodeURIComponent(previousPageData.nextCursor)}`;
  };

  const { data, isLoading, isValidating, setSize } =
    useSWRInfinite<ReviewsPageResponse>(getKey, fetcher);
  const reviews = useMemo(
    () => data?.flatMap((page) => page.items) ?? [],
    [data]
  );
  const lastPage = data?.[data.length - 1];
  const hasMore = lastPage?.hasMore ?? false;

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: isLoading || isValidating,
    onLoadMore: () => setSize((size) => size + 1),
  });

  return (
    <div className='mx-auto w-full max-w-2xl p-4'>
      <h1 className='mb-4 text-2xl font-semibold'>{title}</h1>
      <div className='space-y-4'>
        {reviews.map((review) =>
          review.reviewSubject ? (
            <ReviewCard
              key={review.id}
              id={review.id}
              content={review.content}
              {...(review.contentHtml != null
                ? { contentHtml: review.contentHtml }
                : {})}
              author={review.author}
              createdAt={review.createdAt}
              likesCount={review._count?.likes ?? 0}
              commentsCount={review._count?.comments ?? 0}
              repostsCount={review._count?.reposts ?? 0}
              {...(review.isLiked != null ? { isLiked: review.isLiked } : {})}
              {...(review.isReposted != null
                ? { isReposted: review.isReposted }
                : {})}
              reviewSubject={review.reviewSubject}
              onClick={() => router.push(`/post/${review.id}`)}
            />
          ) : null
        )}
        {!isLoading && reviews.length === 0 ? (
          <p className='text-muted-foreground text-center py-8'>
            No reviews yet
          </p>
        ) : null}
      </div>
      <div ref={sentinelRef} />
    </div>
  );
}
