'use client';

import { use } from 'react';

import { PostDetailPageClient } from '@/components/post-detail-page-client';

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <PostDetailPageClient id={id} mode='review' />;
}
