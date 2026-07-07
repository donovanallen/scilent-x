import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarDays } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';

const meta: Meta<typeof HoverCard> = {
  title: 'Components/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className="p-0 h-auto">
          @nextjs
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" alt="Vercel" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">
              The React Framework – created and maintained by @vercel.
            </p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{' '}
              <span className="text-xs text-muted-foreground">
                Joined December 2021
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer text-primary hover:underline">
          John Doe
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">John Doe</h4>
            <p className="text-sm text-muted-foreground">@johndoe</p>
            <p className="text-sm">
              Full-stack developer passionate about building great user
              experiences.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">1,234</strong> following
              </span>
              <span>
                <strong className="text-foreground">5,678</strong> followers
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const ProductPreview: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className="p-0 h-auto">
          Premium Plan
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Premium Plan</h4>
          <p className="text-2xl font-bold">
            $29<span className="text-sm font-normal">/month</span>
          </p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>Unlimited projects</li>
            <li>Priority support</li>
            <li>Advanced analytics</li>
            <li>Custom integrations</li>
          </ul>
          <Button className="w-full mt-4" size="sm">
            Upgrade Now
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const InParagraph: Story = {
  render: () => (
    <p className="text-sm max-w-md">
      Check out the latest updates from{' '}
      <HoverCard>
        <HoverCardTrigger asChild>
          <span className="cursor-pointer text-primary hover:underline">
            @shadcn
          </span>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">shadcn</h4>
              <p className="text-sm text-muted-foreground">
                Building shadcn/ui and other open source projects.
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{' '}
      about the new component library features.
    </p>
  ),
};
