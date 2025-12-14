/**
 * Tests for useAdminPlans hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlans, usePlan, useUpdatePlan } from './useAdminPlans';
import * as adminPlansApi from '@/lib/api/admin-plans-api';
import type { PlanConfig } from '@/types/admin.types';
import { ReactNode } from 'react';

// Mock API module
vi.mock('@/lib/api/admin-plans-api', () => ({
  fetchAllPlans: vi.fn(),
  fetchPlanByType: vi.fn(),
  updatePlanConfig: vi.fn(),
}));

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe('useAdminPlans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePlans', () => {
    it('should fetch all plans', async () => {
      const mockPlans: PlanConfig[] = [
        {
          id: 1,
          planType: 'free',
          dailyReadingLimit: 1,
          monthlyAIQuota: 10,
          canUseCustomQuestions: false,
          canRegenerateInterpretations: false,
          maxRegenerationsPerReading: 0,
          canShareReadings: false,
          historyLimit: 10,
          canBookSessions: false,
          price: 0,
        },
        {
          id: 2,
          planType: 'premium',
          dailyReadingLimit: 5,
          monthlyAIQuota: 100,
          canUseCustomQuestions: true,
          canRegenerateInterpretations: true,
          maxRegenerationsPerReading: 3,
          canShareReadings: true,
          historyLimit: -1,
          canBookSessions: true,
          price: 9.99,
        },
      ];

      vi.mocked(adminPlansApi.fetchAllPlans).mockResolvedValue(mockPlans);

      const { result } = renderHook(() => usePlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPlans);
      expect(adminPlansApi.fetchAllPlans).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      vi.mocked(adminPlansApi.fetchAllPlans).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => usePlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('usePlan', () => {
    it('should fetch a specific plan', async () => {
      const mockPlan: PlanConfig = {
        id: 2,
        planType: 'premium',
        dailyReadingLimit: 5,
        monthlyAIQuota: 100,
        canUseCustomQuestions: true,
        canRegenerateInterpretations: true,
        maxRegenerationsPerReading: 3,
        canShareReadings: true,
        historyLimit: -1,
        canBookSessions: true,
        price: 9.99,
      };

      vi.mocked(adminPlansApi.fetchPlanByType).mockResolvedValue(mockPlan);

      const { result } = renderHook(() => usePlan('premium'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPlan);
      expect(adminPlansApi.fetchPlanByType).toHaveBeenCalledWith('premium');
    });
  });

  describe('useUpdatePlan', () => {
    it('should update a plan and invalidate queries', async () => {
      const mockUpdatedPlan: PlanConfig = {
        id: 2,
        planType: 'premium',
        dailyReadingLimit: 10,
        monthlyAIQuota: 100,
        canUseCustomQuestions: true,
        canRegenerateInterpretations: true,
        maxRegenerationsPerReading: 3,
        canShareReadings: true,
        historyLimit: -1,
        canBookSessions: true,
        price: 12.99,
      };

      vi.mocked(adminPlansApi.updatePlanConfig).mockResolvedValue(mockUpdatedPlan);

      const { result } = renderHook(() => useUpdatePlan(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        planType: 'premium',
        data: { dailyReadingLimit: 10, price: 12.99 },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(adminPlansApi.updatePlanConfig).toHaveBeenCalledWith('premium', {
        dailyReadingLimit: 10,
        price: 12.99,
      });
      expect(result.current.data).toEqual(mockUpdatedPlan);
    });

    it('should handle errors', async () => {
      vi.mocked(adminPlansApi.updatePlanConfig).mockRejectedValue(new Error('Validation failed'));

      const { result } = renderHook(() => useUpdatePlan(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        planType: 'premium',
        data: { dailyReadingLimit: -5 },
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
