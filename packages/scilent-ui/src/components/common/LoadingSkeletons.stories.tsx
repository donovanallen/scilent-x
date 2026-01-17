import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  GridSkeleton,
  ListSkeleton,
  HeroSkeleton,
  PageSkeleton,
  InlineSkeleton,
} from "./LoadingSkeletons";

const meta: Meta<typeof GridSkeleton> = {
  title: "Common/LoadingSkeletons",
  component: GridSkeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof GridSkeleton>;

export const Grid: Story = {
  args: {
    count: 8,
    columns: 4,
    aspectRatio: "square",
    showContent: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[900px]">
        <Story />
      </div>
    ),
  ],
};

export const GridNoContent: Story = {
  args: {
    count: 6,
    columns: 3,
    showContent: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export const GridVideo: Story = {
  args: {
    count: 4,
    columns: 2,
    aspectRatio: "video",
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export const List: Story = {
  render: () => (
    <div className="w-[500px]">
      <ListSkeleton count={5} />
    </div>
  ),
};

export const ListCircleAvatar: Story = {
  render: () => (
    <div className="w-[500px]">
      <ListSkeleton count={5} avatarShape="circle" />
    </div>
  ),
};

export const ListNoAvatar: Story = {
  render: () => (
    <div className="w-[500px]">
      <ListSkeleton count={5} showAvatar={false} />
    </div>
  ),
};

export const ListThreeLines: Story = {
  render: () => (
    <div className="w-[500px]">
      <ListSkeleton count={4} lines={3} />
    </div>
  ),
};

export const Hero: Story = {
  render: () => (
    <div className="w-[800px]">
      <HeroSkeleton />
    </div>
  ),
};

export const HeroCircle: Story = {
  render: () => (
    <div className="w-[800px]">
      <HeroSkeleton imageShape="circle" />
    </div>
  ),
};

export const HeroSmall: Story = {
  render: () => (
    <div className="w-[600px]">
      <HeroSkeleton imageSize="md" />
    </div>
  ),
};

export const HeroLarge: Story = {
  render: () => (
    <div className="w-[900px]">
      <HeroSkeleton imageSize="xl" />
    </div>
  ),
};

export const Page: Story = {
  render: () => (
    <div className="w-[800px]">
      <PageSkeleton />
    </div>
  ),
};

export const PageWithGrid: Story = {
  render: () => (
    <div className="w-[900px]">
      <PageSkeleton showGrid showList={false} />
    </div>
  ),
};

export const PageMinimal: Story = {
  render: () => (
    <div className="w-[600px]">
      <PageSkeleton showHero={false} />
    </div>
  ),
};

export const Inline: Story = {
  render: () => (
    <p className="text-sm">
      Loading data for <InlineSkeleton width="6rem" /> by{" "}
      <InlineSkeleton width="8rem" />...
    </p>
  ),
};

export const InlineVariations: Story = {
  render: () => (
    <div className="space-y-2">
      <p>
        Track: <InlineSkeleton width="10rem" />
      </p>
      <p>
        Artist: <InlineSkeleton width="8rem" />
      </p>
      <p>
        Duration: <InlineSkeleton width="3rem" />
      </p>
    </div>
  ),
};
