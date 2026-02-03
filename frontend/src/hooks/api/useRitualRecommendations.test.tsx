import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRitualRecommendations } from './useRitualRecommendations';
import { getRitualRecommendations } from '@/lib/api/rituals-api';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser, AuthStore } from '@/types';

// Mock dependencies
vi.mock('@/lib/api/rituals-api');
vi.mock('@/stores/authStore');

describe('useRitualRecommendations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  it('should return query result when user is premium', async () => {
    const mockRecommendations = {
      hasRecommendations: true,
      recommendations: [
        {
          pattern: 'heartbreak' as const,
          message: 'Detectamos un patrón de desamor en tus lecturas recientes',
          suggestedCategories: ['love', 'healing'],
        },
      ],
    };

    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 1, plan: 'premium' } as AuthUser,
      isAuthenticated: true,
      isLoading: false,
      _hasHydrated: true,
      setUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      setHasHydrated: vi.fn(),
    } as AuthStore);

    vi.mocked(getRitualRecommendations).mockResolvedValue(mockRecommendations);

    const { result } = renderHook(() => useRitualRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRecommendations);
    expect(getRitualRecommendations).toHaveBeenCalledTimes(1);
  });

  it('should not fetch when user is not premium', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 1, plan: 'free' } as AuthUser,
      isAuthenticated: true,
      isLoading: false,
      _hasHydrated: true,
      setUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      setHasHydrated: vi.fn(),
    } as AuthStore);

    const { result } = renderHook(() => useRitualRecommendations(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.fetchStatus).toBe('idle');
    expect(getRitualRecommendations).not.toHaveBeenCalled();
  });

  it('should not fetch when user is null', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: true,
      setUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      setHasHydrated: vi.fn(),
    } as AuthStore);

    const { result } = renderHook(() => useRitualRecommendations(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.fetchStatus).toBe('idle');
    expect(getRitualRecommendations).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 1, plan: 'premium' } as AuthUser,
      isAuthenticated: true,
      isLoading: false,
      _hasHydrated: true,
      setUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      setHasHydrated: vi.fn(),
    } as AuthStore);

    const mockError = new Error('Network error');
    vi.mocked(getRitualRecommendations).mockRejectedValue(mockError);

    const { result } = renderHook(() => useRitualRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('should use correct query key', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 1, plan: 'premium' } as AuthUser,
      isAuthenticated: true,
      isLoading: false,
      _hasHydrated: true,
      setUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      setHasHydrated: vi.fn(),
    } as AuthStore);

    renderHook(() => useRitualRecommendations(), { wrapper });

    // Check that the query key matches the expected format
    const queries = queryClient.getQueryCache().getAll();
    expect(queries.length).toBeGreaterThan(0);

    const query = queries[0];
    expect(query.queryKey).toEqual(['rituals', 'recommendations']);
  });
});
