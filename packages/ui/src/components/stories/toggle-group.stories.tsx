import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../toggle-group';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Selection type',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'Size of the toggle group',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Single: Story = {
  render: () => (
    <ToggleGroup type="single" aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Left aligned">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center aligned">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right aligned">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="justify" aria-label="Justified">
        <AlignJustify className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" aria-label="Text formatting">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Left aligned">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center aligned">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right aligned">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <ToggleGroup type="single" size="sm" aria-label="Small toggle group">
        <ToggleGroupItem value="left" aria-label="Left aligned">
          <AlignLeft className="h-3 w-3" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center aligned">
          <AlignCenter className="h-3 w-3" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right aligned">
          <AlignRight className="h-3 w-3" />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" size="default" aria-label="Default toggle group">
        <ToggleGroupItem value="left" aria-label="Left aligned">
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center aligned">
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right aligned">
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" size="lg" aria-label="Large toggle group">
        <ToggleGroupItem value="left" aria-label="Left aligned">
          <AlignLeft className="h-5 w-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center aligned">
          <AlignCenter className="h-5 w-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right aligned">
          <AlignRight className="h-5 w-5" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ToggleGroup type="single" aria-label="Disabled toggle group">
      <ToggleGroupItem value="left" aria-label="Left aligned">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center aligned" disabled>
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right aligned">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="center" aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Left aligned">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center aligned">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right aligned">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
