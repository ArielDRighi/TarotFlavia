/**
 * Tests for useAdminSecurity hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import * as securityApi from '@/lib/api/admin-security-api';
import { useRateLimitData, useSecurityEvents } from './useAdminSecurity';

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

  describe('useRateLimitData', () => {
    it('should fetch rate limit data with violations and blocked IPs', async () => {
      const mockData = {
        violations: [
          {
            ipAddress: '192.168.1.1',
            count: 10,
            firstViolation: '2024-01-01T10:00:00Z',
            lastViolation: '2024-01-01T11:00:00Z',
          },
        ],
        blockedIPs: [
          {
            ipAddress: '10.0.0.1',
            reason: 'Excessive violations',
            blockedAt: '2024-01-01T12:00:00Z',
            expiresAt: '2024-01-08T12:00:00Z',
          },
        ],
        stats: {
          totalViolations: 10,
          totalBlockedIps: 1,
          activeViolationsCount: 1,
        },
      };

      vi.mocked(securityApi.fetchRateLimitData).mockResolvedValue(mockData);

      const { result } = renderHook(() => useRateLimitData(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(result.current.data?.violations).toHaveLength(1);
      expect(result.current.data?.blockedIPs).toHaveLength(1);
      expect(securityApi.fetchRateLimitData).toHaveBeenCalled();
    });
  });

  describe('useSecurityEvents', () => {
    it('should fetch security events with filters', async () => {
      const filters = {
        eventType: 'failed_login' as const,
        severity: 'high' as const,
        page: 1,
        limit: 10,
      };

      const mockData = {
        events: [
          {
            id: 'uuid-123',
            eventType: 'failed_login' as const,
            severity: 'high' as const,
            userId: 123,
            ipAddress: '192.168.1.50',
            details: 'Multiple failed login attempts',
            createdAt: '2024-01-01T10:00:00Z',
          },
        ],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 1,
          totalPages: 1,
        },
      };

      vi.mocked(securityApi.fetchSecurityEvents).mockResolvedValue(mockData);

      const { result } = renderHook(() => useSecurityEvents(filters), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(result.current.data?.events).toHaveLength(1);
      expect(result.current.data?.events[0].ipAddress).toBe('192.168.1.50');
      expect(securityApi.fetchSecurityEvents).toHaveBeenCalledWith(filters);
    });
  });
});
