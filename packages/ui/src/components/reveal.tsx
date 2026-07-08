'use client';

import * as React from 'react';

import { cn } from '../utils';
import { useInViewport } from '../hooks/use-in-viewport';
import { useReducedMotion } from '../hooks/use-reduced-motion';

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 0-based position of this item within its list. Used to stagger the
   * reveal so cards cascade in instead of popping in all at once.
   */
  index?: number;
  /**
   * Items beyond this index reveal with no extra delay, so long lists don't
   * feel sluggish on first render.
   */
  maxStaggerIndex?: number;
  /** Delay (ms) applied per stagger step, capped at `maxStaggerIndex`. */
  staggerStepMs?: number;
}

/**
 * Fades + slides its children into view the first time they scroll into the
 * viewport, via a single shared IntersectionObserver per instance (no
 * scroll/resize listeners). Pairs an `index` prop with a capped
 * `animation-delay` so list/grid items cascade in with a subtle stagger.
 *
 * Renders children immediately, with no transition, when the user prefers
 * reduced motion.
 *
 * @example
 * ```tsx
 * {items.map((item, i) => (
 *   <Reveal key={item.id} index={i}>
 *     <Card {...item} />
 *   </Reveal>
 * ))}
 * ```
 */
export function Reveal({
  index = 0,
  maxStaggerIndex = 8,
  staggerStepMs = 40,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const [ref, isInViewport] = useInViewport<HTMLDivElement>({
    rootMargin: '0px 0px -10% 0px',
  });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  const delayMs = Math.min(index, maxStaggerIndex) * staggerStepMs;

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-slow ease-out',
        isInViewport ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        className
      )}
      style={{
        transitionDelay: isInViewport ? `${delayMs}ms` : '0ms',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
