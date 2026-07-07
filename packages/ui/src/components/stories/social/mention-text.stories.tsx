import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { MentionText } from '../../social/mention-text';

const meta: Meta<typeof MentionText> = {
  title: 'Social/MentionText',
  component: MentionText,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onMentionClick: fn(),
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'The text content containing mentions',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MentionText>;

export const SingleMention: Story = {
  args: {
    content: 'Hey @johndoe, check this out!',
  },
};

export const MultipleMentions: Story = {
  args: {
    content: 'Great work by @alice and @bob on this project!',
  },
};

export const NoMentions: Story = {
  args: {
    content: 'This is just regular text without any mentions.',
  },
};

export const MentionAtStart: Story = {
  args: {
    content: '@admin please review this submission.',
  },
};

export const MentionAtEnd: Story = {
  args: {
    content: 'Thanks for the help @support',
  },
};

export const ConsecutiveMentions: Story = {
  args: {
    content: 'Shoutout to @user1 @user2 @user3 for their contributions!',
  },
};

export const LongContent: Story = {
  args: {
    content:
      'Just published a new article about React hooks! Special thanks to @frontend_dev for the code review, @design_team for the illustrations, and @editor for proofreading. Would love to hear your thoughts @community!',
    className: 'max-w-md',
  },
};

export const WithStyling: Story = {
  args: {
    content: 'Styled mention: @styled_user',
    className: 'text-lg font-medium',
  },
};

export const InCard: Story = {
  render: () => (
    <div className="p-4 rounded-lg border w-[400px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <span className="text-sm font-medium">JD</span>
        </div>
        <div>
          <p className="font-medium">John Doe</p>
          <p className="text-sm text-muted-foreground">@johndoe</p>
        </div>
      </div>
      <MentionText
        content="Had a great meeting with @product_team today! @engineering will start implementation next week. cc @manager"
        className="text-sm"
        onMentionClick={fn()}
      />
    </div>
  ),
};

export const PostExample: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div className="p-4 rounded-lg border">
        <MentionText
          content="Just shipped a new feature! Thanks @team for the support."
          onMentionClick={fn()}
        />
      </div>
      <div className="p-4 rounded-lg border">
        <MentionText
          content="Replying to @original_poster - great point about accessibility!"
          onMentionClick={fn()}
        />
      </div>
      <div className="p-4 rounded-lg border">
        <MentionText
          content="No mentions in this post, just sharing my thoughts."
          onMentionClick={fn()}
        />
      </div>
    </div>
  ),
};

export const EdgeCases: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div className="p-3 rounded border">
        <p className="text-xs text-muted-foreground mb-1">
          Username with numbers:
        </p>
        <MentionText content="Hi @user123!" onMentionClick={fn()} />
      </div>
      <div className="p-3 rounded border">
        <p className="text-xs text-muted-foreground mb-1">
          Username with underscores:
        </p>
        <MentionText
          content="Check out @cool_user_name"
          onMentionClick={fn()}
        />
      </div>
      <div className="p-3 rounded border">
        <p className="text-xs text-muted-foreground mb-1">Multiple @ symbols:</p>
        <MentionText
          content="Contact @support for help, email at test@example.com"
          onMentionClick={fn()}
        />
      </div>
    </div>
  ),
};
