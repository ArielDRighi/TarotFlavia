import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useConversionTracking from './useConversionTracking';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useConversionTracking', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should track CTA shown event', () => {
    const { result } = renderHook(() => useConversionTracking());

    result.current.trackCTAShown('post_reading', 'free');

    expect(localStorageMock.getItem('cta_shown_post_reading')).toBeTruthy();
  });

  it('should track CTA clicked event', () => {
    const { result } = renderHook(() => useConversionTracking());

    result.current.trackCTAClicked('post_reading', 'upgrade');

    expect(localStorageMock.getItem('cta_clicked_post_reading')).toBeTruthy();
  });

  it('should check if CTA was dismissed', () => {
    const { result } = renderHook(() => useConversionTracking());

    expect(result.current.wasCTADismissed('post_reading')).toBe(false);

    // First dismissal - not dismissed yet (need 3)
    result.current.dismissCTA('post_reading');
    expect(result.current.wasCTADismissed('post_reading')).toBe(false);

    // Second dismissal - still not dismissed
    result.current.dismissCTA('post_reading');
    expect(result.current.wasCTADismissed('post_reading')).toBe(false);

    // Third dismissal - NOW it's dismissed
    result.current.dismissCTA('post_reading');
    expect(result.current.wasCTADismissed('post_reading')).toBe(true);
  });

  it('should respect max dismissal count (3)', () => {
    const { result } = renderHook(() => useConversionTracking());

    result.current.dismissCTA('limit_reached');
    result.current.dismissCTA('limit_reached');
    expect(result.current.wasCTADismissed('limit_reached')).toBe(false);

    result.current.dismissCTA('limit_reached');
    expect(result.current.wasCTADismissed('limit_reached')).toBe(true);
  });

  it('should track modal open event', () => {
    const { result } = renderHook(() => useConversionTracking());

    result.current.trackModalOpen('RegisterCTAModal');

    expect(localStorageMock.getItem('modal_open_RegisterCTAModal')).toBeTruthy();
  });

  it('should track upgrade intent', () => {
    const { result } = renderHook(() => useConversionTracking());

    result.current.trackUpgradeIntent('limit_reached');

    expect(localStorageMock.getItem('upgrade_intent_limit_reached')).toBeTruthy();
  });

  it('should return correct dismissal count', () => {
    const { result } = renderHook(() => useConversionTracking());

    expect(result.current.getDismissalCount('dashboard')).toBe(0);

    result.current.dismissCTA('dashboard');
    expect(result.current.getDismissalCount('dashboard')).toBe(1);

    result.current.dismissCTA('dashboard');
    expect(result.current.getDismissalCount('dashboard')).toBe(2);
  });

  it('should handle SSR scenario (window undefined)', () => {
    // Test that localStorage is safely accessed with optional chaining
    const { result } = renderHook(() => useConversionTracking());

    // Mock localStorage to be undefined (simulating SSR)
    const originalLocalStorage = Object.getOwnPropertyDescriptor(
      window,
      'localStorage'
    );
    
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // All methods should safely return early without errors
    expect(() => {
      result.current.trackCTAShown('post_reading', 'free');
      result.current.trackCTAClicked('post_reading', 'upgrade');
      result.current.trackModalOpen('TestModal');
      result.current.trackUpgradeIntent('test');
      result.current.dismissCTA('post_reading');
    }).not.toThrow();

    // Methods that return values should handle SSR gracefully
    expect(result.current.wasCTADismissed('post_reading')).toBe(false);
    expect(result.current.getDismissalCount('post_reading')).toBe(0);

    // Restore localStorage
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', originalLocalStorage);
    }
  });
});
