/**
 * Tests for public-plans-api
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { fetchPublicPlans } from './public-plans-api';
import type { PlanConfig } from '@/types/admin.types';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('public-plans-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchPublicPlans', () => {
    it('should call the public plan-config endpoint', async () => {
      const mockPlans: PlanConfig[] = [
        {
          id: 1,
          planType: 'free',
          name: 'Plan Gratuito',
          description: 'Empieza tu viaje espiritual',
          price: 0,
          readingsLimit: 3,
          aiQuotaMonthly: 0,
          allowCustomQuestions: false,
          allowSharing: false,
          allowAdvancedSpreads: false,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 2,
          planType: 'premium',
          name: 'Plan Premium',
          description: 'Acceso completo a todas las funciones',
          price: 9.99,
          readingsLimit: -1,
          aiQuotaMonthly: -1,
          allowCustomQuestions: true,
          allowSharing: true,
          allowAdvancedSpreads: true,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPlans });

      await fetchPublicPlans();

      expect(apiClient.get).toHaveBeenCalledWith('/plan-config/public');
    });

    it('should return plans with price normalized to number', async () => {
      // Simulate TypeORM serializing decimal columns as strings at runtime
      const backendResponse = [
        {
          id: 1,
          planType: 'free',
          name: 'Plan Gratuito',
          description: 'Empieza tu viaje espiritual',
          price: '0.00', // string — TypeORM decimal serialization
          readingsLimit: 3,
          aiQuotaMonthly: 0,
          allowCustomQuestions: false,
          allowSharing: false,
          allowAdvancedSpreads: false,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 2,
          planType: 'premium',
          name: 'Plan Premium',
          description: 'Acceso completo a todas las funciones',
          price: '9.99', // string — TypeORM decimal serialization
          readingsLimit: -1,
          aiQuotaMonthly: -1,
          allowCustomQuestions: true,
          allowSharing: true,
          allowAdvancedSpreads: true,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: backendResponse });

      const result = await fetchPublicPlans();

      expect(typeof result[0].price).toBe('number');
      expect(typeof result[1].price).toBe('number');
      expect(result[0].price).toBe(0);
      expect(result[1].price).toBe(9.99);
    });

    it('should preserve all other plan fields after normalization', async () => {
      const mockPlan: PlanConfig = {
        id: 2,
        planType: 'premium',
        name: 'Plan Premium',
        description: 'Acceso completo a todas las funciones',
        price: 9.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockPlan] });

      const result = await fetchPublicPlans();

      expect(result[0]).toMatchObject({
        id: 2,
        planType: 'premium',
        name: 'Plan Premium',
        isActive: true,
        price: 9.99,
      });
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network Error'));

      await expect(fetchPublicPlans()).rejects.toThrow('Network Error');
    });

    it('should return an empty array when backend returns empty list', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await fetchPublicPlans();

      expect(result).toEqual([]);
    });
  });
});
