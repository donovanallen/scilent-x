import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { UserCard } from '../../social/user-card';

const meta: Meta<typeof UserCard> = {
  title: 'Social/UserCard',
  component: UserCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onFollow: fn(),
    onUnfollow: fn(),
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof UserCard>;

export const Default: Story = {
  args: {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    bio: 'Full-stack developer passionate about building great user experiences.',
    avatarUrl: null,
    image: null,
    followersCount: 1234,
    followingCount: 567,
    isFollowing: false,
    isCurrentUser: false,
    isLoading: false,
  },
};

export const WithAvatar: Story = {
  args: {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    bio: 'Designer and illustrator. Creating beautiful things.',
    avatarUrl: 'https://github.com/shadcn.png',
    image: null,
    followersCount: 5432,
    followingCount: 234,
    isFollowing: false,
    isCurrentUser: false,
    isLoading: false,
  },
};

export const Following: Story = {
  args: {
    id: '3',
    name: 'Alex Johnson',
    username: 'alexj',
    bio: 'Software engineer at TechCorp. Open source enthusiast.',
    avatarUrl: null,
    image: null,
    followersCount: 890,
    followingCount: 456,
    isFollowing: true,
    isCurrentUser: false,
    isLoading: false,
    showFollowButton: true,
  },
};

export const CurrentUser: Story = {
  args: {
    id: '4',
    name: 'Current User',
    username: 'me',
    bio: 'This is my profile.',
    avatarUrl: null,
    image: null,
    followersCount: 100,
    followingCount: 50,
    isCurrentUser: true,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    id: '5',
    name: 'Loading User',
    username: 'loading',
    bio: 'Bio text here.',
    avatarUrl: null,
    image: null,
    followersCount: 100,
    followingCount: 50,
    isFollowing: false,
    isCurrentUser: false,
    isLoading: true,
  },
};

export const NoBio: Story = {
  args: {
    id: '6',
    name: 'No Bio User',
    username: 'nobio',
    bio: null,
    avatarUrl: null,
    image: null,
    followersCount: 42,
    followingCount: 21,
    isFollowing: false,
    isCurrentUser: false,
    isLoading: false,
  },
};

export const Minimal: Story = {
  args: {
    id: '7',
    name: 'Minimal User',
    username: 'minimal',
    bio: null,
    avatarUrl: null,
    image: null,
    isFollowing: false,
    isCurrentUser: false,
    isLoading: false,
  },
};

export const LongContent: Story = {
  args: {
    id: '8',
    name: 'Very Long Username That Might Overflow The Card Container',
    username: 'verylongusernamethatmightoverflow',
    bio: 'This is a very long bio that might wrap to multiple lines. It contains a lot of text to demonstrate how the card handles long content gracefully without breaking the layout or causing overflow issues.',
    avatarUrl: null,
    image: null,
    followersCount: 999999,
    followingCount: 888888,
    isFollowing: false,
    isCurrentUser: false,
    isLoading: false,
  },
};

export const CardList: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <UserCard
        id="1"
        name="John Doe"
        username="johndoe"
        bio="Developer"
        avatarUrl={null}
        image={null}
        followersCount={100}
        followingCount={50}
        isFollowing={false}
        onFollow={fn()}
        onUnfollow={fn()}
      />
      <UserCard
        id="2"
        name="Jane Smith"
        username="janesmith"
        bio="Designer"
        avatarUrl="https://github.com/shadcn.png"
        image={null}
        followersCount={200}
        followingCount={150}
        isFollowing={true}
        onFollow={fn()}
        onUnfollow={fn()}
      />
      <UserCard
        id="3"
        name="Alex Johnson"
        username="alexj"
        bio="Engineer"
        avatarUrl={null}
        image={null}
        followersCount={50}
        followingCount={75}
        isCurrentUser={true}
        onFollow={fn()}
        onUnfollow={fn()}
      />
    </div>
  ),
};
