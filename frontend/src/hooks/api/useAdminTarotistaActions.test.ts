/**
 * Tests para useAdminTarotistaActions hook
 *
 * Prueba las mutations para acciones sobre tarotistas y aplicaciones
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import {
  useDeactivateTarotista,
  useReactivateTarotista,
  useApproveApplication,
  useRejectApplication,
} from './useAdminTarotistaActions';
import { apiClient } from '@/lib/api/axios-config';

vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    put: vi.fn(),
    post: vi.fn(),
  },
}));

describe('useAdminTarotistaActions', () => {
  let queryClient: QueryClient;
  const mockApiClient = apiClient as unknown as {
    put: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  describe('useDeactivateTarotista', () => {
    it('should deactivate tarotista', async () => {
      const mockResponse = {
        message: 'Tarotista desactivado exitosamente',
      };

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useDeactivateTarotista(), { wrapper });

      await act(async () => {
        result.current.mutate(1);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.put).toHaveBeenCalledWith('/admin/tarotistas/1/deactivate');
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle error', async () => {
      const mockError = new Error('Not found');
      mockApiClient.put.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useDeactivateTarotista(), { wrapper });

      await act(async () => {
        result.current.mutate(999);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useReactivateTarotista', () => {
    it('should reactivate tarotista', async () => {
      const mockResponse = {
        message: 'Tarotista reactivado exitosamente',
      };

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useReactivateTarotista(), { wrapper });

      await act(async () => {
        result.current.mutate(1);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.put).toHaveBeenCalledWith('/admin/tarotistas/1/reactivate');
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useApproveApplication', () => {
    it('should approve application with notes', async () => {
      const mockApplication = {
        id: 1,
        userId: 20,
        nombrePublico: 'Luna Mística',
        biografia: 'Bio...',
        especialidades: ['amor'],
        motivacion: 'Motivación...',
        experiencia: 'Experiencia...',
        status: 'approved' as const,
        adminNotes: 'Excelente perfil',
        reviewedByUserId: 1,
        reviewedAt: '2025-12-13T00:00:00Z',
        createdAt: '2025-12-01T00:00:00Z',
        updatedAt: '2025-12-13T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockApplication });

      const { result } = renderHook(() => useApproveApplication(), { wrapper });

      const approveData = {
        id: 1,
        adminNotes: 'Excelente perfil',
      };

      await act(async () => {
        result.current.mutate(approveData);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.post).toHaveBeenCalledWith('/admin/tarotistas/applications/1/approve', {
        adminNotes: 'Excelente perfil',
      });
      expect(result.current.data).toEqual(mockApplication);
    });

    it('should approve application without notes', async () => {
      const mockApplication = {
        id: 2,
        userId: 21,
        nombrePublico: 'Test',
        biografia: 'Bio...',
        especialidades: [],
        motivacion: 'Motivación...',
        experiencia: 'Experiencia...',
        status: 'approved' as const,
        adminNotes: null,
        reviewedByUserId: 1,
        reviewedAt: '2025-12-13T00:00:00Z',
        createdAt: '2025-12-01T00:00:00Z',
        updatedAt: '2025-12-13T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockApplication });

      const { result } = renderHook(() => useApproveApplication(), { wrapper });

      await act(async () => {
        result.current.mutate({ id: 2 });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/admin/tarotistas/applications/2/approve',
        {}
      );
    });

    it('should invalidate queries on success', async () => {
      const mockApplication = {
        id: 1,
        userId: 20,
        nombrePublico: 'Luna',
        biografia: 'Bio...',
        especialidades: [],
        motivacion: 'Motivación...',
        experiencia: 'Experiencia...',
        status: 'approved' as const,
        adminNotes: null,
        reviewedByUserId: 1,
        reviewedAt: '2025-12-13T00:00:00Z',
        createdAt: '2025-12-01T00:00:00Z',
        updatedAt: '2025-12-13T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockApplication });

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useApproveApplication(), { wrapper });

      await act(async () => {
        result.current.mutate({ id: 1 });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['admin', 'tarotista-applications'],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['admin', 'tarotistas'],
      });
    });
  });

  describe('useRejectApplication', () => {
    it('should reject application', async () => {
      const mockApplication = {
        id: 1,
        userId: 20,
        nombrePublico: 'Test',
        biografia: 'Bio...',
        especialidades: [],
        motivacion: 'Motivación...',
        experiencia: 'Experiencia...',
        status: 'rejected' as const,
        adminNotes: 'No cumple requisitos',
        reviewedByUserId: 1,
        reviewedAt: '2025-12-13T00:00:00Z',
        createdAt: '2025-12-01T00:00:00Z',
        updatedAt: '2025-12-13T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockApplication });

      const { result } = renderHook(() => useRejectApplication(), { wrapper });

      const rejectData = {
        id: 1,
        adminNotes: 'No cumple requisitos',
      };

      await act(async () => {
        result.current.mutate(rejectData);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient.post).toHaveBeenCalledWith('/admin/tarotistas/applications/1/reject', {
        adminNotes: 'No cumple requisitos',
      });
      expect(result.current.data).toEqual(mockApplication);
    });

    it('should invalidate queries on success', async () => {
      const mockApplication = {
        id: 1,
        userId: 20,
        nombrePublico: 'Test',
        biografia: 'Bio...',
        especialidades: [],
        motivacion: 'Motivación...',
        experiencia: 'Experiencia...',
        status: 'rejected' as const,
        adminNotes: 'Rechazado',
        reviewedByUserId: 1,
        reviewedAt: '2025-12-13T00:00:00Z',
        createdAt: '2025-12-01T00:00:00Z',
        updatedAt: '2025-12-13T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockApplication });

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useRejectApplication(), { wrapper });

      await act(async () => {
        result.current.mutate({ id: 1, adminNotes: 'Rechazado' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['admin', 'tarotista-applications'],
      });
    });

    it('should handle error', async () => {
      const mockError = new Error('Bad request');
      mockApiClient.post.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useRejectApplication(), { wrapper });

      await act(async () => {
        result.current.mutate({ id: 1, adminNotes: 'Test' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(mockError);
    });
  });
});
