/**
 * Tests for useAnimalHoroscopePage hook
 *
 * Tests the business logic extracted from the Chinese Horoscope Animal page.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAnimalHoroscopePage } from './useAnimalHoroscopePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useSearchParams: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
}));

// Mock auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
  })),
}));

// Mock API hooks
vi.mock('@/hooks/api/useChineseHoroscope', () => ({
  useChineseHoroscopeByElement: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
  useMyAnimalHoroscope: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
  useCalculateAnimal: vi.fn(() => ({
    data: undefined,
  })),
}));

describe('useAnimalHoroscopePage', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useParams
    vi.mocked(useParams).mockReturnValue({ animal: 'dragon' });
    // Default mock for useSearchParams
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn(() => null),
    } as unknown as ReturnType<typeof useSearchParams>);
  });

  it('should extract animal from params', () => {
    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    expect(result.current.animal).toBe('dragon');
  });

  it('should mark dragon as valid animal', () => {
    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    expect(result.current.isValidAnimal).toBe(true);
    expect(result.current.animalInfo).not.toBeNull();
    expect(result.current.animalInfo?.nameEs).toBe('Dragón');
  });

  it('should mark invalid animal as invalid', () => {
    vi.mocked(useParams).mockReturnValue({ animal: 'unicorn' });

    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    expect(result.current.isValidAnimal).toBe(false);
    expect(result.current.animalInfo).toBeNull();
  });

  it('should return current year', () => {
    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    expect(result.current.currentYear).toBe(new Date().getFullYear());
  });

  it('should not be myAnimal when user is not authenticated', () => {
    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    expect(result.current.isMyAnimal).toBe(false);
  });

  it('should return null element when no year selected and not authenticated', () => {
    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    expect(result.current.element).toBeNull();
  });

  it('should get element from query param when provided', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn((key: string) => (key === 'element' ? 'fire' : null)),
    } as unknown as ReturnType<typeof useSearchParams>);

    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    await waitFor(() => {
      expect(result.current.element).toBe('fire');
    });
  });

  it('should provide showElementModal flag when element is missing', () => {
    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    // No element in query and not my animal -> should show modal
    expect(result.current.showElementModal).toBe(true);
  });

  it('should not show element modal when element is provided in query', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn((key: string) => (key === 'element' ? 'fire' : null)),
    } as unknown as ReturnType<typeof useSearchParams>);

    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    await waitFor(() => {
      expect(result.current.showElementModal).toBe(false);
    });
  });

  it('should return loading state', () => {
    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    expect(result.current.isLoading).toBe(false);
  });

  it('should return error state', () => {
    const { result } = renderHook(() => useAnimalHoroscopePage(), { wrapper });

    expect(result.current.error).toBeNull();
  });
});
