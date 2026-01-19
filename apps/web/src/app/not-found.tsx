import {
  Button,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@scilent-one/ui';
import { FileQuestion, Home } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: 'noindex',
};

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center p-6'>
      <Empty className='border-0'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <FileQuestion />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you are looking for doesn&apos;t exist or has been moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href='/'>
              <Home />
              Back to home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
