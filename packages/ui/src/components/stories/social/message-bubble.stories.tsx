import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageBubble } from '../../social/message-bubble';

const meta: Meta<typeof MessageBubble> = {
  title: 'Social/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MessageBubble>;

const sender = {
  name: 'Jane Smith',
  username: 'janesmith',
  avatarUrl: null,
  image: null,
};

export const Received: Story = {
  args: {
    id: 'message-1',
    content: 'Hey, are you going to the show this weekend?',
    createdAt: new Date(),
    isOwnMessage: false,
    sender,
    showAvatar: true,
  },
  render: (args) => (
    <div className="w-[400px]">
      <MessageBubble {...args} />
    </div>
  ),
};

export const Sent: Story = {
  args: {
    id: 'message-2',
    content: "Yeah, I'll be there!",
    createdAt: new Date(),
    isOwnMessage: true,
  },
  render: (args) => (
    <div className="w-[400px]">
      <MessageBubble {...args} />
    </div>
  ),
};

export const LongMessage: Story = {
  args: {
    id: 'message-3',
    content:
      'This is a much longer message to demonstrate how the bubble wraps text across multiple lines while staying within a reasonable max width so the conversation stays readable.',
    createdAt: new Date(),
    isOwnMessage: false,
    sender,
    showAvatar: true,
  },
  render: (args) => (
    <div className="w-[400px]">
      <MessageBubble {...args} />
    </div>
  ),
};

export const Conversation: Story = {
  render: () => (
    <div className="w-[400px] flex flex-col gap-1 rounded-lg border p-4">
      <MessageBubble
        id="1"
        content="Hey, are you going to the show this weekend?"
        createdAt={new Date(Date.now() - 10 * 60 * 1000)}
        isOwnMessage={false}
        sender={sender}
        showAvatar
      />
      <MessageBubble
        id="2"
        content="Which one?"
        createdAt={new Date(Date.now() - 9 * 60 * 1000)}
        isOwnMessage={false}
        sender={sender}
        showAvatar={false}
      />
      <MessageBubble
        id="3"
        content="The one downtown on Saturday"
        createdAt={new Date(Date.now() - 8 * 60 * 1000)}
        isOwnMessage={false}
        sender={sender}
        showAvatar={false}
      />
      <MessageBubble
        id="4"
        content="Yeah, I'll be there!"
        createdAt={new Date(Date.now() - 5 * 60 * 1000)}
        isOwnMessage
      />
      <MessageBubble
        id="5"
        content="Great, see you then"
        createdAt={new Date(Date.now() - 4 * 60 * 1000)}
        isOwnMessage={false}
        sender={sender}
        showAvatar
      />
    </div>
  ),
};
