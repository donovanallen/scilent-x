import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';

type PropsWithChildren = { children?: ReactNode };
type AnchorProps = { href?: string; children?: ReactNode };

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Default prose styling for MDX content
    h1: ({ children }: PropsWithChildren) => (
      <h1 className='text-3xl font-bold mt-8 mb-4'>{children}</h1>
    ),
    h2: ({ children }: PropsWithChildren) => (
      <h2 className='text-2xl font-semibold mt-6 mb-3 pb-2 border-b'>
        {children}
      </h2>
    ),
    h3: ({ children }: PropsWithChildren) => (
      <h3 className='text-xl font-semibold mt-5 mb-2'>{children}</h3>
    ),
    h4: ({ children }: PropsWithChildren) => (
      <h4 className='text-lg font-medium mt-4 mb-2'>{children}</h4>
    ),
    p: ({ children }: PropsWithChildren) => (
      <p className='my-3 leading-relaxed'>{children}</p>
    ),
    ul: ({ children }: PropsWithChildren) => (
      <ul className='my-3 ml-6 list-disc space-y-1'>{children}</ul>
    ),
    ol: ({ children }: PropsWithChildren) => (
      <ol className='my-3 ml-6 list-decimal space-y-1'>{children}</ol>
    ),
    li: ({ children }: PropsWithChildren) => (
      <li className='leading-relaxed'>{children}</li>
    ),
    code: ({ children }: PropsWithChildren) => (
      <code className='bg-muted px-1.5 py-0.5 rounded text-sm font-mono'>
        {children}
      </code>
    ),
    pre: ({ children }: PropsWithChildren) => (
      <pre className='bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm'>
        {children}
      </pre>
    ),
    a: ({ href, children }: AnchorProps) => (
      <a
        href={href}
        className='text-primary underline underline-offset-4 hover:text-primary/80'
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: PropsWithChildren) => (
      <blockquote className='border-l-4 border-muted-foreground/30 pl-4 my-4 italic text-muted-foreground'>
        {children}
      </blockquote>
    ),
    hr: () => <hr className='my-8 border-border' />,
    table: ({ children }: PropsWithChildren) => (
      <div className='my-4 overflow-x-auto'>
        <table className='min-w-full border-collapse text-sm'>{children}</table>
      </div>
    ),
    thead: ({ children }: PropsWithChildren) => (
      <thead className='bg-muted'>{children}</thead>
    ),
    th: ({ children }: PropsWithChildren) => (
      <th className='border border-border px-4 py-2 text-left font-semibold'>
        {children}
      </th>
    ),
    td: ({ children }: PropsWithChildren) => (
      <td className='border border-border px-4 py-2'>{children}</td>
    ),
    ...components,
  };
}
