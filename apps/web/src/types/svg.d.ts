/**
 * SVG module declarations for TypeScript.
 *
 * `web` typechecks resolve `@scilent-one/scilent-ui` to package source, which
 * imports `*.svg` icons. scilent-ui's own `svg.d.ts` is not part of this
 * program, so web needs an equivalent ambient module.
 */
declare module '*.svg' {
  import type { FC, SVGProps } from 'react';
  const ReactComponent: FC<SVGProps<SVGSVGElement> & { title?: string }>;
  export default ReactComponent;
}
