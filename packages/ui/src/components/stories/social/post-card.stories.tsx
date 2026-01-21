import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCard } from '../../social/post-card';

const mockAuthor = {
  id: 'user-1',
  name: 'John Doe',
  username: 'johndoe',
  avatarUrl: null,
  image: null,
};

const mockComment = {
  id: 'comment-1',
  content: 'This is a great post! @jane mentioned something similar.',
  author: {
    id: 'user-2',
    name: 'Jane Smith',
    username: 'janesmith',
    avatarUrl: null,
    image: null,
  },
  createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
  likesCount: 5,
  repliesCount: 2,
  isLiked: false,
};

const meta: Meta<typeof PostCard> = {
  title: 'Social/PostCard',
  component: PostCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isLiked: {
      control: 'boolean',
      description: 'Whether the current user has liked this post',
    },
    isOwner: {
      control: 'boolean',
      description: 'Whether the current user owns this post',
    },
    showComments: {
      control: 'boolean',
      description: 'Whether to show the comments section',
    },
  },
  args: {
    id: 'post-1',
    content: 'This is a sample post with some content. It demonstrates how posts look with text content.',
    contentHtml: '<p>This is a sample post with some content. It demonstrates how posts look with text content.</p>',
    author: mockAuthor,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    likesCount: 42,
    commentsCount: 7,
    isLiked: false,
    isOwner: false,
    showComments: false,
  },
};

export default meta;
type Story = StoryObj<typeof PostCard>;

export const Default: Story = {};

export const Liked: Story = {
  args: {
    isLiked: true,
    likesCount: 43,
  },
};

export const WithOwnerActions: Story = {
  args: {
    isOwner: true,
  },
};

export const WithComments: Story = {
  args: {
    showComments: true,
    comments: [mockComment],
    currentUser: {
      id: 'user-3',
      name: 'Current User',
      username: 'currentuser',
      avatarUrl: null,
      image: null,
    },
  },
};

export const LongContent: Story = {
  args: {
    content: `This is a much longer post that contains a lot more text. 
    
It includes multiple paragraphs to demonstrate how the card handles longer content gracefully.

The post might include mentions like @someuser and hashtags or artist mentions like #SomeArtist.

This helps test the layout on various screen sizes including mobile devices.`,
    contentHtml: `<p>This is a much longer post that contains a lot more text.</p>
<p>It includes multiple paragraphs to demonstrate how the card handles longer content gracefully.</p>
<p>The post might include mentions like <span class="tiptap-mention" data-mention-type="USER" data-mention-id="someuser" data-mention-label="someuser">@someuser</span> and hashtags or artist mentions like <span class="tiptap-mention tiptap-mention--artist" data-mention-type="ARTIST" data-mention-id="some-artist-id" data-mention-label="SomeArtist">SomeArtist</span>.</p>
<p>This helps test the layout on various screen sizes including mobile devices.</p>`,
  },
};

// Mobile viewport stories
export const MobileDefault: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobileM',
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-4 max-w-full">
        <Story />
      </div>
    ),
  ],
};

export const MobileWithComments: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobileM',
    },
    layout: 'fullscreen',
  },
  args: {
    showComments: true,
    comments: [mockComment],
    currentUser: {
      id: 'user-3',
      name: 'Current User',
      username: 'currentuser',
      avatarUrl: null,
      image: null,
    },
  },
  decorators: [
    (Story) => (
      <div className="p-4 max-w-full">
        <Story />
      </div>
    ),
  ],
};

export const MobileLongContent: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobileM',
    },
    layout: 'fullscreen',
  },
  args: {
    content: `This is a much longer post for mobile testing.

It includes multiple paragraphs and should wrap properly on small screens.

Testing touch targets and readability on mobile devices.`,
  },
  decorators: [
    (Story) => (
      <div className="p-4 max-w-full">
        <Story />
      </div>
    ),
  ],
};

export const TabletDefault: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-6 max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
};
