/**
 * Tests for useTarotDeck hook
 *
 * TDD: Tests written before implementation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock de useUserCapabilities
const mockUseUserCapabilities = vi.fn();
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => mockUseUserCapabilities(),
}));

// Import hook after mocks
import { useTarotDeck } from './useTarotDeck';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useTarotDeck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FREE user (canUseFullDeck: false)', () => {
    beforeEach(() => {
      mockUseUserCapabilities.mockReturnValue({
        data: {
          canUseFullDeck: false,
          plan: 'free',
          isAuthenticated: true,
        },
        isLoading: false,
      });
    });

    it('should return only 22 card indices for FREE user', () => {
      const { result } = renderHook(() => useTarotDeck(), { wrapper: createWrapper() });

      expect(result.current.deckSize).toBe(22);
    });

    it('should return indices 0-21 for FREE user (Arcanos Mayores)', () => {
      const { result } = renderHook(() => useTarotDeck(), { wrapper: createWrapper() });

      expect(result.current.cardIndices).toHaveLength(22);
      expect(result.current.cardIndices[0]).toBe(0);
      expect(result.current.cardIndices[21]).toBe(21);
    });

    it('should indicate deck is restricted for FREE user', () => {
      const { result } = renderHook(() => useTarotDeck(), { wrapper: createWrapper() });

      expect(result.current.isRestricted).toBe(true);
    });
  });

  describe('PREMIUM user (canUseFullDeck: true)', () => {
    beforeEach(() => {
      mockUseUserCapabilities.mockReturnValue({
        data: {
          canUseFullDeck: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });
    });

    it('should return 78 card indices for PREMIUM user', () => {
      const { result } = renderHook(() => useTarotDeck(), { wrapper: createWrapper() });

      expect(result.current.deckSize).toBe(78);
    });

    it('should return indices 0-77 for PREMIUM user', () => {
      const { result } = renderHook(() => useTarotDeck(), { wrapper: createWrapper() });

      expect(result.current.cardIndices).toHaveLength(78);
      expect(result.current.cardIndices[0]).toBe(0);
      expect(result.current.cardIndices[77]).toBe(77);
    });

    it('should indicate deck is not restricted for PREMIUM user', () => {
      const { result } = renderHook(() => useTarotDeck(), { wrapper: createWrapper() });

      expect(result.current.isRestricted).toBe(false);
    });
  });

  describe('Anonymous user (canUseFullDeck: false)', () => {
    beforeEach(() => {
      mockUseUserCapabilities.mockReturnValue({
        data: {
          canUseFullDeck: false,
          plan: 'anonymous',
          isAuthenticated: false,
        },
        isLoading: false,
      });
    });

    it('should return only 22 card indices for anonymous user', () => {
      const { result } = renderHook(() => useTarotDeck(), { wrapper: createWrapper() });

      expect(result.current.deckSize).toBe(22);
    });
  });

  describe('Loading state', () => {
    it('should return restricted deck (22) while capabilities are loading', () => {
      mockUseUserCapabilities.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { result } = renderHook(() => useTarotDeck(), { wrapper: createWrapper() });

      // Default to restricted deck while loading to prevent FREE/anonymous users
      // from temporarily seeing or selecting cards beyond index 21
      expect(result.current.deckSize).toBe(22);
      expect(result.current.isRestricted).toBe(true);
    });
  });
});
