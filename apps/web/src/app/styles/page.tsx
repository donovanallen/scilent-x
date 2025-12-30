import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Switch,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@scilent-one/ui';

export default function StylesPage() {
  return (
    <div className='container mx-auto max-w-4xl py-10 space-y-8'>
      <h1 className='text-3xl font-bold'>Styles</h1>

      <Card>
        <CardHeader>
          <CardTitle>Colors & Tokens</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-2 gap-4'>
          <div className='rounded-lg border bg-background p-4 text-foreground'>
            background / foreground
          </div>
          <div className='rounded-lg border bg-card p-4 text-card-foreground'>
            card / card-foreground
          </div>
          <div className='rounded-lg border bg-muted p-4 text-muted-foreground'>
            muted / muted-foreground
          </div>
          <div className='rounded-lg border bg-primary p-4 text-primary-foreground'>
            primary / primary-foreground
          </div>
          <div className='rounded-lg border bg-secondary p-4 text-secondary-foreground'>
            secondary / secondary-foreground
          </div>
          <div className='rounded-lg border bg-accent p-4 text-accent-foreground'>
            accent / accent-foreground
          </div>
          <div className='rounded-lg border bg-destructive p-4 text-destructive-foreground'>
            destructive / destructive-foreground
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography & Inputs</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>Muted foreground text</p>
          <Input placeholder='Input' />
          <div className='flex items-center gap-2'>
            <Switch id='demo-switch' />
            <label htmlFor='demo-switch' className='text-sm'>
              Switch
            </label>
          </div>
          <div className='space-x-2'>
            <Badge>Default</Badge>
            <Badge variant='secondary'>Secondary</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='one'>
        <TabsList>
          <TabsTrigger value='one'>One</TabsTrigger>
          <TabsTrigger value='two'>Two</TabsTrigger>
        </TabsList>
        <TabsContent value='one'>Tab One</TabsContent>
        <TabsContent value='two'>Tab Two</TabsContent>
      </Tabs>
    </div>
  );
}
