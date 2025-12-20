/**
 * Mock helpers for admin tests
 */

import type { PlanConfig } from '@/types/admin.types';

export const createMockPlanConfig = (overrides?: Partial<PlanConfig>): PlanConfig => ({
  id: 2,
  planType: 'premium',
  name: 'Plan Premium',
  description: 'Plan avanzado',
  readingsLimit: 50,
  aiQuotaMonthly: 200,
  allowCustomQuestions: true,
  allowSharing: true,
  allowAdvancedSpreads: true,
  price: 9.99,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockPlans: PlanConfig[] = [
  {
    id: 1,
    planType: 'free',
    name: 'Plan Gratuito',
    description: 'Plan básico',
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
    description: 'Plan avanzado',
    readingsLimit: 50,
    aiQuotaMonthly: 200,
    allowCustomQuestions: true,
    allowSharing: true,
    allowAdvancedSpreads: true,
    price: 9.99,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    planType: 'professional',
    name: 'Plan Professional',
    description: 'Plan profesional ilimitado',
    readingsLimit: -1,
    aiQuotaMonthly: -1,
    allowCustomQuestions: true,
    allowSharing: true,
    allowAdvancedSpreads: true,
    price: 29.99,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];
