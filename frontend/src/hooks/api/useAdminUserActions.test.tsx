/**
 * Tests for useAdminUserActions hook (mutations)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useBanUser,
  useUnbanUser,
  useUpdateUserPlan,
  useAddTarotistRole,
  useRemoveTarotistRole,
} from './useAdminUserActions';
import * as adminUsersApi from '@/lib/api/admin-users-api';
import type { AdminActionResponse } from '@/types/admin-users.types';

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

describe('useBanUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should ban user successfully', async () => {
    const mockResponse: AdminActionResponse = {
      message: 'Usuario baneado exitosamente',
      user: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: ['consumer'],
        plan: 'free',
        lastLogin: null,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-12-01T10:00:00Z',
        bannedAt: '2025-12-01T10:00:00Z',
        banReason: 'Spam',
      },
    };

    vi.mocked(adminUsersApi.banUser).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useBanUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userId: 1, reason: 'Spam' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(adminUsersApi.banUser).toHaveBeenCalledWith(1, { reason: 'Spam' });
  });

  it('should handle ban user error', async () => {
    vi.mocked(adminUsersApi.banUser).mockRejectedValue(new Error('Failed to ban user'));

    const { result } = renderHook(() => useBanUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userId: 1, reason: 'Test' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUnbanUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should unban user successfully', async () => {
    const mockResponse: AdminActionResponse = {
      message: 'Usuario desbaneado exitosamente',
      user: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: ['consumer'],
        plan: 'free',
        lastLogin: null,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-12-01T10:00:00Z',
        bannedAt: null,
        banReason: null,
      },
    };

    vi.mocked(adminUsersApi.unbanUser).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUnbanUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(adminUsersApi.unbanUser).toHaveBeenCalledWith(1);
  });
});

describe('useUpdateUserPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user plan successfully', async () => {
    const mockResponse: AdminActionResponse = {
      message: 'Plan actualizado exitosamente',
      user: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: ['consumer'],
        plan: 'premium',
        lastLogin: null,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-12-01T10:00:00Z',
        bannedAt: null,
        banReason: null,
      },
    };

    vi.mocked(adminUsersApi.updateUserPlan).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateUserPlan(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userId: 1, plan: 'premium' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(adminUsersApi.updateUserPlan).toHaveBeenCalledWith(1, {
      plan: 'premium',
    });
  });
});

describe('useAddTarotistRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add tarotist role successfully', async () => {
    const mockResponse: AdminActionResponse = {
      message: 'Rol TAROTIST agregado exitosamente',
      user: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: ['consumer', 'tarotist'],
        plan: 'free',
        lastLogin: null,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-12-01T10:00:00Z',
        bannedAt: null,
        banReason: null,
      },
    };

    vi.mocked(adminUsersApi.addTarotistRole).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAddTarotistRole(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(adminUsersApi.addTarotistRole).toHaveBeenCalledWith(1);
  });
});

describe('useRemoveTarotistRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should remove tarotist role successfully', async () => {
    const mockResponse: AdminActionResponse = {
      message: 'Rol TAROTIST removido exitosamente',
      user: {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        roles: ['consumer'],
        plan: 'free',
        lastLogin: null,
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-12-01T10:00:00Z',
        bannedAt: null,
        banReason: null,
      },
    };

    vi.mocked(adminUsersApi.removeTarotistRole).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRemoveTarotistRole(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(adminUsersApi.removeTarotistRole).toHaveBeenCalledWith(1);
  });
});
