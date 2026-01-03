import type { Metadata } from 'next';

import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <div className='flex w-full items-center justify-center py-8'>
      <div className='w-full max-w-sm'>
        <LoginForm />
      </div>
    </div>
  );
}
