import * as React from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Hook to detect the user's `prefers-reduced-motion` preference.
 *
 * CSS alone (see `globals.css`) already clamps every transition/animation
 * duration under reduced motion, so most components never need this hook.
 * Reach for it only when an animation is *coordinated in JS* and a CSS media
 * query can't express the opt-out cleanly - e.g. skipping a computed
 * `animationDelay` stagger, or deciding whether to run an IntersectionObserver
 * reveal at all.
 *
 * SSR-safe: returns `false` during SSR/initial hydration, then updates
 * synchronously on the client before paint.
 *
 * @returns `true` if the user prefers reduced motion, `false` otherwise
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    React.useState<boolean>(() => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia(QUERY).matches;
    });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(QUERY);
    const onChange = () => setPrefersReducedMotion(mql.matches);

    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return prefersReducedMotion;
}
