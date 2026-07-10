'use client';

import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@scilent-one/ui';
import { Link } from 'next-view-transitions';
import { useState } from 'react';

import { EntityReviewsPageClient } from '@/components/entity-reviews-page-client';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'recent' | 'trending'>('recent');

  return (
    <div className='flex flex-col h-full min-h-0 space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'recent' | 'trending')}
      >
        <div className='flex items-center gap-3'>
          <TabsList className='grid flex-1 grid-cols-2'>
            <TabsTrigger value='recent'>Recent</TabsTrigger>
            <TabsTrigger value='trending'>Trending</TabsTrigger>
          </TabsList>
          <Button asChild variant='outline' size='sm' className='shrink-0'>
            <Link href='/reviews/new'>Write review</Link>
          </Button>
        </div>

        <TabsContent value='recent' className='mt-6'>
          <EntityReviewsPageClient
            queryKey='/api/v1/reviews'
            className='mx-auto w-full max-w-2xl'
            emptyMessage='No reviews yet'
          />
        </TabsContent>

        <TabsContent value='trending' className='mt-6'>
          <EntityReviewsPageClient
            queryKey='/api/v1/reviews?trending=true'
            className='mx-auto w-full max-w-2xl'
            emptyMessage='No trending reviews yet'
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
