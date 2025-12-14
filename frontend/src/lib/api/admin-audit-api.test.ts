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
        logs: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            userId: 1,
            user: { id: 1, email: 'admin@example.com', name: 'Admin User' },
            targetUserId: 2,
            targetUser: { id: 2, email: 'user@example.com', name: 'Target User' },
            action: 'user_banned',
            entityType: 'User',
            entityId: '123',
            oldValue: null,
            newValue: { status: 'banned' },
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
            createdAt: '2025-12-14T10:00:00Z',
          },
        ],
        meta: {
          currentPage: 1,
          itemsPerPage: 20,
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
        action: 'user_banned',
        entityType: 'User',
        startDate: '2025-12-01',
        endDate: '2025-12-14',
        page: 2,
        limit: 10,
      };

      const mockResponse: AuditLogsResponse = {
        logs: [],
        meta: {
          currentPage: 2,
          itemsPerPage: 10,
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
