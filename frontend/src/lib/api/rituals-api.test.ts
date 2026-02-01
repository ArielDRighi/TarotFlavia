/**
 * Tests for Rituals API Functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  getRituals,
  getFeaturedRituals,
  getCategories,
  getLunarInfo,
  getRitualBySlug,
  completeRitual,
  getRitualHistory,
  getRitualStats,
} from './rituals-api';
import { RitualCategory, RitualDifficulty, LunarPhase, MaterialType } from '@/types/ritual.types';
import { API_ENDPOINTS } from './endpoints';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('rituals API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRitualSummary = {
    id: 1,
    slug: 'ritual-luna-nueva',
    title: 'Ritual de Luna Nueva',
    description: 'Ceremonia para establecer intenciones',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    bestLunarPhase: LunarPhase.NEW_MOON,
    imageUrl: '/images/ritual.jpg',
    materialsCount: 4,
    stepsCount: 7,
  };

  const mockRitualDetail = {
    ...mockRitualSummary,
    bestTimeOfDay: 'Noche',
    purpose: 'Establecer intenciones',
    preparation: 'Busca un espacio tranquilo',
    closing: 'Agradece a la luna',
    tips: ['Sé específico', 'Escribe en presente'],
    audioUrl: null,
    materials: [
      {
        id: 1,
        name: 'Vela blanca',
        description: null,
        type: MaterialType.REQUIRED,
        alternative: null,
        quantity: 1,
        unit: 'unidad',
      },
    ],
    steps: [
      {
        id: 1,
        stepNumber: 1,
        title: 'Preparar el espacio',
        description: 'Limpia y ordena',
        durationSeconds: 180,
        imageUrl: null,
        mantra: null,
        visualization: null,
      },
    ],
    completionCount: 42,
  };

  const mockLunarInfo = {
    phase: LunarPhase.FULL_MOON,
    phaseName: 'Luna Llena',
    illumination: 100,
    zodiacSign: 'Aries',
    isGoodFor: ['Culminación', 'Celebración', 'Liberación'],
  };

  const mockHistoryEntry = {
    id: 1,
    ritual: {
      id: 1,
      slug: 'ritual-luna-nueva',
      title: 'Ritual de Luna Nueva',
      category: RitualCategory.LUNAR,
    },
    completedAt: '2026-01-17T20:00:00Z',
    lunarPhase: LunarPhase.NEW_MOON,
    lunarSign: 'Capricornio',
    notes: 'Muy tranquilizador',
    rating: 5,
    durationMinutes: 35,
  };

  const mockStats = {
    totalCompleted: 15,
    favoriteCategory: RitualCategory.LUNAR,
    currentStreak: 3,
    thisMonthCount: 8,
  };

  describe('getRituals', () => {
    it('should call correct endpoint without filters', async () => {
      const mockData = [mockRitualSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getRituals();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.LIST);
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(1);
    });

    it('should call correct endpoint with category filter', async () => {
      const mockData = [mockRitualSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getRituals({ category: RitualCategory.LUNAR });

      expect(apiClient.get).toHaveBeenCalledWith(`${API_ENDPOINTS.RITUALS.LIST}?category=lunar`);
      expect(result).toEqual(mockData);
    });

    it('should call correct endpoint with multiple filters', async () => {
      const mockData = [mockRitualSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getRituals({
        category: RitualCategory.LUNAR,
        difficulty: RitualDifficulty.BEGINNER,
        lunarPhase: LunarPhase.NEW_MOON,
        search: 'luna',
      });

      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('category=lunar'));
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('difficulty=beginner'));
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('lunarPhase=new_moon'));
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('search=luna'));
      expect(result).toEqual(mockData);
    });
  });

  describe('getFeaturedRituals', () => {
    it('should call correct endpoint and return featured rituals', async () => {
      const mockData = [mockRitualSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getFeaturedRituals();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.FEATURED);
      expect(result).toEqual(mockData);
    });
  });

  describe('getCategories', () => {
    it('should call correct endpoint and return categories with count', async () => {
      const mockData = [
        { category: 'lunar', count: 4 },
        { category: 'tarot', count: 3 },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getCategories();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.CATEGORIES);
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
    });
  });

  describe('getLunarInfo', () => {
    it('should call correct endpoint and return lunar info', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockLunarInfo });

      const result = await getLunarInfo();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.LUNAR_INFO);
      expect(result).toEqual(mockLunarInfo);
      expect(result.phase).toBe(LunarPhase.FULL_MOON);
      expect(result.illumination).toBe(100);
    });
  });

  describe('getRitualBySlug', () => {
    it('should call correct endpoint with slug and return ritual detail', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockRitualDetail,
      });

      const result = await getRitualBySlug('ritual-luna-nueva');

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.DETAIL('ritual-luna-nueva'));
      expect(result).toEqual(mockRitualDetail);
      expect(result.materials).toHaveLength(1);
      expect(result.steps).toHaveLength(1);
    });

    it('should work with different slugs', async () => {
      const meditationRitual = {
        ...mockRitualDetail,
        slug: 'meditacion-diaria',
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: meditationRitual,
      });

      const result = await getRitualBySlug('meditacion-diaria');

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.DETAIL('meditacion-diaria'));
      expect(result.slug).toBe('meditacion-diaria');
    });
  });

  describe('completeRitual', () => {
    it('should call correct endpoint and return completion response', async () => {
      const mockResponse = {
        message: 'Ritual completado exitosamente',
        historyId: 1,
        lunarPhase: 'new_moon',
        lunarSign: 'Capricornio',
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await completeRitual(1, {
        notes: 'Muy tranquilizador',
        rating: 5,
      });

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.COMPLETE(1), {
        notes: 'Muy tranquilizador',
        rating: 5,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should work with minimal data', async () => {
      const mockResponse = {
        message: 'Ritual completado exitosamente',
        historyId: 2,
        lunarPhase: 'full_moon',
        lunarSign: 'Leo',
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await completeRitual(2, {});

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.COMPLETE(2), {});
      expect(result.historyId).toBe(2);
    });

    it('should work with all optional fields', async () => {
      const mockResponse = {
        message: 'Ritual completado exitosamente',
        historyId: 3,
        lunarPhase: 'waning_crescent',
        lunarSign: 'Piscis',
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await completeRitual(3, {
        notes: 'Experiencia profunda',
        rating: 4,
        durationMinutes: 45,
      });

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.COMPLETE(3), {
        notes: 'Experiencia profunda',
        rating: 4,
        durationMinutes: 45,
      });
      expect(result.historyId).toBe(3);
    });
  });

  describe('getRitualHistory', () => {
    it('should call correct endpoint without limit', async () => {
      const mockData = [mockHistoryEntry];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getRitualHistory();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.HISTORY);
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(1);
    });

    it('should call correct endpoint with limit', async () => {
      const mockData = [mockHistoryEntry];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getRitualHistory(10);

      expect(apiClient.get).toHaveBeenCalledWith(`${API_ENDPOINTS.RITUALS.HISTORY}?limit=10`);
      expect(result).toEqual(mockData);
    });
  });

  describe('getRitualStats', () => {
    it('should call correct endpoint and return user stats', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStats });

      const result = await getRitualStats();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.RITUALS.STATS);
      expect(result).toEqual(mockStats);
      expect(result.totalCompleted).toBe(15);
      expect(result.favoriteCategory).toBe(RitualCategory.LUNAR);
      expect(result.currentStreak).toBe(3);
    });
  });
});
