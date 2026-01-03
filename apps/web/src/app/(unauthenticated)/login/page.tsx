import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className='flex w-full items-center justify-center py-8'>
      <div className='w-full max-w-sm'>
        <LoginForm />
      </div>
    </div>
  );
}
