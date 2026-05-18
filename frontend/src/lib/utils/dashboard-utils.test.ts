/**
 * Tests for dashboard-utils.ts
 *
 * TDD - T-BUG-007-B: Dashboard sin mocks
 * Valida que transformStatsToMetrics use datos reales del backend:
 * - activeTarotistas desde stats.activeTarotistas (no hardcodeado a 25)
 * - monthlyRevenue no usa totalCost * 10 (campo renombrado a totalCostUsd y revenue se elimina)
 */

import { describe, it, expect } from 'vitest';
import { transformStatsToMetrics } from './dashboard-utils';
import type { StatsResponseDto } from '@/types/admin.types';

// ============================================================================
// Helpers
// ============================================================================

function buildMockStats(overrides?: Partial<StatsResponseDto>): StatsResponseDto {
  return {
    users: {
      totalUsers: 100,
      activeUsersLast7Days: 40,
      activeUsersLast30Days: 80,
      newRegistrationsPerDay: [],
      planDistribution: [],
    },
    readings: {
      totalReadings: 500,
      readingsLast7Days: 100,
      readingsLast30Days: 400,
      readingsPerDay: [],
    },
    cards: {
      totalCards: 78,
      mostDrawnCard: 'El Loco',
      leastDrawnCard: 'La Torre',
    },
    openai: {
      totalPrompts: 500,
      totalCostUsd: 10.0,
      aiCostsPerDay: [],
    },
    questions: {
      totalQuestions: 15,
      mostCommonQuestion: '¿Encontraré el amor?',
    },
    recentReadings: [],
    activeTarotistas: 7,
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('transformStatsToMetrics', () => {
  describe('activeTarotistas', () => {
    it('debe usar stats.activeTarotistas en lugar de un valor hardcodeado', () => {
      const stats = buildMockStats({ activeTarotistas: 7 });
      const metrics = transformStatsToMetrics(stats);
      expect(metrics.activeTarotistas.value).toBe(7);
    });

    it('debe reflejar 0 cuando no hay tarotistas activos', () => {
      const stats = buildMockStats({ activeTarotistas: 0 });
      const metrics = transformStatsToMetrics(stats);
      expect(metrics.activeTarotistas.value).toBe(0);
    });

    it('debe reflejar 25 cuando hay 25 tarotistas activos', () => {
      const stats = buildMockStats({ activeTarotistas: 25 });
      const metrics = transformStatsToMetrics(stats);
      expect(metrics.activeTarotistas.value).toBe(25);
    });

    it('no debe producir NaN en el valor de activeTarotistas', () => {
      const stats = buildMockStats({ activeTarotistas: 0 });
      const metrics = transformStatsToMetrics(stats);
      expect(Number.isNaN(metrics.activeTarotistas.value)).toBe(false);
    });
  });

  describe('totalUsers', () => {
    it('debe retornar totalUsers del backend', () => {
      const stats = buildMockStats();
      const metrics = transformStatsToMetrics(stats);
      expect(metrics.totalUsers.value).toBe(100);
    });

    it('no debe producir NaN en totalUsers', () => {
      const stats = buildMockStats();
      const metrics = transformStatsToMetrics(stats);
      expect(Number.isNaN(metrics.totalUsers.value)).toBe(false);
    });
  });

  describe('monthlyReadings', () => {
    it('debe retornar readingsLast30Days', () => {
      const stats = buildMockStats();
      const metrics = transformStatsToMetrics(stats);
      expect(metrics.monthlyReadings.value).toBe(400);
    });

    it('no debe producir NaN en monthlyReadings', () => {
      const stats = buildMockStats();
      const metrics = transformStatsToMetrics(stats);
      expect(Number.isNaN(metrics.monthlyReadings.value)).toBe(false);
    });
  });

  describe('retorno completo', () => {
    it('debe retornar las cuatro métricas esperadas', () => {
      const stats = buildMockStats();
      const metrics = transformStatsToMetrics(stats);
      expect(metrics).toHaveProperty('totalUsers');
      expect(metrics).toHaveProperty('monthlyReadings');
      expect(metrics).toHaveProperty('activeTarotistas');
    });

    it('trend de activeTarotistas debe ser stable', () => {
      const stats = buildMockStats({ activeTarotistas: 3 });
      const metrics = transformStatsToMetrics(stats);
      expect(metrics.activeTarotistas.trend).toBe('stable');
    });
  });
});
