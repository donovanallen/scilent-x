import { Button } from '../src/components/button';

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1>UI Sandbox</h1>
        <p className="text-muted-foreground">
          Test your components in isolation here.
        </p>

        <section className="space-y-4">
          <h2>Example: Button</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        {/* Add your component tests below */}
      </div>
    </div>
  );
}
