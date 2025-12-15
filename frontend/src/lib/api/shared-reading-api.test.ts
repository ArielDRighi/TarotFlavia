/**
 * Shared Reading API Tests
 *
 * Tests for public shared reading API functions (no authentication required)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSharedReading, publicClient } from './shared-reading-api';
import { API_ENDPOINTS } from './endpoints';
import type { SharedReading } from '@/types';

describe('getSharedReading', () => {
  const mockToken = 'abc123xyz456';
  const mockReading: SharedReading = {
    id: 1,
    question: '¿Encontraré el amor?',
    predefinedQuestionId: null,
    customQuestion: '¿Encontraré el amor?',
    questionType: 'custom',
    tarotistaId: null,
    cards: [
      {
        id: 1,
        name: 'The Fool',
        arcana: 'major',
        number: 0,
        suit: null,
        imageUrl: '/cards/fool.jpg',
      },
    ],
    cardPositions: [
      {
        cardId: 1,
        position: 'Present',
        isReversed: false,
      },
    ],
    deck: {
      id: 1,
      name: 'Rider-Waite',
    },
    category: null,
    predefinedQuestion: null,
    interpretation: 'Esta es tu interpretación...',
    sharedToken: mockToken,
    isPublic: true,
    viewCount: 5,
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
    regenerationCount: 0,
  };

  let mockGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGet = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(publicClient, 'get').mockImplementation(mockGet as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch shared reading by token', async () => {
    mockGet.mockResolvedValue({ data: mockReading });

    const result = await getSharedReading(mockToken);

    expect(result).toEqual(mockReading);
    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.SHARED.BY_TOKEN(mockToken));
  });

  it('should throw specific error when reading not found (404)', async () => {
    mockGet.mockRejectedValue({
      response: { status: 404 },
    });

    await expect(getSharedReading(mockToken)).rejects.toThrow(
      'Lectura compartida no encontrada o ya no está disponible'
    );
  });

  it('should throw generic error on network failure', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    await expect(getSharedReading(mockToken)).rejects.toThrow(
      'Error al obtener la lectura compartida'
    );
  });

  it('should throw generic error on other HTTP errors', async () => {
    mockGet.mockRejectedValue({
      response: { status: 500 },
    });

    await expect(getSharedReading(mockToken)).rejects.toThrow(
      'Error al obtener la lectura compartida'
    );
  });
});
