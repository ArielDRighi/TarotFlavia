/**
 * Tests for admin-security-api
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  fetchRateLimitViolations,
  fetchBlockedIPs,
  blockIP,
  unblockIP,
  fetchSecurityEvents,
} from './admin-security-api';
import type {
  RateLimitViolation,
  BlockedIP,
  SecurityEventsResponse,
  BlockIPDto,
  IPActionResponse,
} from '@/types/admin-security.types';

vi.mock('./axios-config');

describe('admin-security-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRateLimitViolations', () => {
    it('should fetch rate limit violations successfully', async () => {
      const mockData: RateLimitViolation[] = [
        {
          ip: '192.168.1.1',
          count: 10,
          firstViolation: '2024-01-01T10:00:00Z',
          lastViolation: '2024-01-01T11:00:00Z',
        },
        {
          ip: '192.168.1.2',
          count: 5,
          firstViolation: '2024-01-01T09:00:00Z',
          lastViolation: '2024-01-01T09:30:00Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const result = await fetchRateLimitViolations();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/rate-limits/violations');
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
      expect(result[0].ip).toBe('192.168.1.1');
    });
  });

  describe('fetchBlockedIPs', () => {
    it('should fetch blocked IPs successfully', async () => {
      const mockData: BlockedIP[] = [
        {
          ip: '10.0.0.1',
          reason: 'Excessive violations',
          blockedAt: '2024-01-01T12:00:00Z',
          expiresAt: '2024-01-08T12:00:00Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const result = await fetchBlockedIPs();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/rate-limits/blocked-ips');
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(1);
      expect(result[0].reason).toBe('Excessive violations');
    });
  });

  describe('blockIP', () => {
    it('should block IP successfully', async () => {
      const dto: BlockIPDto = {
        ip: '192.168.1.100',
        reason: 'Malicious activity',
      };

      const mockResponse: IPActionResponse = {
        message: 'IP bloqueada exitosamente',
        ip: '192.168.1.100',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await blockIP(dto);

      expect(apiClient.post).toHaveBeenCalledWith('/admin/rate-limits/block-ip', dto);
      expect(result).toEqual(mockResponse);
      expect(result.ip).toBe('192.168.1.100');
    });
  });

  describe('unblockIP', () => {
    it('should unblock IP successfully', async () => {
      const ip = '192.168.1.100';

      const mockResponse: IPActionResponse = {
        message: 'IP desbloqueada exitosamente',
        ip,
      };

      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse });

      const result = await unblockIP(ip);

      expect(apiClient.delete).toHaveBeenCalledWith(`/admin/rate-limits/unblock-ip/${ip}`);
      expect(result).toEqual(mockResponse);
      expect(result.ip).toBe(ip);
    });
  });

  describe('fetchSecurityEvents', () => {
    it('should fetch security events with filters', async () => {
      const filters = {
        eventType: 'login_failed' as const,
        severity: 'high' as const,
        page: 1,
        limit: 10,
      };

      const mockData: SecurityEventsResponse = {
        data: [
          {
            id: 1,
            eventType: 'login_failed',
            severity: 'high',
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const result = await fetchSecurityEvents(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/admin/security/events', {
        params: filters,
      });
      expect(result).toEqual(mockData);
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });

    it('should fetch security events without filters', async () => {
      const mockData: SecurityEventsResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const result = await fetchSecurityEvents();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/security/events', {
        params: {},
      });
      expect(result.data).toHaveLength(0);
    });
  });
});
