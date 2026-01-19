import { Spinner } from '@scilent-one/ui';

export default function Loading() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex items-center gap-3 text-muted-foreground'>
        <Spinner className='size-5' />
        <span className='text-sm font-medium'>Loading...</span>
      </div>
    </div>
  );
}
