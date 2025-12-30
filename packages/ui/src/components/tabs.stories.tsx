import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Button } from './button';
import { Input } from './input';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'The default selected tab value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-muted-foreground">
          Make changes to your account here.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-muted-foreground">
          Change your password here.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithCards: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Account</h3>
            <p className="text-sm text-muted-foreground">
              Make changes to your account here. Click save when you're done.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input id="username" defaultValue="@johndoe" />
            </div>
          </div>
          <Button>Save changes</Button>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Password</h3>
            <p className="text-sm text-muted-foreground">
              Change your password here. After saving, you'll be logged out.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="current" className="text-sm font-medium">
                Current password
              </label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-2">
              <label htmlFor="new" className="text-sm font-medium">
                New password
              </label>
              <Input id="new" type="password" />
            </div>
          </div>
          <Button>Save password</Button>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const ThreeTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4">
        <h3 className="text-lg font-medium">Overview</h3>
        <p className="text-sm text-muted-foreground mt-2">
          View your dashboard overview and key metrics.
        </p>
      </TabsContent>
      <TabsContent value="analytics" className="p-4">
        <h3 className="text-lg font-medium">Analytics</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Detailed analytics and insights about your data.
        </p>
      </TabsContent>
      <TabsContent value="reports" className="p-4">
        <h3 className="text-lg font-medium">Reports</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Generate and download reports.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="another">Another</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <p className="text-sm text-muted-foreground">This tab is active.</p>
      </TabsContent>
      <TabsContent value="disabled">
        <p className="text-sm text-muted-foreground">
          This content won't be reachable.
        </p>
      </TabsContent>
      <TabsContent value="another">
        <p className="text-sm text-muted-foreground">Another tab content.</p>
      </TabsContent>
    </Tabs>
  ),
};
