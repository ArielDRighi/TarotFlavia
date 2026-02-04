/**
 * Tests for Pendulum API Functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  queryPendulum,
  getPendulumHistory,
  getPendulumStats,
  deletePendulumQuery,
} from './pendulum-api';
import { API_ENDPOINTS } from './endpoints';
import type {
  PendulumQueryRequest,
  PendulumQueryResponse,
  PendulumHistoryItem,
  PendulumStats,
} from '@/types/pendulum.types';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('pendulum API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // queryPendulum
  // ==========================================================================
  describe('queryPendulum', () => {
    const mockQueryResponse: PendulumQueryResponse = {
      queryId: 123,
      response: 'yes',
      responseText: 'Sí',
      interpretation: 'El péndulo indica una respuesta afirmativa',
      movement: 'vertical',
      lunarPhase: '0.75',
      lunarPhaseName: 'Luna Creciente',
    };

    it('should query pendulum without question (free users)', async () => {
      const request: PendulumQueryRequest = {};
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockQueryResponse });

      const result = await queryPendulum(request);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.PENDULUM.QUERY, request);
      expect(result).toEqual(mockQueryResponse);
      expect(result.response).toBe('yes');
    });

    it('should query pendulum with question (premium users)', async () => {
      const request: PendulumQueryRequest = {
        question: '¿Debo tomar esta decisión?',
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockQueryResponse });

      const result = await queryPendulum(request);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.PENDULUM.QUERY, request);
      expect(result).toEqual(mockQueryResponse);
      expect(result.responseText).toBe('Sí');
    });

    it('should handle different pendulum responses', async () => {
      const responses = ['yes', 'no', 'maybe'] as const;

      for (const response of responses) {
        const mockResponse: PendulumQueryResponse = {
          ...mockQueryResponse,
          response,
        };
        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await queryPendulum({});

        expect(result.response).toBe(response);
      }
    });

    it('should handle different movement types', async () => {
      const movements = ['vertical', 'horizontal', 'circular'] as const;

      for (const movement of movements) {
        const mockResponse: PendulumQueryResponse = {
          ...mockQueryResponse,
          movement,
        };
        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await queryPendulum({});

        expect(result.movement).toBe(movement);
      }
    });
  });

  // ==========================================================================
  // getPendulumHistory
  // ==========================================================================
  describe('getPendulumHistory', () => {
    const mockHistory: PendulumHistoryItem[] = [
      {
        id: 123,
        question: '¿Debo tomar esta decisión?',
        response: 'yes',
        interpretation: 'Respuesta afirmativa',
        lunarPhase: '0.75',
        createdAt: '2026-02-04T10:30:00.000Z',
      },
      {
        id: 124,
        question: '¿Es buen momento para invertir?',
        response: 'no',
        interpretation: 'Respuesta negativa',
        lunarPhase: '0.25',
        createdAt: '2026-02-04T11:00:00.000Z',
      },
    ];

    it('should fetch full history without filters', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHistory });

      const result = await getPendulumHistory();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.PENDULUM.HISTORY);
      expect(result).toEqual(mockHistory);
      expect(result).toHaveLength(2);
    });

    it('should fetch history with limit parameter', async () => {
      const limitedHistory = [mockHistory[0]];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: limitedHistory });

      const result = await getPendulumHistory(10);

      expect(apiClient.get).toHaveBeenCalledWith(`${API_ENDPOINTS.PENDULUM.HISTORY}?limit=10`);
      expect(result).toEqual(limitedHistory);
      expect(result).toHaveLength(1);
    });

    it('should fetch history filtered by response type', async () => {
      const filteredHistory = [mockHistory[0]];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: filteredHistory });

      const result = await getPendulumHistory(undefined, 'yes');

      expect(apiClient.get).toHaveBeenCalledWith(`${API_ENDPOINTS.PENDULUM.HISTORY}?response=yes`);
      expect(result).toEqual(filteredHistory);
      expect(result[0].response).toBe('yes');
    });

    it('should fetch history with both limit and filter', async () => {
      const filteredHistory = [mockHistory[1]];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: filteredHistory });

      const result = await getPendulumHistory(5, 'no');

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.PENDULUM.HISTORY}?limit=5&response=no`
      );
      expect(result).toEqual(filteredHistory);
    });
  });

  // ==========================================================================
  // getPendulumStats
  // ==========================================================================
  describe('getPendulumStats', () => {
    const mockStats: PendulumStats = {
      total: 150,
      yesCount: 60,
      noCount: 45,
      maybeCount: 30,
    };

    it('should fetch pendulum statistics', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStats });

      const result = await getPendulumStats();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.PENDULUM.STATS);
      expect(result).toEqual(mockStats);
      expect(result.total).toBe(150);
    });

    it('should return stats with correct response distribution', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStats });

      const result = await getPendulumStats();

      expect(result.yesCount).toBe(60);
      expect(result.noCount).toBe(45);
      expect(result.maybeCount).toBe(30);
    });

    it('should calculate percentages correctly', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStats });

      const result = await getPendulumStats();

      const yesPercentage = (result.yesCount / result.total) * 100;
      const noPercentage = (result.noCount / result.total) * 100;
      const maybePercentage = (result.maybeCount / result.total) * 100;

      expect(yesPercentage).toBe(40);
      expect(noPercentage).toBe(30);
      expect(maybePercentage).toBe(20);
    });
  });

  // ==========================================================================
  // deletePendulumQuery
  // ==========================================================================
  describe('deletePendulumQuery', () => {
    it('should delete pendulum query by id', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined });

      await deletePendulumQuery(123);

      expect(apiClient.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.PENDULUM.HISTORY}/123`);
    });

    it('should handle deletion of different query ids', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined });

      await deletePendulumQuery(456);

      expect(apiClient.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.PENDULUM.HISTORY}/456`);
    });
  });
});
