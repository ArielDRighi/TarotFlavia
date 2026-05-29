import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAdminReadings, softDeleteReading, restoreReading } from './admin-readings-api';
import { apiClient } from './axios-config';

vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('admin-readings-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAdminReadings', () => {
    it('debe llamar al endpoint correcto sin filtros', async () => {
      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 50,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await fetchAdminReadings({});

      expect(apiClient.get).toHaveBeenCalledWith('/admin/readings', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('debe incluir includeDeleted=true cuando se especifica', async () => {
      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 50,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      await fetchAdminReadings({ includeDeleted: true });

      expect(apiClient.get).toHaveBeenCalledWith('/admin/readings', {
        params: { includeDeleted: true },
      });
    });

    it('debe retornar la respuesta paginada correctamente', async () => {
      const mockReading = {
        id: 1,
        question: '¿Qué me depara el futuro?',
        spreadId: 2,
        spreadName: 'Tirada de 3 cartas',
        cardsCount: 3,
        cardPreviews: [],
        createdAt: '2024-01-01T10:00:00Z',
        deletedAt: undefined,
      };
      const mockResponse = {
        data: [mockReading],
        meta: {
          page: 1,
          limit: 50,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await fetchAdminReadings({});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe('softDeleteReading', () => {
    it('debe llamar al endpoint DELETE correcto', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

      await softDeleteReading(42);

      expect(apiClient.delete).toHaveBeenCalledWith('/admin/readings/42');
    });
  });

  describe('restoreReading', () => {
    it('debe llamar al endpoint PATCH correcto', async () => {
      const mockReading = {
        id: 42,
        question: 'Pregunta',
        spreadId: 1,
        spreadName: 'Tirada',
        cardsCount: 3,
        cardPreviews: [],
        createdAt: '2024-01-01T10:00:00Z',
      };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockReading });

      const result = await restoreReading(42);

      expect(apiClient.patch).toHaveBeenCalledWith('/admin/readings/42/restore');
      expect(result).toEqual(mockReading);
    });
  });
});
