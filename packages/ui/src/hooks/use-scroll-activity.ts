import * as React from 'react';

export interface UseScrollActivityOptions {
  /** Delay in ms after the last scroll event before activity is considered idle. */
  idleDelay?: number;
}

/**
 * Tracks whether a scroll container is actively being scrolled.
 *
 * Returns `true` while scroll events are firing and for `idleDelay` ms after
 * the last one, then `false`. Useful for driving a "scrolling" visual state -
 * e.g. revealing or accenting a custom scrollbar thumb - on plain native
 * `overflow` containers without adopting a full `<ScrollArea>`.
 *
 * Performance: state only flips on the leading edge (idle -> active) and after
 * the trailing debounce (active -> idle), so scrolling does not trigger a
 * re-render per frame.
 *
 * @param ref - Ref to the scrollable element to observe.
 * @param options - `idleDelay` (default 700ms).
 * @returns `true` while scrolling, `false` when idle.
 */
export function useScrollActivity(
  ref: React.RefObject<HTMLElement | null>,
  options: UseScrollActivityOptions = {}
): boolean {
  const { idleDelay = 700 } = options;
  const [isScrolling, setIsScrolling] = React.useState(false);
  const activeRef = React.useRef(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleScroll = () => {
      if (!activeRef.current) {
        activeRef.current = true;
        setIsScrolling(true);
      }
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        activeRef.current = false;
        setIsScrolling(false);
      }, idleDelay);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [ref, idleDelay]);

  return isScrolling;
}
