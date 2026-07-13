import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
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
    <ScrollArea
      className="h-[300px] w-[300px] rounded-md border p-4"
      showShadow
    >
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

/**
 * The scrollbar width is configurable via the `scrollbarWidth` prop
 * ("line" | "thin" | "default"). Scroll each column to compare.
 */
export const WidthVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      {(['line', 'thin', 'default'] as const).map((width) => (
        <div key={width} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">{width}</span>
          <ScrollArea
            scrollbarWidth={width}
            className="h-72 w-40 rounded-md border"
          >
            <div className="p-4">
              {tags.map((tag) => (
                <div key={tag}>
                  <div className="text-sm">{tag}</div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  ),
};

/**
 * The `accent` prop controls the thumb color while scrolling/hovering:
 * "theme" (default) shifts to the palette accent, "muted" stays monochrome.
 */
export const AccentVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      {(['theme', 'muted'] as const).map((accent) => (
        <div key={accent} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">
            accent: {accent}
          </span>
          <ScrollArea accent={accent} className="h-72 w-40 rounded-md border">
            <div className="p-4">
              {tags.map((tag) => (
                <div key={tag}>
                  <div className="text-sm">{tag}</div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  ),
};

/**
 * Per-instance customization via CSS variables. Override `--scrollbar-thumb`,
 * `--scrollbar-thumb-active`, `--scrollbar-size`, and `--scrollbar-thumb-opacity`
 * inline for full control over color, width, and opacity.
 */
export const CustomStyle: Story = {
  render: () => (
    <ScrollArea
      className="h-72 w-48 rounded-md border"
      style={
        {
          '--scrollbar-size': '0.75rem',
          '--scrollbar-thumb': 'var(--color-chart-1)',
          '--scrollbar-thumb-active': 'var(--color-primary)',
          '--scrollbar-thumb-opacity': '0.6',
        } as React.CSSProperties
      }
    >
      <div className="p-4">
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

/**
 * The native baseline: any element (or ancestor) with the `custom-scrollbars`
 * class gets the themed native scrollbar - no JS, works on plain `overflow`
 * containers app-wide. Compare against the browser default on the right.
 */
export const NativeBaseline: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">custom-scrollbars</span>
        <div
          tabIndex={0}
          role="region"
          aria-label="Custom scrollbar example"
          className="custom-scrollbars h-72 w-40 overflow-y-auto rounded-md border p-4"
        >
          {tags.map((tag) => (
            <div key={tag}>
              <div className="text-sm">{tag}</div>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">native default</span>
        <div
          tabIndex={0}
          role="region"
          aria-label="Native scrollbar example"
          className="h-72 w-40 overflow-y-auto rounded-md border p-4"
        >
          {tags.map((tag) => (
            <div key={tag}>
              <div className="text-sm">{tag}</div>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
