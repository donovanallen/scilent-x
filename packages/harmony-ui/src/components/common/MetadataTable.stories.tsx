import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  MetadataTable,
  MetadataGrid,
  MetadataTableSkeleton,
} from "./MetadataTable";
import { Badge } from "@scilent-one/ui";

const meta: Meta<typeof MetadataTable> = {
  title: "Common/MetadataTable",
  component: MetadataTable,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Layout orientation",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size variant",
    },
    divided: {
      control: "boolean",
      description: "Add dividers between items",
    },
  },
  args: {
    orientation: "vertical",
    size: "md",
    divided: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MetadataTable>;

const sampleItems = [
  { label: "Title", value: "Kid A" },
  { label: "Artist", value: "Radiohead" },
  { label: "Release Date", value: "October 2, 2000" },
  { label: "Label", value: "Parlophone" },
  { label: "GTIN", value: "0724352771752", mono: true },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const Horizontal: Story = {
  args: {
    items: sampleItems.slice(0, 3),
    orientation: "horizontal",
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export const Divided: Story = {
  args: {
    items: sampleItems,
    divided: true,
  },
};

export const Small: Story = {
  args: {
    items: sampleItems,
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    items: sampleItems,
    size: "lg",
  },
};

export const WithReactNodes: Story = {
  args: {
    items: [
      { label: "Title", value: "Kid A" },
      { label: "Artist", value: "Radiohead" },
      {
        label: "Status",
        value: <Badge variant="default">Official</Badge>,
      },
      {
        label: "Sources",
        value: (
          <div className="flex gap-1">
            <Badge variant="secondary">Spotify</Badge>
            <Badge variant="secondary">MusicBrainz</Badge>
          </div>
        ),
      },
    ],
  },
};

export const HideEmpty: Story = {
  args: {
    items: [
      { label: "Title", value: "Kid A" },
      { label: "Artist", value: "Radiohead" },
      { label: "Disambiguation", value: "", hideEmpty: true },
      { label: "Notes", value: null, hideEmpty: true },
      { label: "Label", value: "Parlophone" },
    ],
  },
};

export const Grid: Story = {
  render: () => (
    <MetadataGrid
      items={[
        { label: "Title", value: "Kid A" },
        { label: "Artist", value: "Radiohead" },
        { label: "Release Date", value: "October 2, 2000" },
        { label: "Label", value: "Parlophone" },
        { label: "Country", value: "United Kingdom" },
        { label: "Format", value: "CD" },
      ]}
      columns={2}
    />
  ),
};

export const GridThreeColumns: Story = {
  render: () => (
    <div className="w-[600px]">
      <MetadataGrid
        items={[
          { label: "Title", value: "Kid A" },
          { label: "Artist", value: "Radiohead" },
          { label: "Year", value: "2000" },
          { label: "Label", value: "Parlophone" },
          { label: "Country", value: "UK" },
          { label: "Format", value: "CD" },
        ]}
        columns={3}
      />
    </div>
  ),
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-[400px]">
      <MetadataTableSkeleton rows={4} />
    </div>
  ),
};

export const SkeletonHorizontal: Story = {
  render: () => (
    <div className="w-[600px]">
      <MetadataTableSkeleton rows={3} orientation="horizontal" />
    </div>
  ),
};
