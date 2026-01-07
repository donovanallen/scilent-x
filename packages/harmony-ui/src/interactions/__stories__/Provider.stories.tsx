import type { Meta, StoryObj } from '@storybook/react-vite';
import { HarmonyInteractionProvider, useHarmonyInteraction } from '../provider';
import { Badge } from '@scilent-one/ui';

const meta: Meta<typeof HarmonyInteractionProvider> = {
  title: 'Interactions/Provider',
  component: HarmonyInteractionProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Provider component that configures interaction behaviors for all nested harmony-ui components.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HarmonyInteractionProvider>;

function ConfigDisplay() {
  const config = useHarmonyInteraction();
  
  return (
    <div className="border rounded-lg p-6 max-w-md">
      <h3 className="font-semibold mb-4">Current Configuration</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Enabled:</span>
          <Badge variant={config.enabled ? 'default' : 'secondary'}>
            {config.enabled ? 'Yes' : 'No'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Platform:</span>
          <Badge variant="outline">{config.platform}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Context Menu:</span>
          <Badge variant={config.enableContextMenu ? 'default' : 'secondary'}>
            {config.enableContextMenu ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hover Preview:</span>
          <Badge variant={config.enableHoverPreview ? 'default' : 'secondary'}>
            {config.enableHoverPreview ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hover Delay:</span>
          <span>{config.hoverDelay}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">onNavigate:</span>
          <span>{config.onNavigate ? 'Configured' : 'Not set'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">onOpenExternal:</span>
          <span>{config.onOpenExternal ? 'Configured' : 'Not set'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">onCopyLink:</span>
          <span>{config.onCopyLink ? 'Configured' : 'Not set'}</span>
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  name: 'Default Configuration',
  render: () => (
    <HarmonyInteractionProvider>
      <ConfigDisplay />
    </HarmonyInteractionProvider>
  ),
};

export const WebPlatform: Story = {
  name: 'Web Platform Configuration',
  render: () => (
    <HarmonyInteractionProvider
      config={{
        platform: 'web',
        enableContextMenu: true,
        enableHoverPreview: true,
        hoverDelay: 300,
        onNavigate: (type, entity) => console.log('Navigate:', type, entity),
        onOpenExternal: (url, platform) => console.log('Open:', url, platform),
        onCopyLink: (entity, type) => console.log('Copy:', type, entity),
      }}
    >
      <ConfigDisplay />
    </HarmonyInteractionProvider>
  ),
};

export const MobilePlatform: Story = {
  name: 'Mobile Platform Configuration',
  render: () => (
    <HarmonyInteractionProvider
      config={{
        platform: 'mobile',
        enableContextMenu: true,
        enableHoverPreview: false, // Typically disabled on mobile
        onNavigate: (type, entity) => console.log('Navigate:', type, entity),
      }}
    >
      <ConfigDisplay />
    </HarmonyInteractionProvider>
  ),
};

export const AutoPlatform: Story = {
  name: 'Auto Platform Detection',
  render: () => (
    <HarmonyInteractionProvider
      config={{
        platform: 'auto',
        enableContextMenu: true,
        enableHoverPreview: true,
      }}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Platform is automatically detected based on screen size.
          <br />
          Resize the window to see it change.
        </p>
        <ConfigDisplay />
      </div>
    </HarmonyInteractionProvider>
  ),
};

export const MinimalConfiguration: Story = {
  name: 'Minimal Configuration',
  render: () => (
    <HarmonyInteractionProvider
      config={{
        enableContextMenu: false,
        enableHoverPreview: false,
      }}
    >
      <ConfigDisplay />
    </HarmonyInteractionProvider>
  ),
};

export const WithoutProvider: Story = {
  name: 'Without Provider (Graceful Fallback)',
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        When used outside a provider, useHarmonyInteraction returns safe defaults.
      </p>
      <ConfigDisplay />
    </div>
  ),
};

export const CustomHoverDelay: Story = {
  name: 'Custom Hover Delay',
  render: () => (
    <HarmonyInteractionProvider
      config={{
        platform: 'web',
        enableHoverPreview: true,
        hoverDelay: 500, // Longer delay
      }}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Hover delay set to 500ms for slower preview triggering.
        </p>
        <ConfigDisplay />
      </div>
    </HarmonyInteractionProvider>
  ),
};
