'use client';

import {
  ReviewComposer,
  type SelectedMusicSubject,
} from '@scilent-one/scilent-ui';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import { fetcher } from '@/lib/swr';
import { useMentionSearch } from '@/lib/use-mention-search';

interface CurrentUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  avatarUrl: string | null;
}

interface NewReviewPageClientProps {
  initialSubject?: SelectedMusicSubject;
}

export function NewReviewPageClient({
  initialSubject,
}: NewReviewPageClientProps) {
  const router = useTransitionRouter();
  const { searchUsers, searchArtists } = useMentionSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useSWR<CurrentUser>(
    '/api/v1/users/me',
    fetcher
  );

  const handleSubmit = async (
    content: string,
    contentHtml: string,
    subject: SelectedMusicSubject
  ) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentHtml,
          subject: {
            type: subject.type,
            gtin: subject.gtin,
            isrc: subject.isrc,
            snapshot: subject.snapshot,
            artworkUrl: subject.artworkUrl,
          },
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? 'Failed to publish review');
      }

      const review = (await response.json()) as { id: string };
      toast.success('Review published');
      router.push(`/post/${review.id}`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to publish review'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='mx-auto w-full max-w-2xl p-4'>
      <h1 className='mb-4 text-2xl font-semibold'>Write a review</h1>
      <ReviewComposer
        {...(currentUser ? { user: currentUser } : {})}
        {...(initialSubject ? { initialSubject } : {})}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onMentionQuery={searchUsers}
        onArtistMentionQuery={searchArtists}
      />
    </div>
  );
}
