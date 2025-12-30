import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className='size-full flex items-center justify-center gap-2 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60'>
      <Loader2 className='size-4 animate-spin' />
      <p className='text-foreground'>Loading...</p>
    </div>
  );
}
