/**
 * Tests for admin-security-api
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { fetchRateLimitData, fetchSecurityEvents } from './admin-security-api';
import type { RateLimitResponse, SecurityEventsResponse } from '@/types/admin-security.types';

vi.mock('./axios-config');

describe('admin-security-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRateLimitData', () => {
    it('should fetch rate limit data with violations and blocked IPs', async () => {
      const mockData: RateLimitResponse = {
        violations: [
          {
            ipAddress: '192.168.1.1',
            count: 10,
            firstViolation: '2024-01-01T10:00:00Z',
            lastViolation: '2024-01-01T11:00:00Z',
          },
          {
            ipAddress: '192.168.1.2',
            count: 5,
            firstViolation: '2024-01-01T09:00:00Z',
            lastViolation: '2024-01-01T09:30:00Z',
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
          totalViolations: 15,
          totalBlockedIps: 1,
          activeViolationsCount: 2,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const result = await fetchRateLimitData();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/rate-limits/violations');
      expect(result).toEqual(mockData);
      expect(result.violations).toHaveLength(2);
      expect(result.blockedIPs).toHaveLength(1);
      expect(result.violations[0].ipAddress).toBe('192.168.1.1');
      expect(result.blockedIPs[0].reason).toBe('Excessive violations');
    });
  });

  describe('fetchSecurityEvents', () => {
    it('should fetch security events with filters', async () => {
      const filters = {
        eventType: 'failed_login' as const,
        severity: 'high' as const,
        page: 1,
        limit: 10,
      };

      const mockData: SecurityEventsResponse = {
        events: [
          {
            id: 'uuid-123',
            eventType: 'failed_login',
            severity: 'high',
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const result = await fetchSecurityEvents(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/admin/security/events', {
        params: filters,
      });
      expect(result).toEqual(mockData);
      expect(result.events).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });

    it('should fetch security events without filters', async () => {
      const mockData: SecurityEventsResponse = {
        events: [],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
          totalPages: 0,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const result = await fetchSecurityEvents();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/security/events', {
        params: {},
      });
      expect(result.events).toHaveLength(0);
    });
  });
});
