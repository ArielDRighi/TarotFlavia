/**
 * Tests for useLocalToday — local-midnight rollover.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalToday } from './useLocalToday';

describe('useLocalToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns the current LOCAL calendar date', () => {
    vi.setSystemTime(new Date(2026, 6, 25, 10, 0, 0)); // 2026-07-25 10:00 local

    const { result } = renderHook(() => useLocalToday());

    expect(result.current).toBe('2026-07-25');
  });

  it('rolls over to the next day at local midnight', () => {
    vi.setSystemTime(new Date(2026, 6, 25, 23, 59, 50)); // 10s before local midnight

    const { result } = renderHook(() => useLocalToday());
    expect(result.current).toBe('2026-07-25');

    // Cross local midnight (timer is scheduled for +2s past 00:00).
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current).toBe('2026-07-26');
  });

  it('reschedules for the following midnight after a rollover', () => {
    vi.setSystemTime(new Date(2026, 6, 25, 23, 59, 50));

    const { result } = renderHook(() => useLocalToday());

    act(() => {
      vi.advanceTimersByTime(60_000); // → 2026-07-26
    });
    expect(result.current).toBe('2026-07-26');

    act(() => {
      vi.advanceTimersByTime(24 * 60 * 60_000); // a full day later → 2026-07-27
    });
    expect(result.current).toBe('2026-07-27');
  });

  it('clears the scheduled timer on unmount', () => {
    vi.setSystemTime(new Date(2026, 6, 25, 23, 59, 50));
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');

    const { unmount } = renderHook(() => useLocalToday());
    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });
});
