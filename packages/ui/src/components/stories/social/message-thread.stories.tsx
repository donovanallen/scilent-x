import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageThread } from '../../social/message-thread';

const meta: Meta<typeof MessageThread> = {
  title: 'Social/MessageThread',
  component: MessageThread,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MessageThread>;

const sender = {
  name: 'Jane Smith',
  username: 'janesmith',
  avatarUrl: null,
  image: null,
};

const messages = [
  {
    id: '1',
    content: 'Hey, are you going to the show this weekend?',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    senderId: 'user-2',
    sender,
  },
  {
    id: '2',
    content: 'Which one?',
    createdAt: new Date(Date.now() - 9 * 60 * 1000),
    senderId: 'user-2',
    sender,
  },
  {
    id: '3',
    content: "Yeah, I'll be there! Let's meet up beforehand.",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    senderId: 'user-1',
    sender: undefined,
  },
  {
    id: '4',
    content: 'Sounds good, see you then',
    createdAt: new Date(Date.now() - 4 * 60 * 1000),
    senderId: 'user-2',
    sender,
  },
];

export const Default: Story = {
  args: {
    messages,
    currentUserId: 'user-1',
  },
  render: (args) => (
    <div className="w-[420px] h-[400px] rounded-lg border overflow-y-auto">
      <MessageThread {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    messages: [],
    currentUserId: 'user-1',
  },
  render: (args) => (
    <div className="w-[420px] h-[300px] rounded-lg border flex items-center">
      <MessageThread {...args} />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    messages: [],
    currentUserId: 'user-1',
    isLoading: true,
  },
  render: (args) => (
    <div className="w-[420px] h-[300px] rounded-lg border overflow-y-auto">
      <MessageThread {...args} />
    </div>
  ),
};

export const LoadingOlderMessages: Story = {
  args: {
    messages,
    currentUserId: 'user-1',
    isLoading: true,
    hasMore: true,
  },
  render: (args) => (
    <div className="w-[420px] h-[500px] rounded-lg border overflow-y-auto">
      <MessageThread {...args} />
    </div>
  ),
};
