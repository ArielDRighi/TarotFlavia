/**
 * Tests for useChineseHoroscopeMainPage hook
 *
 * Tests the business logic extracted from the Chinese Horoscope main page.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChineseHoroscopeMainPage } from './useChineseHoroscopeMainPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ChineseZodiacAnimal } from '@/types';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
  })),
}));

// Mock API hooks
vi.mock('@/hooks/api/useChineseHoroscope', () => ({
  useMyAnimalHoroscope: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
  useChineseHoroscopesByYear: vi.fn(() => ({
    data: undefined,
  })),
  useCalculateAnimal: vi.fn(() => ({
    data: undefined,
  })),
}));

describe('useChineseHoroscopeMainPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('should return current year', () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    expect(result.current.currentYear).toBe(new Date().getFullYear());
  });

  it('should start with modal closed', () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.selectedAnimalForModal).toBeNull();
  });

  it('should return isAuthenticated from auth hook', () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return null userBirthDate when not authenticated', () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    expect(result.current.userBirthDate).toBeNull();
  });

  it('should return null userAnimal when no horoscope', () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    expect(result.current.userAnimal).toBeNull();
  });

  it('should open modal when selecting animal (not user animal)', async () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    act(() => {
      result.current.handleAnimalSelect(ChineseZodiacAnimal.DRAGON);
    });

    await waitFor(() => {
      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.selectedAnimalForModal).toBe(ChineseZodiacAnimal.DRAGON);
    });
  });

  it('should close modal via handleModalOpenChange', async () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    // Open modal first
    act(() => {
      result.current.handleAnimalSelect(ChineseZodiacAnimal.DRAGON);
    });

    await waitFor(() => {
      expect(result.current.isModalOpen).toBe(true);
    });

    // Close modal
    act(() => {
      result.current.handleModalOpenChange(false);
    });

    await waitFor(() => {
      expect(result.current.isModalOpen).toBe(false);
    });
  });

  it('should provide handleElementSelect callback', () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    expect(typeof result.current.handleElementSelect).toBe('function');
  });

  it('should navigate to animal+element when handleElementSelect is called', async () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    // Select animal first
    act(() => {
      result.current.handleAnimalSelect(ChineseZodiacAnimal.DRAGON);
    });

    await waitFor(() => {
      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.selectedAnimalForModal).toBe(ChineseZodiacAnimal.DRAGON);
    });

    // Select element - should navigate to animal+element
    act(() => {
      result.current.handleElementSelect('fire');
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/horoscopo-chino/dragon?element=fire');
      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.selectedAnimalForModal).toBeNull();
    });
  });

  it('should return utility functions for animal info', () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    expect(result.current.getAnimalNameEs(ChineseZodiacAnimal.DRAGON)).toBe('Dragón');
    expect(result.current.getAnimalEmoji(ChineseZodiacAnimal.DRAGON)).toBe('🐉');
  });

  it('should navigate directly when animal is selected with element param', async () => {
    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    // Simulate selection from AnimalCalculator with element
    act(() => {
      result.current.handleAnimalSelect(ChineseZodiacAnimal.HORSE, 'earth');
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/horoscopo-chino/horse?element=earth');
      expect(result.current.isModalOpen).toBe(false);
    });
  });

  it('should not open modal when selecting user own animal (authenticated)', async () => {
    const { useAuth } = await import('@/hooks/useAuth');
    const { useMyAnimalHoroscope } = await import('@/hooks/api/useChineseHoroscope');

    vi.mocked(useAuth).mockReturnValue({
      user: { birthDate: '1988-06-15' } as unknown as ReturnType<typeof useAuth>['user'],
      isAuthenticated: true,
    } as unknown as ReturnType<typeof useAuth>);

    vi.mocked(useMyAnimalHoroscope).mockReturnValue({
      data: { animal: ChineseZodiacAnimal.DRAGON } as unknown as ReturnType<
        typeof useMyAnimalHoroscope
      >['data'],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useMyAnimalHoroscope>);

    const { result } = renderHook(() => useChineseHoroscopeMainPage(), { wrapper });

    act(() => {
      result.current.handleAnimalSelect(ChineseZodiacAnimal.DRAGON);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/horoscopo-chino/dragon');
      expect(result.current.isModalOpen).toBe(false);
    });
  });
});
