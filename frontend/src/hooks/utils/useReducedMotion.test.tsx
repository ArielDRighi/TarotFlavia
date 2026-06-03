import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useReducedMotion } from './useReducedMotion';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ChangeHandler = (event: MediaQueryListEvent) => void;

/**
 * Installs a controllable `matchMedia` mock and returns a setter to flip the
 * `matches` value and emit a `change` event, simulating the user toggling the
 * OS "reduce motion" preference at runtime.
 */
function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const handlers = new Set<ChangeHandler>();

  const mql = {
    get matches() {
      return matches;
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_: string, handler: ChangeHandler) => {
      handlers.add(handler);
    },
    removeEventListener: (_: string, handler: ChangeHandler) => {
      handlers.delete(handler);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => mql),
  });

  return {
    emit(next: boolean) {
      matches = next;
      handlers.forEach((handler) => handler({ matches } as MediaQueryListEvent));
    },
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when the user has no reduced-motion preference', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('returns true when the user prefers reduced motion', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('reacts to runtime changes of the preference', () => {
    const media = mockMatchMedia(false);

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      media.emit(true);
    });

    expect(result.current).toBe(true);
  });
});
