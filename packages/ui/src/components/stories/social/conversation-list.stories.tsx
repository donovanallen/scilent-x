import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { ConversationList } from '../../social/conversation-list';

const meta: Meta<typeof ConversationList> = {
  title: 'Social/ConversationList',
  component: ConversationList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onConversationClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ConversationList>;

const conversations = [
  {
    id: 'conversation-1',
    otherParticipant: {
      id: 'user-2',
      name: 'Jane Smith',
      username: 'janesmith',
      avatarUrl: null,
      image: null,
    },
    lastMessage: {
      content: 'Hey, are you going to the show this weekend?',
      senderId: 'user-2',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    unreadCount: 2,
  },
  {
    id: 'conversation-2',
    otherParticipant: {
      id: 'user-3',
      name: 'Alex Johnson',
      username: 'alexj',
      avatarUrl: null,
      image: null,
    },
    lastMessage: {
      content: 'Thanks for the recommendation!',
      senderId: 'user-1',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    unreadCount: 0,
  },
  {
    id: 'conversation-3',
    otherParticipant: {
      id: 'user-4',
      name: null,
      username: 'newfriend',
      avatarUrl: null,
      image: null,
    },
    lastMessage: null,
    unreadCount: 0,
  },
];

export const Default: Story = {
  args: {
    conversations,
    currentUserId: 'user-1',
    activeConversationId: 'conversation-1',
  },
  render: (args) => (
    <div className="w-[360px] rounded-lg border p-2">
      <ConversationList {...args} />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    conversations: [],
    currentUserId: 'user-1',
    isLoading: true,
  },
  render: (args) => (
    <div className="w-[360px] rounded-lg border p-2">
      <ConversationList {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    conversations: [],
    currentUserId: 'user-1',
    isLoading: false,
  },
  render: (args) => (
    <div className="w-[360px] rounded-lg border p-2">
      <ConversationList {...args} />
    </div>
  ),
};

export const LoadingMore: Story = {
  args: {
    conversations,
    currentUserId: 'user-1',
    isLoading: true,
    hasMore: true,
  },
  render: (args) => (
    <div className="w-[360px] rounded-lg border p-2">
      <ConversationList {...args} />
    </div>
  ),
};
