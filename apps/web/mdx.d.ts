declare module '*.mdx' {
  import type { ComponentType } from 'react';
  const component: ComponentType;
  export default component;
}

declare module 'mdx/types' {
  import type { ComponentType, ReactNode } from 'react';

  export type MDXComponents = {
    [key: string]: ComponentType<{
      children?: ReactNode;
      [key: string]: unknown;
    }>;
  };
}
