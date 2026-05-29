/**
 * Tests for useManageRoles hook
 * TDD Red phase - written before implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useManageRoles } from './useAdminUserActions';
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

const mockActionResponse: AdminActionResponse = {
  message: 'Operación exitosa',
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

describe('useManageRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add and remove roles based on diff', async () => {
    vi.mocked(adminUsersApi.addTarotistRole).mockResolvedValue(mockActionResponse);
    vi.mocked(adminUsersApi.removeAdminRole).mockResolvedValue(mockActionResponse);

    const { result } = renderHook(() => useManageRoles(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 1,
      toAdd: ['tarotist'],
      toRemove: ['admin'],
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminUsersApi.addTarotistRole).toHaveBeenCalledWith(1);
    expect(adminUsersApi.removeAdminRole).toHaveBeenCalledWith(1);
  });

  it('should only add roles when toRemove is empty', async () => {
    vi.mocked(adminUsersApi.addAdminRole).mockResolvedValue(mockActionResponse);

    const { result } = renderHook(() => useManageRoles(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 1,
      toAdd: ['admin'],
      toRemove: [],
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminUsersApi.addAdminRole).toHaveBeenCalledWith(1);
    expect(adminUsersApi.removeTarotistRole).not.toHaveBeenCalled();
  });

  it('should only remove roles when toAdd is empty', async () => {
    vi.mocked(adminUsersApi.removeTarotistRole).mockResolvedValue(mockActionResponse);

    const { result } = renderHook(() => useManageRoles(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 1,
      toAdd: [],
      toRemove: ['tarotist'],
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminUsersApi.removeTarotistRole).toHaveBeenCalledWith(1);
    expect(adminUsersApi.addAdminRole).not.toHaveBeenCalled();
  });

  it('should handle error in role mutation', async () => {
    vi.mocked(adminUsersApi.addTarotistRole).mockRejectedValue(new Error('Failed to add role'));

    const { result } = renderHook(() => useManageRoles(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 1,
      toAdd: ['tarotist'],
      toRemove: [],
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
