'use client';

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { cn } from '../utils';

type ScrollShadowOrientation = 'vertical' | 'horizontal' | 'both';

interface ScrollAreaProps extends React.ComponentProps<
  typeof ScrollAreaPrimitive.Root
> {
  /** Show scroll shadows to indicate more content */
  showShadow?: boolean;
  /** Shadow orientation - defaults to "vertical" */
  shadowOrientation?: ScrollShadowOrientation;
  /** Custom shadow size in pixels - defaults to 40 */
  shadowSize?: number;
  /** Ref to access the scrollable viewport element (useful for virtualization) */
  viewportRef?: React.RefObject<HTMLDivElement | null>;
}

function ScrollArea({
  className,
  children,
  showShadow = false,
  shadowOrientation = 'vertical',
  shadowSize = 40,
  viewportRef: externalViewportRef,
  ...props
}: ScrollAreaProps) {
  const internalViewportRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = externalViewportRef || internalViewportRef;
  const [scrollState, setScrollState] = React.useState({
    atTop: true,
    atBottom: true,
    atLeft: true,
    atRight: true,
  });

  const handleScroll = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = viewport;
    const threshold = 1; // Small threshold to account for rounding

    setScrollState({
      atTop: scrollTop <= threshold,
      atBottom: scrollTop + clientHeight >= scrollHeight - threshold,
      atLeft: scrollLeft <= threshold,
      atRight: scrollLeft + clientWidth >= scrollWidth - threshold,
    });
  }, []);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !showShadow) return;

    // Initial check
    handleScroll();

    // Set up resize observer to recalculate on size changes
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, [showShadow, handleScroll]);

  const showVerticalShadows =
    showShadow &&
    (shadowOrientation === 'vertical' || shadowOrientation === 'both');
  const showHorizontalShadows =
    showShadow &&
    (shadowOrientation === 'horizontal' || shadowOrientation === 'both');

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
        onScroll={showShadow ? handleScroll : undefined}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {/* Scroll shadows */}
      {showVerticalShadows && (
        <>
          <div
            data-slot="scroll-shadow-top"
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 z-10 rounded-t-[inherit] bg-linear-to-b from-black/15 to-transparent transition-opacity duration-200',
              scrollState.atTop ? 'opacity-0' : 'opacity-100'
            )}
            style={{ height: shadowSize }}
            aria-hidden="true"
          />
          <div
            data-slot="scroll-shadow-bottom"
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-0 z-10 rounded-b-[inherit] bg-linear-to-t from-black/15 to-transparent transition-opacity duration-200',
              scrollState.atBottom ? 'opacity-0' : 'opacity-100'
            )}
            style={{ height: shadowSize }}
            aria-hidden="true"
          />
        </>
      )}
      {showHorizontalShadows && (
        <>
          <div
            data-slot="scroll-shadow-left"
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 z-10 rounded-l-[inherit] bg-linear-to-r from-black/15 to-transparent transition-opacity duration-200',
              scrollState.atLeft ? 'opacity-0' : 'opacity-100'
            )}
            style={{ width: shadowSize }}
            aria-hidden="true"
          />
          <div
            data-slot="scroll-shadow-right"
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 z-10 rounded-r-[inherit] bg-linear-to-l from-black/15 to-transparent transition-opacity duration-200',
              scrollState.atRight ? 'opacity-0' : 'opacity-100'
            )}
            style={{ width: shadowSize }}
            aria-hidden="true"
          />
        </>
      )}

      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none',
        orientation === 'vertical' &&
          'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' &&
          'h-2.5 flex-col border-t border-t-transparent',
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
