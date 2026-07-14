/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';

import { ComposerHint } from '../composer-hint';

// jsdom doesn't implement matchMedia; stub it so `useReducedMotion` works.
// `reduced` is closed over so individual tests can flip the preference.
let reduced = false;

beforeEach(() => {
  reduced = false;
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: query.includes('reduce') ? reduced : false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('ComposerHint', () => {
  it('renders a single hint statically', () => {
    render(<ComposerHint hints="Type @ to mention a user" />);
    expect(screen.getByText('Type @ to mention a user')).toBeDefined();
  });

  it('renders nothing when not visible', () => {
    const { container } = render(
      <ComposerHint hints={['a', 'b']} visible={false} />
    );
    expect(container.textContent).toBe('');
  });

  it('renders nothing for an empty hints array', () => {
    const { container } = render(<ComposerHint hints={[]} />);
    expect(container.textContent).toBe('');
  });

  it('cycles through multiple hints on a timer', () => {
    vi.useFakeTimers();
    render(<ComposerHint hints={['first', 'second']} intervalMs={1000} />);

    expect(screen.getByText('first')).toBeDefined();

    // interval fires -> begins fade, then a short timeout swaps the text
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText('second')).toBeDefined();

    // wraps back around to the first hint
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByText('first')).toBeDefined();
  });

  it('swaps text instantly under reduced motion (no fade timeout)', () => {
    reduced = true;
    vi.useFakeTimers();
    render(<ComposerHint hints={['first', 'second']} intervalMs={1000} />);

    expect(screen.getByText('first')).toBeDefined();

    // Under reduced motion the text advances on the interval alone, with no
    // separate fade timeout.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('second')).toBeDefined();
  });
});
