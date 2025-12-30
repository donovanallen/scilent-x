import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'search', 'tel', 'url'],
      description: 'HTML input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Hello, World!',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="email" className="text-sm font-medium">
        Email
      </label>
      <Input type="email" id="email" placeholder="Enter your email" />
    </div>
  ),
};

export const File: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="picture" className="text-sm font-medium">
        Picture
      </label>
      <Input id="picture" type="file" />
    </div>
  ),
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
    className: 'w-[300px]',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Text</label>
        <Input type="text" placeholder="Text input" />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Password</label>
        <Input type="password" placeholder="••••••••" />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Number</label>
        <Input type="number" placeholder="0" />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Search</label>
        <Input type="search" placeholder="Search..." />
      </div>
    </div>
  ),
};
