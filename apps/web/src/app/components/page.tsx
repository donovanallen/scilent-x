'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Toaster,
} from '@scilent-one/ui';
import { toast } from 'sonner';

export default function ComponentsPage() {
  return (
    <div className='container mx-auto max-w-4xl py-10 space-y-8'>
      <h1 className='text-3xl font-bold'>Components</h1>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className='space-x-2'>
          <Button onClick={() => toast('Hello from Sonner!')}>Default</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='destructive'>Destructive</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dialog</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Example Dialog</DialogTitle>
              </DialogHeader>
              This is a dialog content.
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Toaster richColors closeButton />
    </div>
  );
}
