/**
 * Tests para useAdminTarotistas hook
 *
 * Prueba las queries para gestión de tarotistas admin
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useAdminTarotistas, useTarotistaApplications } from './useAdminTarotistas';
import { apiClient } from '@/lib/api/axios-config';
import type { AdminTarotistasResponse, ApplicationsResponse } from '@/types/admin-tarotistas.types';

vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useAdminTarotistas', () => {
  let queryClient: QueryClient;
  const mockApiClient = apiClient as unknown as { get: ReturnType<typeof vi.fn> };

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

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

  describe('useAdminTarotistas', () => {
    it('should fetch admin tarotistas with default filters', async () => {
      const mockResponse: AdminTarotistasResponse = {
        data: [
          {
            id: 1,
            userId: 10,
            nombrePublico: 'Luna Mística',
            bio: 'Tarotista con 10 años de experiencia',
            fotoPerfil: null,
            especialidades: ['amor', 'trabajo'],
            idiomas: ['español'],
            añosExperiencia: 10,
            ofreceSesionesVirtuales: true,
            precioSesionUsd: 50.0,
            duracionSesionMinutos: 60,
            isActive: true,
            isAcceptingNewClients: true,
            isFeatured: false,
            comisiónPorcentaje: 30.0,
            ratingPromedio: 4.5,
            totalReviews: 25,
            totalLecturas: 150,
            totalIngresos: 7500.0,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
        },
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useAdminTarotistas(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/tarotistas', {
        params: { page: 1, limit: 10 },
      });
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should fetch tarotistas with custom filters', async () => {
      const mockResponse: AdminTarotistasResponse = {
        data: [],
        meta: {
          page: 2,
          limit: 20,
          totalItems: 0,
          totalPages: 0,
        },
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const filters = {
        page: 2,
        limit: 20,
        search: 'Luna',
        isActive: true,
        sortBy: 'totalLecturas' as const,
        sortOrder: 'DESC' as const,
      };

      const { result } = renderHook(() => useAdminTarotistas(filters), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/tarotistas', {
        params: filters,
      });
    });

    it('should handle error response', async () => {
      const mockError = new Error('Unauthorized');
      mockApiClient.get.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useAdminTarotistas(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useTarotistaApplications', () => {
    it('should fetch pending applications', async () => {
      const mockResponse: ApplicationsResponse = {
        data: [
          {
            id: 1,
            userId: 20,
            nombrePublico: 'Estrella del Tarot',
            biografia: 'Apasionada del tarot desde hace 5 años',
            especialidades: ['amor', 'salud'],
            motivacion: 'Quiero ayudar a más personas',
            experiencia: '5 años leyendo tarot profesionalmente',
            status: 'pending',
            adminNotes: null,
            reviewedByUserId: null,
            reviewedAt: null,
            createdAt: '2025-12-01T00:00:00Z',
            updatedAt: '2025-12-01T00:00:00Z',
            user: {
              id: 20,
              email: 'estrella@test.com',
              name: 'Estrella García',
            },
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
        },
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useTarotistaApplications(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/tarotistas/applications', {
        params: { page: 1, limit: 10 },
      });
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should fetch applications with filters', async () => {
      const mockResponse: ApplicationsResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const filters = {
        page: 1,
        limit: 10,
        status: 'pending' as const,
      };

      const { result } = renderHook(() => useTarotistaApplications(filters), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/tarotistas/applications', {
        params: filters,
      });
    });

    it('should handle error response', async () => {
      const mockError = new Error('Forbidden');
      mockApiClient.get.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useTarotistaApplications(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(mockError);
    });
  });
});
