import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ReleaseTypePill,
  getReleaseTypeLabel,
  getReleaseTypePluralLabel,
  releaseTypeLabels,
  releaseTypePluralLabels,
} from './ReleaseTypePill';
import type { ReleaseType } from '../../types';

const allReleaseTypes: ReleaseType[] = [
  'album',
  'single',
  'ep',
  'compilation',
  'soundtrack',
  'live',
  'remix',
  'other',
];

const meta: Meta<typeof ReleaseTypePill> = {
  title: 'Common/ReleaseTypePill',
  component: ReleaseTypePill,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    releaseType: {
      control: 'select',
      options: allReleaseTypes,
      description: 'The release type to display',
    },
    uppercase: {
      control: 'boolean',
      description: 'Show label in uppercase',
    },
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Badge variant style',
    },
  },
  args: {
    releaseType: 'album',
    uppercase: false,
    variant: 'secondary',
  },
};

export default meta;
type Story = StoryObj<typeof ReleaseTypePill>;

export const Default: Story = {};

export const Album: Story = {
  args: {
    releaseType: 'album',
  },
};

export const Single: Story = {
  args: {
    releaseType: 'single',
  },
};

export const EP: Story = {
  args: {
    releaseType: 'ep',
  },
};

export const Compilation: Story = {
  args: {
    releaseType: 'compilation',
  },
};

export const Soundtrack: Story = {
  args: {
    releaseType: 'soundtrack',
  },
};

export const Live: Story = {
  args: {
    releaseType: 'live',
  },
};

export const Remix: Story = {
  args: {
    releaseType: 'remix',
  },
};

export const Other: Story = {
  args: {
    releaseType: 'other',
  },
};

export const Uppercase: Story = {
  args: {
    releaseType: 'album',
    uppercase: true,
  },
};

export const VariantDefault: Story = {
  name: 'Variant: Default',
  args: {
    releaseType: 'album',
    variant: 'default',
  },
};

export const VariantSecondary: Story = {
  name: 'Variant: Secondary',
  args: {
    releaseType: 'album',
    variant: 'secondary',
  },
};

export const VariantOutline: Story = {
  name: 'Variant: Outline',
  args: {
    releaseType: 'album',
    variant: 'outline',
  },
};

export const VariantDestructive: Story = {
  name: 'Variant: Destructive',
  args: {
    releaseType: 'album',
    variant: 'destructive',
  },
};

export const CustomReleaseType: Story = {
  name: 'Custom/Unknown Release Type',
  args: {
    releaseType: 'bootleg',
  },
};

export const AllTypes: Story = {
  name: 'All Release Types',
  render: () => (
    <div className="flex flex-wrap gap-2">
      {allReleaseTypes.map((type) => (
        <ReleaseTypePill key={type} releaseType={type} />
      ))}
    </div>
  ),
};

export const AllTypesUppercase: Story = {
  name: 'All Release Types (Uppercase)',
  render: () => (
    <div className="flex flex-wrap gap-2">
      {allReleaseTypes.map((type) => (
        <ReleaseTypePill key={type} releaseType={type} uppercase />
      ))}
    </div>
  ),
};

