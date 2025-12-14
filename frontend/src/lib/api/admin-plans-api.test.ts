/**
 * Tests for admin-plans-api
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { fetchAllPlans, fetchPlanByType, updatePlanConfig } from './admin-plans-api';
import type { PlanConfig, PlanType, UpdatePlanConfigDto } from '@/types/admin.types';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('admin-plans-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllPlans', () => {
    it('should fetch all plan configurations', async () => {
      const mockPlans: PlanConfig[] = [
        {
          id: 1,
          planType: 'free',
          name: 'Plan Gratuito',
          description: 'Plan básico con funcionalidades limitadas',
          readingsLimit: 10,
          aiQuotaMonthly: 50,
          allowCustomQuestions: false,
          allowSharing: false,
          allowAdvancedSpreads: false,
          price: 0,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          planType: 'premium',
          name: 'Plan Premium',
          description: 'Plan avanzado con todas las funcionalidades',
          readingsLimit: -1,
          aiQuotaMonthly: -1,
          allowCustomQuestions: true,
          allowSharing: true,
          allowAdvancedSpreads: true,
          price: 9.99,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPlans });

      const result = await fetchAllPlans();

      expect(apiClient.get).toHaveBeenCalledWith('/plan-config');
      expect(result).toEqual(mockPlans);
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('API Error'));

      await expect(fetchAllPlans()).rejects.toThrow('API Error');
    });
  });

  describe('fetchPlanByType', () => {
    it('should fetch a specific plan configuration', async () => {
      const mockPlan: PlanConfig = {
        id: 2,
        planType: 'premium',
        name: 'Plan Premium',
        description: 'Plan avanzado con todas las funcionalidades',
        readingsLimit: -1,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
        price: 9.99,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPlan });

      const result = await fetchPlanByType('premium');

      expect(apiClient.get).toHaveBeenCalledWith('/plan-config/premium');
      expect(result).toEqual(mockPlan);
    });

    it('should handle not found errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Plan not found'));

      await expect(fetchPlanByType('nonexistent' as PlanType)).rejects.toThrow('Plan not found');
    });
  });

  describe('updatePlanConfig', () => {
    it('should update plan configuration', async () => {
      const updateDto: UpdatePlanConfigDto = {
        readingsLimit: 50,
        price: 12.99,
      };

      const mockUpdatedPlan: PlanConfig = {
        id: 2,
        planType: 'premium',
        name: 'Plan Premium',
        description: 'Plan avanzado con todas las funcionalidades',
        readingsLimit: 50,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
        price: 12.99,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: mockUpdatedPlan });

      const result = await updatePlanConfig('premium', updateDto);

      expect(apiClient.put).toHaveBeenCalledWith('/plan-config/premium', updateDto);
      expect(result).toEqual(mockUpdatedPlan);
    });

    it('should handle validation errors', async () => {
      const invalidDto: UpdatePlanConfigDto = {
        readingsLimit: -5, // Invalid
      };

      vi.mocked(apiClient.put).mockRejectedValue(new Error('Validation failed'));

      await expect(updatePlanConfig('premium', invalidDto)).rejects.toThrow('Validation failed');
    });
  });
});
