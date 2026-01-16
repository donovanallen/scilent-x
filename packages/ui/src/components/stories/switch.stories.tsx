import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch } from '../switch';
import { Label } from '../label';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the switch is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    'aria-label': 'Toggle setting',
  },
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
    'aria-label': 'Toggle setting',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    'aria-label': 'Disabled toggle',
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
    'aria-label': 'Disabled checked toggle',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledSwitch() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="controlled"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <Label htmlFor="controlled">Dark Mode</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Current state: {checked ? 'On' : 'Off'}
        </p>
      </div>
    );
  },
};

export const Settings: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="notifications">Notifications</Label>
          <p className="text-xs text-muted-foreground">
            Receive push notifications
          </p>
        </div>
        <Switch id="notifications" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="marketing">Marketing emails</Label>
          <p className="text-xs text-muted-foreground">
            Receive emails about new products
          </p>
        </div>
        <Switch id="marketing" />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="security">Security alerts</Label>
          <p className="text-xs text-muted-foreground">
            Get notified about security issues
          </p>
        </div>
        <Switch id="security" defaultChecked />
      </div>
    </div>
  ),
};
