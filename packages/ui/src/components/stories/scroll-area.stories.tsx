import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea, ScrollBar } from '../scroll-area';
import { Separator } from '../separator';

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
);

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 rounded-md border bg-card p-4 w-[150px]"
          >
            <div className="text-sm font-medium">Card {i + 1}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Some card content here
            </p>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const WithShadows: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border" showShadow>
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const ArticleContent: Story = {
  render: () => (
    <ScrollArea className="h-[400px] w-[350px] rounded-md border p-4">
      <article>
        <h2 className="text-lg font-semibold mb-4">
          The Art of Component Design
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Component design is a fundamental aspect of modern web development.
          When done right, it enables teams to build consistent, maintainable,
          and scalable user interfaces.
        </p>
        <h3 className="text-md font-semibold mb-2">Core Principles</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The key to effective component design lies in understanding the
          balance between flexibility and constraints. Components should be
          flexible enough to accommodate various use cases while maintaining
          consistent behavior and appearance.
        </p>
        <h3 className="text-md font-semibold mb-2">Composition</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Composition is the practice of combining smaller, focused components
          to create more complex interfaces. This approach promotes reusability
          and makes components easier to test and maintain.
        </p>
        <h3 className="text-md font-semibold mb-2">Accessibility</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Every component should be designed with accessibility in mind from the
          start. This includes proper semantic HTML, keyboard navigation, and
          ARIA attributes where necessary.
        </p>
        <h3 className="text-md font-semibold mb-2">Performance</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Components should be optimized for performance. This means avoiding
          unnecessary re-renders, lazy loading where appropriate, and being
          mindful of bundle size.
        </p>
        <h3 className="text-md font-semibold mb-2">Documentation</h3>
        <p className="text-sm text-muted-foreground">
          Good documentation is essential for component adoption. Each component
          should have clear examples, prop descriptions, and usage guidelines.
        </p>
      </article>
    </ScrollArea>
  ),
};

export const ChatMessages: Story = {
  render: () => (
    <ScrollArea className="h-[300px] w-[300px] rounded-md border p-4" showShadow>
      <div className="space-y-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`rounded-lg px-3 py-2 max-w-[80%] ${
                i % 2 === 0
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <p className="text-sm">
                {i % 2 === 0
                  ? 'Hey, how are you doing?'
                  : "I'm doing great, thanks for asking!"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
