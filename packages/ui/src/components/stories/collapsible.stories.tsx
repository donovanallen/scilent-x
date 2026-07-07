import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../collapsible';
import { Button } from '../button';

const meta: Meta<typeof Collapsible> = {
  title: 'Components/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: function DefaultCollapsible() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[350px] space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            @peduarte starred 3 repositories
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const OpenByDefault: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">Show more details</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 text-sm">
          <p>Here are the additional details that are shown by default.</p>
          <p className="mt-2 text-muted-foreground">
            You can collapse this section by clicking the toggle button.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const FAQ: Story = {
  render: function FAQCollapsible() {
    const faqs = [
      {
        question: 'What is React?',
        answer:
          'React is a JavaScript library for building user interfaces, particularly single-page applications.',
      },
      {
        question: 'What are components?',
        answer:
          'Components are reusable pieces of UI that can be composed together to build complex interfaces.',
      },
      {
        question: 'What is JSX?',
        answer:
          'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.',
      },
    ];

    return (
      <div className="w-[400px] space-y-4">
        <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
        {faqs.map((faq, index) => (
          <Collapsible key={index} className="border rounded-md">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
              >
                <span className="text-left font-medium">{faq.question}</span>
                <ChevronsUpDown className="h-4 w-4 shrink-0" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground">
              {faq.answer}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    );
  },
};

export const NestedContent: Story = {
  render: () => (
    <Collapsible className="w-[350px] border rounded-md">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-4 h-auto">
          <span className="font-semibold">Project Details</span>
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 pt-0 space-y-4">
        <div>
          <h4 className="text-sm font-medium">Description</h4>
          <p className="text-sm text-muted-foreground mt-1">
            A comprehensive project management tool built with modern
            technologies.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium">Technologies</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="px-2 py-1 text-xs bg-muted rounded">React</span>
            <span className="px-2 py-1 text-xs bg-muted rounded">
              TypeScript
            </span>
            <span className="px-2 py-1 text-xs bg-muted rounded">Tailwind</span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium">Status</h4>
          <p className="text-sm text-muted-foreground mt-1">Active</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};
