import * as React from 'react';

export interface UseInViewportOptions {
  /** Passed through to IntersectionObserver's `rootMargin`. */
  rootMargin?: string;
  /** Passed through to IntersectionObserver's `threshold`. */
  threshold?: number | number[];
  /** Once the element has entered the viewport, stop observing it. */
  triggerOnce?: boolean;
}

/**
 * Tracks whether an element has entered the viewport, backed by a single
 * IntersectionObserver per element (no scroll/resize polling).
 *
 * Returns a ref callback to attach to the observed element and a boolean
 * flag for whether it's currently (or has ever, with `triggerOnce`) been
 * in view. Intended for lightweight scroll-reveal effects - see `Reveal`.
 */
export function useInViewport<T extends Element>(
  options: UseInViewportOptions = {}
): [React.RefCallback<T>, boolean] {
  const { rootMargin = '0px', threshold = 0.1, triggerOnce = true } = options;
  const [isInViewport, setIsInViewport] = React.useState(false);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const setRef = React.useCallback<React.RefCallback<T>>(
    (node) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || typeof IntersectionObserver === 'undefined') return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          if (entry.isIntersecting) {
            setIsInViewport(true);
            if (triggerOnce) observerRef.current?.disconnect();
          } else if (!triggerOnce) {
            setIsInViewport(false);
          }
        },
        { rootMargin, threshold }
      );
      observerRef.current.observe(node);
    },
    [rootMargin, threshold, triggerOnce]
  );

  React.useEffect(() => () => observerRef.current?.disconnect(), []);

  return [setRef, isInViewport];
}