export const AllTypesOutline: Story = {
  name: 'All Release Types (Outline)',
  render: () => (
    <div className="flex flex-wrap gap-2">
      {allReleaseTypes.map((type) => (
        <ReleaseTypePill key={type} releaseType={type} variant="outline" />
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  name: 'All Variants Comparison',
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Default:</p>
        <div className="flex flex-wrap gap-2">
          {allReleaseTypes.map((type) => (
            <ReleaseTypePill key={type} releaseType={type} variant="default" />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Secondary:</p>
        <div className="flex flex-wrap gap-2">
          {allReleaseTypes.map((type) => (
            <ReleaseTypePill key={type} releaseType={type} variant="secondary" />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Outline:</p>
        <div className="flex flex-wrap gap-2">
          {allReleaseTypes.map((type) => (
            <ReleaseTypePill key={type} releaseType={type} variant="outline" />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Outline + Uppercase:</p>
        <div className="flex flex-wrap gap-2">
          {allReleaseTypes.map((type) => (
            <ReleaseTypePill
              key={type}
              releaseType={type}
              variant="outline"
              uppercase
            />
          ))}
        </div>
      </div>
    </div>
  ),
};

export const SmallSize: Story = {
  name: 'Small Size (Custom Class)',
  args: {
    releaseType: 'album',
    className: 'text-[10px]',
  },
};

export const InContext: Story = {
  name: 'In Context (Album Cards)',
  render: () => (
    <div className="space-y-3 w-[300px]">
      <div className="p-3 rounded-lg border">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium truncate">Kid A</h3>
          <ReleaseTypePill releaseType="album" variant="outline" className="text-[10px]" />
        </div>
        <p className="text-sm text-muted-foreground">Radiohead • 2000</p>
      </div>
      <div className="p-3 rounded-lg border">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium truncate">Creep</h3>
          <ReleaseTypePill releaseType="single" variant="outline" className="text-[10px]" />
        </div>
        <p className="text-sm text-muted-foreground">Radiohead • 1992</p>
      </div>
      <div className="p-3 rounded-lg border">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium truncate">My Iron Lung EP</h3>
          <ReleaseTypePill releaseType="ep" variant="outline" className="text-[10px]" />
        </div>
        <p className="text-sm text-muted-foreground">Radiohead • 1994</p>
      </div>
      <div className="p-3 rounded-lg border">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium truncate">I Might Be Wrong</h3>
          <ReleaseTypePill releaseType="live" variant="outline" className="text-[10px]" />
        </div>
        <p className="text-sm text-muted-foreground">Radiohead • 2001</p>
      </div>
    </div>
  ),
};

export const HelperFunctions: Story = {
  name: 'Helper Functions Demo',
  render: () => (
    <div className="space-y-6 w-[400px]">
      <div>
        <h4 className="font-medium mb-2">getReleaseTypeLabel()</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Returns singular labels for display:
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {allReleaseTypes.map((type) => (
            <div key={type} className="flex justify-between">
              <code className="text-xs bg-muted px-1 rounded">{type}</code>
              <span>{getReleaseTypeLabel(type)}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2">getReleaseTypePluralLabel()</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Returns plural labels for tabs/lists:
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(['all', ...allReleaseTypes] as const).map((type) => (
            <div key={type} className="flex justify-between">
              <code className="text-xs bg-muted px-1 rounded">{type}</code>
              <span>{getReleaseTypePluralLabel(type)}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2">Usage in Tabs</h4>
        <div className="flex gap-1 border-b">
          {(['all', 'album', 'single', 'ep'] as const).map((type) => (
            <button
              key={type}
              className="px-3 py-2 text-sm hover:bg-muted rounded-t transition-colors"
            >
              {getReleaseTypePluralLabel(type)}
            </button>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const LabelMappings: Story = {
  name: 'Label Mappings Reference',
  render: () => (
    <div className="space-y-4 w-[500px]">
      <div>
        <h4 className="font-medium mb-2">releaseTypeLabels</h4>
        <pre
          className="text-xs bg-muted p-3 rounded overflow-auto"
          tabIndex={0}
          aria-label="Release type labels JSON"
        >
          {JSON.stringify(releaseTypeLabels, null, 2)}
        </pre>
      </div>
      <div>
        <h4 className="font-medium mb-2">releaseTypePluralLabels</h4>
        <pre
          className="text-xs bg-muted p-3 rounded overflow-auto"
          tabIndex={0}
          aria-label="Release type plural labels JSON"
        >
          {JSON.stringify(releaseTypePluralLabels, null, 2)}
        </pre>
      </div>
    </div>
  ),
};
