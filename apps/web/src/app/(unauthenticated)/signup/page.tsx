import { SignupForm } from './signup-form';

export default function SignupPage() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='w-full max-w-md'>
        <SignupForm />
      </div>
    </div>
  );
}
