import type { Metadata } from 'next';

import { LookupForm } from './_components';

export const metadata: Metadata = {
  title: 'Lookup',
};

export default function LookupPage() {
  return (
    <div className='w-full flex flex-col h-full min-h-0 space-y-6'>
      <LookupForm />
    </div>
  );
}
