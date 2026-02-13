/**
 * Birth Chart Hooks Tests
 *
 * Tests para los hooks de React Query que interactúan con la API de carta astral
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { createElement, type ReactNode } from 'react';
import * as axiosConfig from '@/lib/api/axios-config';
import {
  useGenerateChart,
  useGenerateChartAnonymous,
  useChartHistory,
  useSavedChart,
  useRenameChart,
  useDeleteChart,
  useUsageStatus,
  useCanGenerateChart,
} from './useBirthChart';
import type {
  ChartResponse,
  GenerateChartRequest,
  UsageStatus,
  ChartHistoryResponse,
  PremiumChartResponse,
} from '@/types/birth-chart-api.types';
import { ZodiacSign } from '@/types/birth-chart.enums';

// Mock de axios-config
vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPost = axiosConfig.apiClient.post as Mock;
const mockGet = axiosConfig.apiClient.get as Mock;
const mockDelete = axiosConfig.apiClient.delete as Mock;

// Helper para crear wrapper con QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
}

describe('useBirthChart Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGenerateChart', () => {
    it('should generate a chart successfully', async () => {
      const mockRequest: GenerateChartRequest = {
        name: 'Juan Pérez',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const mockResponse: ChartResponse = {
        success: true,
        chartSvgData: { planets: [], houses: [], aspects: [] },
        planets: [],
        houses: [],
        aspects: [],
        bigThree: {
          sun: { sign: ZodiacSign.TAURUS, signName: 'Tauro', interpretation: 'Test' },
          moon: { sign: ZodiacSign.LEO, signName: 'Leo', interpretation: 'Test' },
          ascendant: { sign: ZodiacSign.VIRGO, signName: 'Virgo', interpretation: 'Test' },
        },
        calculationTimeMs: 100,
      };

      mockPost.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useGenerateChart(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('/birth-chart/generate', mockRequest);
    });

    it('should handle errors when generating a chart', async () => {
      const mockRequest: GenerateChartRequest = {
        name: 'Juan Pérez',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const mockError = {
        response: {
          data: {
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Límite de uso alcanzado',
          },
        },
      };

      mockPost.mockRejectedValue(mockError);

      const { result } = renderHook(() => useGenerateChart(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockRequest);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should call onSuccess callback', async () => {
      const mockRequest: GenerateChartRequest = {
        name: 'Juan Pérez',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const mockResponse: ChartResponse = {
        success: true,
        chartSvgData: { planets: [], houses: [], aspects: [] },
        planets: [],
        houses: [],
        aspects: [],
        bigThree: {
          sun: { sign: ZodiacSign.TAURUS, signName: 'Tauro', interpretation: 'Test' },
          moon: { sign: ZodiacSign.LEO, signName: 'Leo', interpretation: 'Test' },
          ascendant: { sign: ZodiacSign.VIRGO, signName: 'Virgo', interpretation: 'Test' },
        },
        calculationTimeMs: 100,
      };

      mockPost.mockResolvedValue({ data: mockResponse });

      const onSuccess = vi.fn();

      const { result } = renderHook(() => useGenerateChart({ onSuccess }), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockRequest);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      });
    });
  });

  describe('useGenerateChartAnonymous', () => {
    it('should generate an anonymous chart successfully', async () => {
      const mockRequest: GenerateChartRequest = {
        name: 'Anónimo',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, España',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      };

      const mockResponse: ChartResponse = {
        success: true,
        chartSvgData: { planets: [], houses: [], aspects: [] },
        planets: [],
        houses: [],
        aspects: [],
        bigThree: {
          sun: { sign: ZodiacSign.TAURUS, signName: 'Tauro', interpretation: 'Test' },
          moon: { sign: ZodiacSign.LEO, signName: 'Leo', interpretation: 'Test' },
          ascendant: { sign: ZodiacSign.VIRGO, signName: 'Virgo', interpretation: 'Test' },
        },
        calculationTimeMs: 100,
      };

      mockPost.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useGenerateChartAnonymous(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('/birth-chart/generate/anonymous', mockRequest);
    });
  });

  describe('useChartHistory', () => {
    it('should fetch chart history with pagination', async () => {
      const mockResponse: ChartHistoryResponse = {
        data: [
          {
            id: 1,
            name: 'Mi Carta',
            birthDate: '1990-05-15',
            sunSign: 'taurus',
            moonSign: 'leo',
            ascendantSign: 'virgo',
            createdAt: '2026-02-13T10:00:00Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useChartHistory(1, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith('/birth-chart/history', {
        params: { page: 1, limit: 10 },
      });
    });
  });

  describe('useSavedChart', () => {
    it('should fetch a saved chart by ID', async () => {
      const mockResponse: PremiumChartResponse = {
        success: true,
        chartSvgData: { planets: [], houses: [], aspects: [] },
        planets: [],
        houses: [],
        aspects: [],
        bigThree: {
          sun: { sign: ZodiacSign.TAURUS, signName: 'Tauro', interpretation: 'Test' },
          moon: { sign: ZodiacSign.LEO, signName: 'Leo', interpretation: 'Test' },
          ascendant: { sign: ZodiacSign.VIRGO, signName: 'Virgo', interpretation: 'Test' },
        },
        calculationTimeMs: 100,
        distribution: { elements: [], modalities: [] },
        interpretations: {
          planets: [],
        },
        canDownloadPdf: true,
        savedChartId: 1,
        aiSynthesis: {
          content: 'Test synthesis',
          generatedAt: '2026-02-13T10:00:00Z',
          provider: 'openai',
        },
        canAccessHistory: true,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useSavedChart(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith('/birth-chart/history/1');
    });

    it('should not fetch when disabled', () => {
      const { result } = renderHook(() => useSavedChart(1, false), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('useRenameChart', () => {
    it('should rename a chart successfully and return id + name', async () => {
      // Backend retorna { id: number; name: string } según birth-chart-history.controller.ts:207
      const mockResponse = { id: 1, name: 'Nuevo Nombre' };

      mockPost.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useRenameChart(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 1, name: 'Nuevo Nombre' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.id).toBe(1);
      expect(result.current.data?.name).toBe('Nuevo Nombre');
      expect(mockPost).toHaveBeenCalledWith('/birth-chart/history/1/name', {
        name: 'Nuevo Nombre',
      });
    });
  });

  describe('useDeleteChart', () => {
    it('should delete a chart successfully and return void (HTTP 204)', async () => {
      // Backend retorna 204 NO_CONTENT (void) según birth-chart-history.controller.ts:210
      mockDelete.mockResolvedValue({ data: undefined });

      const { result } = renderHook(() => useDeleteChart(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith('/birth-chart/history/1');
    });
  });

  describe('useUsageStatus', () => {
    it('should fetch usage status', async () => {
      const mockResponse: UsageStatus = {
        plan: 'premium',
        used: 5,
        limit: 100,
        remaining: 95,
        resetsAt: null,
        canGenerate: true,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useUsageStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockGet).toHaveBeenCalledWith('/birth-chart/usage');
    });
  });

  describe('useCanGenerateChart', () => {
    it('should return canGenerate true when user can generate', async () => {
      const mockResponse: UsageStatus = {
        plan: 'premium',
        used: 5,
        limit: 100,
        remaining: 95,
        resetsAt: null,
        canGenerate: true,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useCanGenerateChart(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.canGenerate).toBe(true);
      });

      expect(result.current.remaining).toBe(95);
      expect(result.current.limit).toBe(100);
      expect(result.current.message).toBeUndefined();
    });

    it('should return canGenerate false with message for anonymous', async () => {
      const mockResponse: UsageStatus = {
        plan: 'anonymous',
        used: 1,
        limit: 1,
        remaining: 0,
        resetsAt: null,
        canGenerate: false,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useCanGenerateChart(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canGenerate).toBe(false);
      expect(result.current.remaining).toBe(0);
      expect(result.current.limit).toBe(1);
      expect(result.current.message).toBe(
        'Ya utilizaste tu carta gratuita. Regístrate para obtener más.'
      );
    });

    it('should return canGenerate false with message for free', async () => {
      const mockResponse: UsageStatus = {
        plan: 'free',
        used: 10,
        limit: 10,
        remaining: 0,
        resetsAt: '2026-03-01T00:00:00Z',
        canGenerate: false,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useCanGenerateChart(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canGenerate).toBe(false);
      expect(result.current.remaining).toBe(0);
      expect(result.current.limit).toBe(10);
      expect(result.current.message).toBe('Has alcanzado el límite de 10 cartas este mes.');
    });

    it('should return canGenerate false with message for premium limit reached', async () => {
      const mockResponse: UsageStatus = {
        plan: 'premium',
        used: 100,
        limit: 100,
        remaining: 0,
        resetsAt: '2026-03-01T00:00:00Z',
        canGenerate: false,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useCanGenerateChart(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canGenerate).toBe(false);
      expect(result.current.remaining).toBe(0);
      expect(result.current.limit).toBe(100);
      expect(result.current.message).toBe('Has alcanzado el límite de 100 cartas este mes.');
    });
  });
});
