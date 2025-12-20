/**
 * Tests for useAdminUsers hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminUsers } from './useAdminUsers';
import * as adminUsersApi from '@/lib/api/admin-users-api';
import type { AdminUsersResponse, UserFilters } from '@/types/admin-users.types';

// Mock API module
vi.mock('@/lib/api/admin-users-api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('useAdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch admin users successfully', async () => {
    const mockResponse: AdminUsersResponse = {
      data: [
        {
          id: 1,
          email: 'test@test.com',
          name: 'Test User',
          roles: ['consumer'],
          plan: 'free',
          lastLogin: '2025-12-01T10:00:00Z',
          createdAt: '2025-11-01T10:00:00Z',
          updatedAt: '2025-12-01T10:00:00Z',
          bannedAt: null,
          banReason: null,
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      },
    };

    vi.mocked(adminUsersApi.fetchAdminUsers).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(adminUsersApi.fetchAdminUsers).toHaveBeenCalledWith({});
  });

  it('should apply filters when provided', async () => {
    const filters: UserFilters = {
      search: 'test',
      role: 'consumer',
      page: 2,
      limit: 20,
    };

    const mockResponse: AdminUsersResponse = {
      data: [],
      meta: {
        page: 2,
        limit: 20,
        totalItems: 0,
        totalPages: 0,
      },
    };

    vi.mocked(adminUsersApi.fetchAdminUsers).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAdminUsers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminUsersApi.fetchAdminUsers).toHaveBeenCalledWith(filters);
  });

  it('should handle errors', async () => {
    const errorMessage = 'Failed to fetch users';
    vi.mocked(adminUsersApi.fetchAdminUsers).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should show loading state initially', () => {
    vi.mocked(adminUsersApi.fetchAdminUsers).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
