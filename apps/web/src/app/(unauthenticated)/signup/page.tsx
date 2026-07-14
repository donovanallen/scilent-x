import type { Metadata } from 'next';
import { Suspense } from 'react';

import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Signup',
};

export default function SignupPage() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='w-full max-w-md'>
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
