import { Card, CardContent } from '@scilent-one/ui';

export default function Home() {
  return (
    <div className='container mx-auto py-16 px-6'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-foreground mb-4'>Scilent One</h1>
        <p className='text-xl text-muted-foreground mb-8'>
          Digital Project Template
        </p>
        <Card className='inline-flex items-center px-6 py-3 bg-accent rounded-lg shadow-lg font-mono'>
          <CardContent>
            <span className='text-green-500 mr-2'>✓</span>
            <span className='text-muted-foreground'>
              Next.js + React + TypeScript + Tailwind CSS + Turborepo + Prisma
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
