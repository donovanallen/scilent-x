import Content from '@docs/DATABASE.mdx';
import { Button } from '@scilent-one/ui';
import Link from 'next/link';

export default function SetupPage() {
  return (
    <div className='max-w-4xl py-10'>
      <div className='mb-8'>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/db' className='text-muted-foreground'>
            ← Back to Database
          </Link>
        </Button>
      </div>

      <article className='prose-custom'>
        <Content />
      </article>
    </div>
  );
}
