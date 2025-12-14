/**
 * Tests for useAuditLogs hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useAuditLogs } from './useAuditLogs';
import * as adminAuditApi from '@/lib/api/admin-audit-api';
import type { AuditLogsResponse } from '@/types/admin-audit.types';

vi.mock('@/lib/api/admin-audit-api');

describe('useAuditLogs', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should fetch audit logs successfully', async () => {
    const mockResponse: AuditLogsResponse = {
      data: [
        {
          id: 1,
          userId: 1,
          userName: 'Admin User',
          action: 'USER_BANNED',
          entityType: 'User',
          entityId: '123',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: '2025-12-14T10:00:00Z',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        totalItems: 1,
        totalPages: 1,
      },
    };

    vi.mocked(adminAuditApi.fetchAuditLogs).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuditLogs(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(adminAuditApi.fetchAuditLogs).toHaveBeenCalledWith({});
  });

  it('should fetch audit logs with filters', async () => {
    const filters = {
      userId: 1,
      action: 'USER_BANNED' as const,
      page: 1,
      limit: 10,
    };

    const mockResponse: AuditLogsResponse = {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
      },
    };

    vi.mocked(adminAuditApi.fetchAuditLogs).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuditLogs(filters), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(adminAuditApi.fetchAuditLogs).toHaveBeenCalledWith(filters);
  });

  it('should handle errors', async () => {
    const error = new Error('API Error');
    vi.mocked(adminAuditApi.fetchAuditLogs).mockRejectedValue(error);

    const { result } = renderHook(() => useAuditLogs(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('should set correct query key with filters', async () => {
    const filters = { userId: 1 };
    vi.mocked(adminAuditApi.fetchAuditLogs).mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
    });

    const { result } = renderHook(() => useAuditLogs(filters), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verificar que se llamó con los filtros correctos
    expect(adminAuditApi.fetchAuditLogs).toHaveBeenCalledWith(filters);
  });
});
