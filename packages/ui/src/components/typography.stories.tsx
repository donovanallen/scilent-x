import type { Meta, StoryObj } from '@storybook/react-vite';

function TypographyDemo() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-mono">
            Foundations / Typography
          </p>
          <h3>Type scale & fonts</h3>
          <p className="text-muted-foreground">
            This story renders semantic elements styled by
            <code>src/globals.css</code>, plus font utilities that map to your
            CSS variables.
          </p>
        </div>

        <div className="mt-10 space-y-12">
          <section>
            <div className="flex items-baseline justify-between gap-6 border-b border-border pb-3">
              <h4>Display/Hero</h4>
              <p className="text-sm text-muted-foreground font-mono">
                font-display
              </p>
            </div>

            <span className="font-display text-6xl font-bold">
              Quick Brown Fox
            </span>
          </section>
          <section className="space-y-6">
            <div className="flex items-baseline justify-between gap-6 border-b border-border pb-3">
              <h4>Headings</h4>
              <p className="text-sm text-muted-foreground font-mono">
                h1–h6 (global styles)
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">h1</p>
                <h1>The quick brown fox jumps over the lazy dog</h1>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">h2</p>
                <h2>The quick brown fox jumps over the lazy dog</h2>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">h3</p>
                <h3>The quick brown fox jumps over the lazy dog</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">h4</p>
                <h4>The quick brown fox jumps over the lazy dog</h4>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">h5</p>
                <h5>The quick brown fox jumps over the lazy dog</h5>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">h6</p>
                <h6>The quick brown fox jumps over the lazy dog</h6>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-baseline justify-between gap-6 border-b border-border pb-3">
              <h4>Body, lists, and code</h4>
              <p className="text-sm text-muted-foreground font-mono">
                p / strong / ul / ol / code (global styles)
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p>
                  Body text uses the global <strong>paragraph</strong> styles.
                  Inline code like <code>const answer = 42</code> should render
                  with the configured monospace font and background token.
                </p>
                <p className="text-sm text-muted-foreground">
                  Muted text example (useful for captions and metadata).
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground font-mono">
                    Unordered list
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Readable line height</li>
                    <li>Consistent spacing</li>
                    <li>
                      Inline <code>code</code> within list items
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground font-mono">
                    Ordered list
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>One</li>
                    <li>Two</li>
                    <li>Three</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-baseline justify-between gap-6 border-b border-border pb-3">
              <h4>Font utilities</h4>
              <p className="text-sm text-muted-foreground font-mono">
                font-display / font-heading / font-body / font-mono
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground font-mono">
                  font-display
                </p>
                <p className="mt-2 text-2xl font-display">
                  Display: Doto (variable)
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground font-mono">
                  font-heading
                </p>
                <p className="mt-2 text-2xl font-heading">
                  Heading: Space Grotesk
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground font-mono">
                  font-body
                </p>
                <p className="mt-2 text-xl font-body">Body: Source Sans 3</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground font-mono">
                  font-mono
                </p>
                <p className="mt-2 text-lg font-mono">
                  Mono: Space Mono (fallback)
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof TypographyDemo> = {
  title: 'Foundations/Typography',
  component: TypographyDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TypographyDemo>;

export const Overview: Story = {
  render: () => <TypographyDemo />,
};
