/**
 * Tests for useAdminSecurity hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import * as securityApi from '@/lib/api/admin-security-api';
import {
  useRateLimitViolations,
  useBlockedIPs,
  useSecurityEvents,
  useBlockIP,
  useUnblockIP,
} from './useAdminSecurity';

vi.mock('@/lib/api/admin-security-api');

describe('useAdminSecurity hooks', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('useRateLimitViolations', () => {
    it('should fetch rate limit violations', async () => {
      const mockData = [
        {
          ip: '192.168.1.1',
          count: 10,
          firstViolation: '2024-01-01T10:00:00Z',
          lastViolation: '2024-01-01T11:00:00Z',
        },
      ];

      vi.mocked(securityApi.fetchRateLimitViolations).mockResolvedValue(mockData);

      const { result } = renderHook(() => useRateLimitViolations(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(securityApi.fetchRateLimitViolations).toHaveBeenCalled();
    });
  });

  describe('useBlockedIPs', () => {
    it('should fetch blocked IPs', async () => {
      const mockData = [
        {
          ip: '10.0.0.1',
          reason: 'Excessive violations',
          blockedAt: '2024-01-01T12:00:00Z',
          expiresAt: '2024-01-08T12:00:00Z',
        },
      ];

      vi.mocked(securityApi.fetchBlockedIPs).mockResolvedValue(mockData);

      const { result } = renderHook(() => useBlockedIPs(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(securityApi.fetchBlockedIPs).toHaveBeenCalled();
    });
  });

  describe('useSecurityEvents', () => {
    it('should fetch security events with filters', async () => {
      const filters = {
        eventType: 'login_failed' as const,
        severity: 'high' as const,
        page: 1,
        limit: 10,
      };

      const mockData = {
        data: [
          {
            id: 1,
            eventType: 'login_failed' as const,
            severity: 'high' as const,
            userId: 123,
            ip: '192.168.1.50',
            description: 'Multiple failed login attempts',
            createdAt: '2024-01-01T10:00:00Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
        },
      };

      vi.mocked(securityApi.fetchSecurityEvents).mockResolvedValue(mockData);

      const { result } = renderHook(() => useSecurityEvents(filters), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(securityApi.fetchSecurityEvents).toHaveBeenCalledWith(filters);
    });
  });

  describe('useBlockIP', () => {
    it('should block IP successfully', async () => {
      const mockResponse = {
        message: 'IP bloqueada exitosamente',
        ip: '192.168.1.100',
      };

      vi.mocked(securityApi.blockIP).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBlockIP(), { wrapper });

      const dto = {
        ip: '192.168.1.100',
        reason: 'Malicious activity',
      };

      await act(async () => {
        result.current.mutate(dto);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(securityApi.blockIP).toHaveBeenCalledWith(dto);
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useUnblockIP', () => {
    it('should unblock IP successfully', async () => {
      const mockResponse = {
        message: 'IP desbloqueada exitosamente',
        ip: '192.168.1.100',
      };

      vi.mocked(securityApi.unblockIP).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUnblockIP(), { wrapper });

      const ip = '192.168.1.100';

      await act(async () => {
        result.current.mutate(ip);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(securityApi.unblockIP).toHaveBeenCalledWith(ip);
      expect(result.current.data).toEqual(mockResponse);
    });
  });
});
