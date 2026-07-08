import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { ConversationListItem } from '../../social/conversation-list-item';

const meta: Meta<typeof ConversationListItem> = {
  title: 'Social/ConversationListItem',
  component: ConversationListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ConversationListItem>;

const otherParticipant = {
  id: 'user-2',
  name: 'Jane Smith',
  username: 'janesmith',
  avatarUrl: null,
  image: null,
};

export const Default: Story = {
  args: {
    id: 'conversation-1',
    otherParticipant,
    lastMessage: {
      content: 'Hey, are you going to the show this weekend?',
      senderId: 'user-2',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    unreadCount: 0,
    currentUserId: 'user-1',
  },
};

export const Unread: Story = {
  args: {
    id: 'conversation-2',
    otherParticipant,
    lastMessage: {
      content: 'Just added a new track to the playlist, check it out!',
      senderId: 'user-2',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
    unreadCount: 3,
    currentUserId: 'user-1',
  },
};

export const OwnLastMessage: Story = {
  args: {
    id: 'conversation-3',
    otherParticipant,
    lastMessage: {
      content: 'Sounds good, see you there!',
      senderId: 'user-1',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    unreadCount: 0,
    currentUserId: 'user-1',
  },
};

export const NoMessagesYet: Story = {
  args: {
    id: 'conversation-4',
    otherParticipant,
    lastMessage: null,
    unreadCount: 0,
    currentUserId: 'user-1',
  },
};

export const Active: Story = {
  args: {
    id: 'conversation-5',
    otherParticipant,
    lastMessage: {
      content: 'See you soon!',
      senderId: 'user-2',
      createdAt: new Date(Date.now() - 30 * 1000),
    },
    unreadCount: 0,
    currentUserId: 'user-1',
    isActive: true,
  },
};

export const ManyUnread: Story = {
  args: {
    id: 'conversation-6',
    otherParticipant,
    lastMessage: {
      content: 'Where did you go?',
      senderId: 'user-2',
      createdAt: new Date(),
    },
    unreadCount: 128,
    currentUserId: 'user-1',
  },
};

export const List: Story = {
  render: () => (
    <div className="w-[360px] space-y-1 rounded-lg border p-2">
      <ConversationListItem
        id="conversation-1"
        otherParticipant={{
          id: 'user-2',
          name: 'Jane Smith',
          username: 'janesmith',
          avatarUrl: null,
          image: null,
        }}
        lastMessage={{
          content: 'Hey, are you going to the show this weekend?',
          senderId: 'user-2',
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
        }}
        unreadCount={2}
        currentUserId="user-1"
        isActive
        onClick={fn()}
      />
      <ConversationListItem
        id="conversation-2"
        otherParticipant={{
          id: 'user-3',
          name: 'Alex Johnson',
          username: 'alexj',
          avatarUrl: null,
          image: null,
        }}
        lastMessage={{
          content: 'Thanks for the recommendation!',
          senderId: 'user-1',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        }}
        unreadCount={0}
        currentUserId="user-1"
        onClick={fn()}
      />
      <ConversationListItem
        id="conversation-3"
        otherParticipant={{
          id: 'user-4',
          name: null,
          username: 'newuser',
          avatarUrl: null,
          image: null,
        }}
        lastMessage={null}
        unreadCount={0}
        currentUserId="user-1"
        onClick={fn()}
      />
    </div>
  ),
};
