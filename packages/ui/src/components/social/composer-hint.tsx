'use client';

import * as React from 'react';

import { cn } from '../../utils';
import { useReducedMotion } from '../../hooks/use-reduced-motion';

// Matches the `duration-fast` utility (150ms) so the swap happens right as
// the fade-out finishes.
const FADE_DURATION_MS = 150;

export interface ComposerHintProps {
  /** One or more hint strings; cycles between them when more than one is given. */
  hints: string | string[];
  /** Whether the hint is shown at all (e.g. parent passes `editor.isEmpty`). */
  visible?: boolean;
  /** Ms each hint is shown before cycling to the next. Default 3000. */
  intervalMs?: number;
  className?: string;
}

/**
 * Shows one or more hint strings, cycling between them with a fade in/out
 * transition when more than one is provided. Designed to be inset inside a
 * composer's text input (position it via `className`), mirroring the look of
 * the Tiptap placeholder (`text-muted-foreground italic`).
 *
 * Coordinates the fade in JS (rather than one-shot keyframes) so the same
 * element can cross-fade repeatedly without remounting, following the same
 * plain-CSS `transition-opacity` convention as {@link Reveal}. Honors
 * `prefers-reduced-motion` by swapping text instantly; the content rotation
 * itself is preserved since it's not motion in the accessibility sense.
 *
 * @example
 * ```tsx
 * <ComposerHint
 *   hints={['Type @ to mention a user', 'Type # to mention an Artist']}
 *   visible={editor?.isEmpty ?? false}
 *   className="absolute left-3 top-1/2 -translate-y-1/2"
 * />
 * ```
 */
export function ComposerHint({
  hints,
  visible = true,
  intervalMs = 3000,
  className,
}: ComposerHintProps) {
  const prefersReducedMotion = useReducedMotion();

  const hintsArray = React.useMemo(
    () => (Array.isArray(hints) ? hints : [hints]),
    [hints]
  );

  const [index, setIndex] = React.useState(0);
  const [fading, setFading] = React.useState(false);

  const shouldCycle = visible && hintsArray.length > 1;

  // Reset to the first hint whenever the set of hints changes or the hint is
  // hidden, so it always starts from the top when it reappears.
  React.useEffect(() => {
    setIndex(0);
    setFading(false);
  }, [hintsArray, visible]);

  React.useEffect(() => {
    if (!shouldCycle) return;

    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      if (prefersReducedMotion) {
        setIndex((i) => (i + 1) % hintsArray.length);
        return;
      }

      setFading(true);
      fadeTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % hintsArray.length);
        setFading(false);
      }, FADE_DURATION_MS);
    }, intervalMs);

    return () => {
      clearInterval(interval);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [shouldCycle, hintsArray, intervalMs, prefersReducedMotion]);

  if (!visible || hintsArray.length === 0) return null;

  const current = hintsArray[index] ?? hintsArray[0];

  return (
    <span
      aria-live="polite"
      className={cn(
        'pointer-events-none select-none truncate text-sm italic text-muted-foreground transition-opacity',
        prefersReducedMotion ? 'duration-instant' : 'duration-fast',
        fading ? 'opacity-0 ease-in' : 'opacity-100 ease-out',
        className
      )}
    >
      {current}
    </span>
  );
}
