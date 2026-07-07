import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileText, Inbox, Search, Users, FolderOpen, ImageOff } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '../empty';
import { Button } from '../button';

const meta: Meta<typeof Empty> = {
  title: 'Components/Empty',
  component: Empty,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Empty>;

export const Default: Story = {
  render: () => (
    <Empty className="w-[400px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No items yet</EmptyTitle>
        <EmptyDescription>
          Get started by creating your first item.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Create Item</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const NoSearchResults: Story = {
  render: () => (
    <Empty className="w-[400px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          We couldn't find anything matching your search. Try adjusting your
          filters or search terms.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">Clear filters</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const EmptyFolder: Story = {
  render: () => (
    <Empty className="w-[400px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>This folder is empty</EmptyTitle>
        <EmptyDescription>
          Upload files or create new folders to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>Upload files</Button>
          <Button variant="outline">New folder</Button>
        </div>
      </EmptyContent>
    </Empty>
  ),
};

export const NoUsers: Story = {
  render: () => (
    <Empty className="w-[400px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No team members</EmptyTitle>
        <EmptyDescription>
          Invite your team members to collaborate on this project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Invite members</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const NoPosts: Story = {
  render: () => (
    <Empty className="w-[400px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No posts yet</EmptyTitle>
        <EmptyDescription>
          Be the first to share something with your followers.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Create post</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const NoImage: Story = {
  render: () => (
    <Empty className="w-[400px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ImageOff aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No image available</EmptyTitle>
        <EmptyDescription>
          This item doesn't have an image yet.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const MinimalStyle: Story = {
  render: () => (
    <Empty className="w-[300px]">
      <EmptyHeader>
        <EmptyTitle>Nothing here</EmptyTitle>
        <EmptyDescription>
          This section is empty.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const WithLink: Story = {
  render: () => (
    <Empty className="w-[400px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Your inbox is empty</EmptyTitle>
        <EmptyDescription>
          New messages will appear here.{' '}
          <a href="#settings">Manage your notification settings</a>.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const LargeMedia: Story = {
  render: () => (
    <Empty className="w-[400px] border">
      <EmptyHeader>
        <EmptyMedia>
          <Inbox className="size-16 text-muted-foreground" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No messages</EmptyTitle>
        <EmptyDescription>
          When you receive messages, they will appear here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Compose message</Button>
      </EmptyContent>
    </Empty>
  ),
};
