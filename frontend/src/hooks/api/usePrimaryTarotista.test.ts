/**
 * Tests para usePrimaryTarotista hook
 *
 * TDD - T-BUG-007-B (ex T-BUG-013): Agenda sin hardcode
 * Valida que el hook resuelva el ID del tarotista primario desde la API
 * en lugar de usar la constante hardcodeada FLAVIA_TAROTISTA_ID = 1.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { usePrimaryTarotista } from './usePrimaryTarotista';
import { apiClient } from '@/lib/api/axios-config';
import type { AdminTarotistasResponse } from '@/types/admin-tarotistas.types';

vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('usePrimaryTarotista', () => {
  let queryClient: QueryClient;
  const mockApiClient = apiClient as unknown as { get: ReturnType<typeof vi.fn> };

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  const mockTarotista = {
    id: 3,
    userId: 10,
    nombrePublico: 'Flavia Mística',
    bio: null,
    fotoPerfil: null,
    especialidades: ['amor'],
    idiomas: ['español'],
    añosExperiencia: 5,
    ofreceSesionesVirtuales: true,
    precioSesionUsd: 50.0,
    duracionSesionMinutos: 60,
    isActive: true,
    isAcceptingNewClients: true,
    isFeatured: true,
    comisiónPorcentaje: 30.0,
    ratingPromedio: 4.8,
    totalReviews: 100,
    totalLecturas: 500,
    totalIngresos: 25000.0,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('debe retornar el primer tarotista activo como primario', async () => {
    const mockResponse: AdminTarotistasResponse = {
      data: [mockTarotista],
      meta: { page: 1, limit: 1, totalItems: 1, totalPages: 1 },
    };

    mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => usePrimaryTarotista(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.primaryTarotista).toEqual(mockTarotista);
    expect(result.current.primaryTarotistaId).toBe(3);
  });

  it('debe llamar al endpoint de admin con isActive=true y limit=1', async () => {
    const mockResponse: AdminTarotistasResponse = {
      data: [mockTarotista],
      meta: { page: 1, limit: 1, totalItems: 1, totalPages: 1 },
    };

    mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => usePrimaryTarotista(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiClient.get).toHaveBeenCalledWith(
      '/admin/tarotistas',
      expect.objectContaining({
        params: expect.objectContaining({ isActive: true, limit: 1 }),
      })
    );
  });

  it('debe retornar primaryTarotistaId = undefined cuando no hay tarotistas activos', async () => {
    const mockResponse: AdminTarotistasResponse = {
      data: [],
      meta: { page: 1, limit: 1, totalItems: 0, totalPages: 0 },
    };

    mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => usePrimaryTarotista(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.primaryTarotista).toBeUndefined();
    expect(result.current.primaryTarotistaId).toBeUndefined();
  });

  it('debe exponer isLoading mientras carga', () => {
    mockApiClient.get.mockImplementationOnce(() => new Promise(() => {})); // pending forever

    const { result } = renderHook(() => usePrimaryTarotista(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.primaryTarotistaId).toBeUndefined();
  });

  it('debe exponer isError cuando falla la request', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Forbidden'));

    const { result } = renderHook(() => usePrimaryTarotista(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
