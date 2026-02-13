/**
 * Birth Chart Hooks
 *
 * React Query hooks para interactuar con la API de carta astral
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ChartResponse,
  GenerateChartRequest,
  PremiumChartResponse,
  UsageStatus,
  ChartHistoryResponse,
} from '@/types/birth-chart-api.types';

// Query keys para cache management
export const birthChartQueryKeys = {
  all: ['birth-chart'] as const,
  usage: () => [...birthChartQueryKeys.all, 'usage'] as const,
  history: () => [...birthChartQueryKeys.all, 'history'] as const,
  chart: (id: number) => [...birthChartQueryKeys.all, 'chart', id] as const,
} as const;

interface GenerateChartOptions {
  onSuccess?: (data: ChartResponse | PremiumChartResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para generar carta astral (usuarios autenticados)
 * Retorna interpretación básica (Big Three) para FREE, interpretación completa para PREMIUM
 */
export function useGenerateChart(options?: GenerateChartOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateChartRequest) => {
      const response = await apiClient.post<ChartResponse | PremiumChartResponse>(
        API_ENDPOINTS.BIRTH_CHART.GENERATE,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar historial y usage al generar nueva carta
      queryClient.invalidateQueries({ queryKey: birthChartQueryKeys.history() });
      queryClient.invalidateQueries({ queryKey: birthChartQueryKeys.usage() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Hook para generar carta astral (usuarios anónimos)
 * Solo retorna datos astronómicos básicos, sin interpretación
 */
export function useGenerateChartAnonymous(options?: GenerateChartOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateChartRequest) => {
      const response = await apiClient.post<ChartResponse>(
        API_ENDPOINTS.BIRTH_CHART.GENERATE_ANONYMOUS,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar usage al generar carta anónima
      queryClient.invalidateQueries({ queryKey: birthChartQueryKeys.usage() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Hook para obtener historial de cartas guardadas (usuarios autenticados)
 * Soporta paginación
 */
export function useChartHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...birthChartQueryKeys.history(), page, limit],
    queryFn: async () => {
      const response = await apiClient.get<ChartHistoryResponse>(
        API_ENDPOINTS.BIRTH_CHART.HISTORY,
        { params: { page, limit } }
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener una carta guardada por ID
 */
export function useSavedChart(id: number, enabled = true) {
  return useQuery({
    queryKey: birthChartQueryKeys.chart(id),
    queryFn: async () => {
      const response = await apiClient.get<PremiumChartResponse>(
        API_ENDPOINTS.BIRTH_CHART.BY_ID(id)
      );
      return response.data;
    },
    enabled,
    staleTime: Infinity, // Las cartas guardadas no cambian
  });
}

/**
 * Hook para renombrar una carta guardada
 */
export function useRenameChart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      // Backend retorna { id: number; name: string } según birth-chart-history.controller.ts:207
      const response = await apiClient.post<{ id: number; name: string }>(
        API_ENDPOINTS.BIRTH_CHART.RENAME(id),
        { name }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar la carta específica y el historial
      queryClient.invalidateQueries({
        queryKey: birthChartQueryKeys.chart(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: birthChartQueryKeys.history() });
    },
  });
}

/**
 * Hook para eliminar una carta guardada
 */
export function useDeleteChart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // Backend retorna 204 NO_CONTENT (void) según birth-chart-history.controller.ts:210
      await apiClient.delete(API_ENDPOINTS.BIRTH_CHART.BY_ID(id));
    },
    onSuccess: () => {
      // Invalidar historial y usage al eliminar
      queryClient.invalidateQueries({ queryKey: birthChartQueryKeys.history() });
      queryClient.invalidateQueries({ queryKey: birthChartQueryKeys.usage() });
    },
  });
}

/**
 * Hook para obtener estado de uso (cuántas cartas generadas este mes)
 */
export function useUsageStatus() {
  return useQuery({
    queryKey: birthChartQueryKeys.usage(),
    queryFn: async () => {
      const response = await apiClient.get<UsageStatus>(API_ENDPOINTS.BIRTH_CHART.USAGE);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook helper para verificar si el usuario puede generar una carta
 * Combina datos de usage y plan del usuario, incluyendo mensajes en español
 */
export function useCanGenerateChart() {
  const { data: usage, isLoading } = useUsageStatus();

  // Generar mensaje en español según el estado
  let message: string | undefined;
  if (usage && usage.remaining === 0) {
    if (usage.plan === 'anonymous') {
      message = 'Ya utilizaste tu carta gratuita. Regístrate para obtener más.';
    } else {
      message = `Has alcanzado el límite de ${usage.limit} cartas este mes.`;
    }
  }

  return {
    canGenerate: usage ? usage.remaining > 0 : false,
    remaining: usage?.remaining ?? 0,
    limit: usage?.limit ?? 0,
    isLoading,
    message,
  };
}
