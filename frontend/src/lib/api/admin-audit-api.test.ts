/**
 * Tests for admin-audit-api
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAuditLogs } from './admin-audit-api';
import { apiClient } from './axios-config';
import type { AuditLogsResponse, AuditLogFilters } from '@/types/admin-audit.types';

vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('admin-audit-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAuditLogs', () => {
    it('should fetch audit logs without filters', async () => {
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await fetchAuditLogs();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it('should fetch audit logs with filters', async () => {
      const filters: AuditLogFilters = {
        userId: 1,
        action: 'USER_BANNED',
        entityType: 'User',
        startDate: '2025-12-01',
        endDate: '2025-12-14',
        page: 2,
        limit: 10,
      };

      const mockResponse: AuditLogsResponse = {
        data: [],
        meta: {
          page: 2,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await fetchAuditLogs(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: filters,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(fetchAuditLogs()).rejects.toThrow('API Error');
    });
  });
});
