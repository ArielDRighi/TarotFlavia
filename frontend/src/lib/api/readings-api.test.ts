/**
 * Readings API Service Tests
 *
 * Tests para el servicio de API de lecturas
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import {
  getCategories,
  getPredefinedQuestions,
  getSpreads,
  getMyAvailableSpreads,
  createReading,
  getMyReadings,
  getReadingById,
  deleteReading,
  regenerateInterpretation,
  shareReading,
  unshareReading,
  getTrashedReadings,
  restoreReading,
} from './readings-api';
import type {
  Category,
  PredefinedQuestion,
  Spread,
  Reading,
  ReadingDetail,
  CreateReadingDto,
  PaginatedReadings,
  TrashedReading,
  ShareReadingResponse,
} from '@/types';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('readings-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // getCategories
  // ==========================================================================
  describe('getCategories', () => {
    const mockCategories: Category[] = [
      {
        id: 1,
        name: 'Amor',
        slug: 'amor',
        description: 'Preguntas sobre relaciones románticas',
        color: '#FF6B9D',
        icon: 'heart',
        isActive: true,
      },
      {
        id: 2,
        name: 'Trabajo',
        slug: 'trabajo',
        description: 'Preguntas sobre carrera profesional',
        color: '#4A90E2',
        icon: 'briefcase',
        isActive: true,
      },
    ];

    it('should fetch categories from API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCategories });

      const result = await getCategories();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CATEGORIES.BASE);
      expect(result).toEqual(mockCategories);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getCategories()).rejects.toThrow('Error al obtener categorías');
    });
  });

  // ==========================================================================
  // getPredefinedQuestions
  // ==========================================================================
  describe('getPredefinedQuestions', () => {
    const mockQuestions: PredefinedQuestion[] = [
      {
        id: 1,
        questionText: '¿Qué me depara el futuro en el amor?',
        categoryId: 1,
        order: 1,
        isActive: true,
        usageCount: 523,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletedAt: null,
      },
      {
        id: 2,
        questionText: '¿Encontraré el amor verdadero pronto?',
        categoryId: 1,
        order: 2,
        isActive: true,
        usageCount: 412,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletedAt: null,
      },
    ];

    it('should fetch all predefined questions when no categoryId provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockQuestions });

      const result = await getPredefinedQuestions();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.PREDEFINED_QUESTIONS.BASE, {
        params: undefined,
      });
      expect(result).toEqual(mockQuestions);
    });

    it('should fetch predefined questions filtered by categoryId', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockQuestions });

      const result = await getPredefinedQuestions(1);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.PREDEFINED_QUESTIONS.BASE, {
        params: { categoryId: 1 },
      });
      expect(result).toEqual(mockQuestions);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getPredefinedQuestions()).rejects.toThrow(
        'Error al obtener preguntas predefinidas'
      );
    });
  });

  // ==========================================================================
  // getSpreads
  // ==========================================================================
  describe('getSpreads', () => {
    const mockSpreads: Spread[] = [
      {
        id: 1,
        name: 'Tres Cartas',
        description: 'Pasado, Presente, Futuro',
        cardCount: 3,
        positions: [
          { position: 1, name: 'Pasado', description: 'Lo que dejaste atrás' },
          { position: 2, name: 'Presente', description: 'Tu situación actual' },
          { position: 3, name: 'Futuro', description: 'Lo que viene' },
        ],
        difficulty: 'beginner',
        requiredPlan: 'free',
        imageUrl: '/images/spreads/tres-cartas.jpg',
      },
    ];

    it('should fetch spreads from API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSpreads });

      const result = await getSpreads();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SPREADS.BASE);
      expect(result).toEqual(mockSpreads);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getSpreads()).rejects.toThrow('Error al obtener tiradas');
    });
  });

  // ==========================================================================
  // getMyAvailableSpreads
  // ==========================================================================
  describe('getMyAvailableSpreads', () => {
    const mockFilteredSpreads: Spread[] = [
      {
        id: 1,
        name: 'Tres Cartas',
        description: 'Pasado, Presente, Futuro',
        cardCount: 3,
        positions: [
          { position: 1, name: 'Pasado', description: 'Lo que dejaste atrás' },
          { position: 2, name: 'Presente', description: 'Tu situación actual' },
          { position: 3, name: 'Futuro', description: 'Lo que viene' },
        ],
        difficulty: 'beginner',
        imageUrl: '/images/spreads/tres-cartas.jpg',
        requiredPlan: 'free',
      },
    ];

    it('should fetch user-available spreads from API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockFilteredSpreads });

      const result = await getMyAvailableSpreads();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SPREADS.MY_AVAILABLE);
      expect(result).toEqual(mockFilteredSpreads);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(getMyAvailableSpreads()).rejects.toThrow('Error al obtener tiradas disponibles');
    });
  });

  // ==========================================================================
  // createReading
  // ==========================================================================
  describe('createReading', () => {
    // Mock API response (raw backend format)
    const mockApiResponse = {
      id: 123,
      userId: 1,
      spreadId: 1,
      tarotistaId: 1,
      customQuestion: '¿Qué me depara el futuro amoroso?',
      cards: [
        {
          id: 1,
          name: 'El Mago',
          number: 1,
          category: 'arcanos_mayores', // Backend uses 'arcanos_mayores' for Major Arcana
          imageUrl: '/cards/magician.jpg',
        },
      ],
      cardPositions: [{ cardId: 1, position: 'Presente', isReversed: false }],
      interpretation: 'Tu lectura muestra...',
      createdAt: '2025-11-20T10:30:00.000Z',
    };

    // Expected transformed result
    const expectedReading: ReadingDetail = {
      id: 123,
      userId: 1,
      spreadId: 1,
      tarotistaId: 1,
      question: '¿Qué me depara el futuro amoroso?',
      cards: [
        {
          id: 1,
          name: 'El Mago',
          arcana: 'major',
          number: 1,
          suit: null,
          orientation: 'upright',
          position: 0,
          positionName: 'Presente',
          imageUrl: '/cards/magician.jpg',
          description: undefined,
          keywords: undefined,
          meaningUpright: undefined,
          meaningReversed: undefined,
          isReversed: false,
        },
      ],
      interpretation: 'Tu lectura muestra...',
      freeInterpretations: null,
      createdAt: '2025-11-20T10:30:00.000Z',
      deletedAt: undefined,
      shareToken: undefined,
    };

    it('should create reading with predefined question', async () => {
      const createData: CreateReadingDto = {
        spreadId: 1,
        deckId: 1,
        cardIds: [1, 5, 9],
        cardPositions: [
          { cardId: 1, position: 'Pasado', isReversed: false },
          { cardId: 5, position: 'Presente', isReversed: true },
          { cardId: 9, position: 'Futuro', isReversed: false },
        ],
        predefinedQuestionId: 5,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockApiResponse });

      const result = await createReading(createData);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.BASE, createData);
      expect(result).toEqual(expectedReading);
    });

    it('should create reading with custom question', async () => {
      const createData: CreateReadingDto = {
        spreadId: 2,
        deckId: 1,
        cardIds: [3, 7, 12],
        cardPositions: [
          { cardId: 3, position: 'Pasado', isReversed: false },
          { cardId: 7, position: 'Presente', isReversed: false },
          { cardId: 12, position: 'Futuro', isReversed: true },
        ],
        customQuestion: '¿Qué me depara el futuro en mi carrera?',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockApiResponse });

      const result = await createReading(createData);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.BASE, createData);
      expect(result).toEqual(expectedReading);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      const createData: CreateReadingDto = {
        spreadId: 1,
        deckId: 1,
        cardIds: [1],
        cardPositions: [{ cardId: 1, position: 'Presente', isReversed: false }],
        predefinedQuestionId: 1,
      };

      await expect(createReading(createData)).rejects.toThrow('Error al crear lectura');
    });

    it('should correctly determine arcana from category, not number', async () => {
      // Minor Arcana card with number 1 (As de Bastos) should be 'minor', not 'major'
      const mockApiResponseWithMinor = {
        id: 124,
        userId: 1,
        spreadId: 1,
        tarotistaId: 1,
        customQuestion: '¿Qué me depara el futuro?',
        cards: [
          {
            id: 23,
            name: 'As de Bastos',
            number: 1, // Same number as El Mago, but different arcana
            category: 'bastos', // Minor Arcana
            imageUrl: '/cards/ace-wands.jpg',
          },
          {
            id: 1,
            name: 'El Mago',
            number: 1, // Same number as As de Bastos
            category: 'arcanos_mayores', // Major Arcana
            imageUrl: '/cards/magician.jpg',
          },
        ],
        cardPositions: [
          { cardId: 23, position: 'Pasado', isReversed: false },
          { cardId: 1, position: 'Presente', isReversed: false },
        ],
        interpretation: 'Tu lectura muestra...',
        createdAt: '2025-11-20T10:30:00.000Z',
      };

      const createData: CreateReadingDto = {
        spreadId: 1,
        deckId: 1,
        cardIds: [23, 1],
        cardPositions: [
          { cardId: 23, position: 'Pasado', isReversed: false },
          { cardId: 1, position: 'Presente', isReversed: false },
        ],
        customQuestion: '¿Qué me depara el futuro?',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockApiResponseWithMinor });

      const result = await createReading(createData);

      // As de Bastos (number: 1, category: 'bastos') should be minor arcana
      expect(result.cards[0].arcana).toBe('minor');
      expect(result.cards[0].suit).toBe('bastos');

      // El Mago (number: 1, category: 'arcanos_mayores') should be major arcana
      expect(result.cards[1].arcana).toBe('major');
      expect(result.cards[1].suit).toBeNull();
    });
  });

  // ==========================================================================
  // getMyReadings
  // ==========================================================================
  describe('getMyReadings', () => {
    const mockPaginatedReadings: PaginatedReadings = {
      data: [
        {
          id: 123,
          spreadId: 1,
          spreadName: 'Tres Cartas',
          question: '¿Qué me depara el futuro amoroso?',
          createdAt: '2025-11-20T10:30:00.000Z',
          cardsCount: 3,
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
      },
    };

    it('should fetch paginated readings', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPaginatedReadings });

      const result = await getMyReadings(1, 10);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.BASE, {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockPaginatedReadings);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getMyReadings(1, 10)).rejects.toThrow('Error al obtener lecturas');
    });
  });

  // ==========================================================================
  // getReadingById
  // ==========================================================================
  describe('getReadingById', () => {
    // Mock API response (raw backend format)
    const mockApiResponse = {
      id: 123,
      userId: 1,
      spreadId: 1,
      customQuestion: '¿Qué me depara el futuro?',
      cards: [],
      cardPositions: [],
      interpretation: 'Tu lectura muestra...',
      createdAt: '2025-11-20T10:30:00.000Z',
    };

    // Expected transformed result
    const expectedReading: ReadingDetail = {
      id: 123,
      userId: 1,
      spreadId: 1,
      tarotistaId: undefined,
      question: '¿Qué me depara el futuro?',
      cards: [],
      interpretation: 'Tu lectura muestra...',
      freeInterpretations: null,
      createdAt: '2025-11-20T10:30:00.000Z',
      deletedAt: undefined,
      shareToken: undefined,
    };

    it('should fetch reading by id', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockApiResponse });

      const result = await getReadingById(123);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.BY_ID(123));
      expect(result).toEqual(expectedReading);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getReadingById(123)).rejects.toThrow('Error al obtener lectura');
    });
  });

  // ==========================================================================
  // deleteReading
  // ==========================================================================
  describe('deleteReading', () => {
    it('should delete reading by id', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined });

      await deleteReading(123);

      expect(apiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.BY_ID(123));
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteReading(123)).rejects.toThrow('Error al eliminar lectura');
    });
  });

  // ==========================================================================
  // regenerateInterpretation
  // ==========================================================================
  describe('regenerateInterpretation', () => {
    // Mock API response (raw backend format)
    const mockApiResponse = {
      id: 123,
      userId: 1,
      spreadId: 1,
      customQuestion: '¿Qué me depara el futuro?',
      cards: [],
      cardPositions: [],
      interpretation: 'Nueva interpretación regenerada...',
      createdAt: '2025-11-20T10:30:00.000Z',
    };

    // Expected transformed result
    const expectedReading: ReadingDetail = {
      id: 123,
      userId: 1,
      spreadId: 1,
      tarotistaId: undefined,
      question: '¿Qué me depara el futuro?',
      cards: [],
      interpretation: 'Nueva interpretación regenerada...',
      freeInterpretations: null,
      createdAt: '2025-11-20T10:30:00.000Z',
      deletedAt: undefined,
      shareToken: undefined,
    };

    it('should regenerate reading interpretation', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockApiResponse });

      const result = await regenerateInterpretation(123);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.REGENERATE(123));
      expect(result).toEqual(expectedReading);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(regenerateInterpretation(123)).rejects.toThrow(
        'Error al regenerar interpretación'
      );
    });
  });

  // ==========================================================================
  // shareReading
  // ==========================================================================
  describe('shareReading', () => {
    const mockShareResponse: ShareReadingResponse = {
      shareToken: 'abc123xyz',
    };

    it('should share reading and return share token', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockShareResponse });

      const result = await shareReading(123);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.SHARE(123));
      expect(result).toEqual(mockShareResponse);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(shareReading(123)).rejects.toThrow('Error al compartir lectura');
    });
  });

  // ==========================================================================
  // unshareReading
  // ==========================================================================
  describe('unshareReading', () => {
    it('should unshare reading', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined });

      await unshareReading(123);

      expect(apiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.SHARE(123));
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Network error'));

      await expect(unshareReading(123)).rejects.toThrow('Error al dejar de compartir lectura');
    });
  });

  // ==========================================================================
  // getTrashedReadings
  // ==========================================================================
  describe('getTrashedReadings', () => {
    const mockTrashedReadings: TrashedReading[] = [
      {
        id: 123,
        spreadId: 1,
        spreadName: 'Cruz Celta',
        question: '¿Qué me depara el futuro?',
        cardsCount: 10,
        createdAt: '2025-11-20T10:30:00.000Z',
        deletedAt: '2025-12-01T10:00:00.000Z',
        restorable: true,
      },
    ];

    it('should fetch trashed readings', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockTrashedReadings });

      const result = await getTrashedReadings();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.TRASH);
      expect(result).toEqual(mockTrashedReadings);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getTrashedReadings()).rejects.toThrow('Error al obtener lecturas eliminadas');
    });
  });

  // ==========================================================================
  // restoreReading
  // ==========================================================================
  describe('restoreReading', () => {
    const mockRestoredReading: Reading = {
      id: 123,
      spreadId: 1,
      spreadName: 'Cruz Celta',
      question: '¿Qué me depara el futuro?',
      cardsCount: 10,
      createdAt: '2025-11-20T10:30:00.000Z',
      deletedAt: null,
    };

    it('should restore a trashed reading', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRestoredReading });

      const result = await restoreReading(123);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.READINGS.RESTORE(123));
      expect(result).toEqual(mockRestoredReading);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(restoreReading(123)).rejects.toThrow('Error al restaurar lectura');
    });
  });
});
