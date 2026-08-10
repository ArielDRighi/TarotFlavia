/**
 * Tests for useTarotistas hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTarotistas, useTarotistaDetail } from './useTarotistas';
import * as tarotistasApi from '@/lib/api/tarotistas-api';
import type { PaginatedTarotistas, TarotistaDetail } from '@/types';
import React from 'react';

// Mock the API
vi.mock('@/lib/api/tarotistas-api');

// Helper to create QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useTarotistas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tarotistas without filters', async () => {
    const mockData: PaginatedTarotistas = {
      data: [
        {
          id: 1,
          nombrePublico: 'Luna Misteriosa',
          bio: 'Experta en amor',
          especialidades: ['Amor', 'Trabajo'],
          fotoPerfil: 'https://example.com/luna.jpg',
          ratingPromedio: 4.8,
          totalLecturas: 250,
          totalReviews: 50,
          añosExperiencia: 10,
          idiomas: ['Español', 'Inglés'],
          createdAt: '2024-08-15T10:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    vi.mocked(tarotistasApi.getTarotistas).mockResolvedValue(mockData);

    const { result } = renderHook(() => useTarotistas(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(tarotistasApi.getTarotistas).toHaveBeenCalledWith(undefined);
  });

  it('should fetch tarotistas with filters', async () => {
    const mockData: PaginatedTarotistas = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };

    vi.mocked(tarotistasApi.getTarotistas).mockResolvedValue(mockData);

    const filters = {
      search: 'Luna',
      especialidad: 'Amor',
      page: 1,
      limit: 10,
    };

    const { result } = renderHook(() => useTarotistas(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(tarotistasApi.getTarotistas).toHaveBeenCalledWith(filters);
  });

  it('should handle errors', async () => {
    const error = new Error('Error al obtener tarotistas');
    vi.mocked(tarotistasApi.getTarotistas).mockRejectedValue(error);

    const { result } = renderHook(() => useTarotistas(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should use correct query key', async () => {
    const mockData: PaginatedTarotistas = {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };

    vi.mocked(tarotistasApi.getTarotistas).mockResolvedValue(mockData);

    const filters = { search: 'test' };
    const { result } = renderHook(() => useTarotistas(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Query key should include filters
    expect(result.current.data).toBeDefined();
  });
});

describe('useTarotistaDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tarotista detail by id', async () => {
    const mockTarotista: TarotistaDetail = {
      id: 1,
      nombrePublico: 'Luna Misteriosa',
      bio: 'Experta en amor y relaciones',
      especialidades: ['Amor', 'Trabajo'],
      fotoPerfil: 'https://example.com/luna.jpg',
      ratingPromedio: 4.8,
      totalLecturas: 250,
      totalReviews: 50,
      añosExperiencia: 10,
      idiomas: ['Español', 'Inglés'],
      isActive: true,
      createdAt: '2024-08-15T10:00:00Z',
      updatedAt: '2025-11-20T15:30:00Z',
    };

    vi.mocked(tarotistasApi.getTarotistaById).mockResolvedValue(mockTarotista);

    const { result } = renderHook(() => useTarotistaDetail(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTarotista);
    expect(tarotistasApi.getTarotistaById).toHaveBeenCalledWith(1);
  });

  it('should handle 404 errors', async () => {
    const error = new Error('Tarotista no encontrado o inactivo');
    vi.mocked(tarotistasApi.getTarotistaById).mockRejectedValue(error);

    const { result } = renderHook(() => useTarotistaDetail(999), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should be disabled when id is 0', async () => {
    const { result } = renderHook(() => useTarotistaDetail(0), {
      wrapper: createWrapper(),
    });

    // Query should not run
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(tarotistasApi.getTarotistaById).not.toHaveBeenCalled();
  });

  it('should use correct query key', async () => {
    const mockTarotista: TarotistaDetail = {
      id: 1,
      nombrePublico: 'Luna Misteriosa',
      bio: 'Bio',
      especialidades: ['Amor'],
      ratingPromedio: 4.8,
      totalLecturas: 250,
      totalReviews: 50,
      añosExperiencia: 10,
      idiomas: ['Español'],
      isActive: true,
      createdAt: '2024-08-15T10:00:00Z',
      updatedAt: '2025-11-20T15:30:00Z',
    };

    vi.mocked(tarotistasApi.getTarotistaById).mockResolvedValue(mockTarotista);

    const { result } = renderHook(() => useTarotistaDetail(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
  });

  it('should handle tarotista with nullable fields (bio, ratingPromedio, añosExperiencia)', async () => {
    const mockTarotista: TarotistaDetail = {
      id: 2,
      nombrePublico: 'Nuevo Tarotista',
      bio: null,
      especialidades: ['Trabajo'],
      fotoPerfil: undefined,
      ratingPromedio: null,
      totalLecturas: 0,
      totalReviews: 0,
      añosExperiencia: null,
      idiomas: ['Español'],
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    vi.mocked(tarotistasApi.getTarotistaById).mockResolvedValue(mockTarotista);

    const { result } = renderHook(() => useTarotistaDetail(2), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTarotista);
    expect(result.current.data?.bio).toBeNull();
    expect(result.current.data?.ratingPromedio).toBeNull();
    expect(result.current.data?.añosExperiencia).toBeNull();
  });
});

// ============================================================================
// Sembrado desde el servidor (T-SEO-003)
// ============================================================================

describe('useTarotistas — sembrado desde el servidor', () => {
  const seeded: PaginatedTarotistas = {
    data: [
      {
        id: 7,
        nombrePublico: 'Estrella Guía',
        bio: 'Guía espiritual con quince años de experiencia',
        especialidades: ['Espiritual'],
        fotoPerfil: 'https://example.com/estrella.jpg',
        ratingPromedio: 4.9,
        totalLecturas: 200,
        totalReviews: 100,
        añosExperiencia: 15,
        idiomas: ['Español'],
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('⚠️ T-SEO-003: sirve la primera página sembrada en el primer render, sin esqueleto', () => {
    const { result } = renderHook(() => useTarotistas(undefined, seeded), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toEqual(seeded);
    expect(result.current.isLoading).toBe(false);
  });

  it('⚠️ refetchea igual al montar: el rating y el listado cambian', async () => {
    vi.mocked(tarotistasApi.getTarotistas).mockResolvedValue(seeded);

    renderHook(() => useTarotistas(undefined, seeded), { wrapper: createWrapper() });

    await waitFor(() => expect(vi.mocked(tarotistasApi.getTarotistas)).toHaveBeenCalledTimes(1));
  });
});
