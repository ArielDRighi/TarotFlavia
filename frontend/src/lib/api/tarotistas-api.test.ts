/**
 * Tests for Tarotistas API Service
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { getTarotistas, getTarotistaById } from './tarotistas-api';
import type { PaginatedTarotistas, TarotistaDetail } from '@/types';

// Mock axios-config
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('Tarotistas API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTarotistas', () => {
    it('should fetch tarotistas without filters', async () => {
      const mockResponse: PaginatedTarotistas = {
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await getTarotistas();

      expect(apiClient.get).toHaveBeenCalledWith('/tarotistas', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('should handle tarotistas with nullable fields', async () => {
      const mockResponse: PaginatedTarotistas = {
        data: [
          {
            id: 2,
            nombrePublico: 'Nuevo Tarotista',
            bio: null, // Nuevo tarotista sin bio
            especialidades: [],
            ratingPromedio: null, // Sin calificaciones aún
            totalLecturas: 0,
            totalReviews: 0,
            añosExperiencia: null, // No especificó años
            idiomas: ['Español'],
            createdAt: '2024-12-01T10:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await getTarotistas();

      expect(result.data[0].bio).toBeNull();
      expect(result.data[0].ratingPromedio).toBeNull();
      expect(result.data[0].añosExperiencia).toBeNull();
    });

    it('should fetch tarotistas with filters', async () => {
      const mockResponse: PaginatedTarotistas = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const filters = {
        search: 'Luna',
        especialidad: 'Amor',
        orderBy: 'rating' as const,
        order: 'DESC' as const,
        page: 1,
        limit: 10,
      };

      const result = await getTarotistas(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/tarotistas', { params: filters });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(getTarotistas()).rejects.toThrow('Error al obtener tarotistas');
    });
  });

  describe('getTarotistaById', () => {
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTarotista });

      const result = await getTarotistaById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/tarotistas/1');
      expect(result).toEqual(mockTarotista);
    });

    it('should handle 404 errors for inactive tarotistas', async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
      });

      await expect(getTarotistaById(999)).rejects.toThrow('Tarotista no encontrado o inactivo');
    });

    it('should handle other API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(getTarotistaById(1)).rejects.toThrow('Error al obtener tarotista');
    });
  });
});
