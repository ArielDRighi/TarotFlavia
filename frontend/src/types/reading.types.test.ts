/**
 * Tests for Reading Types
 *
 * TASK-UI-002: Tests para validar la extensión de la interfaz Reading
 * con campos de preview (spreadName, cardsCount, cardPreviews)
 */

import { describe, it, expect } from 'vitest';
import type { Reading, CardPreview } from './reading.types';

describe('Reading Types - TASK-UI-002', () => {
  describe('Reading interface', () => {
    it('should allow Reading with spreadName as required string', () => {
      const reading: Reading = {
        id: 1,
        spreadId: 2,
        spreadName: 'Cruz Celta',
        question: '¿Qué puedo esperar en mi relación?',
        createdAt: '2026-01-13T10:00:00Z',
        cardsCount: 10,
      };

      expect(reading.spreadName).toBe('Cruz Celta');
      expect(typeof reading.spreadName).toBe('string');
    });

    it('should allow Reading with cardsCount as required number', () => {
      const reading: Reading = {
        id: 1,
        spreadId: 2,
        spreadName: '3 Cartas',
        question: '¿Qué debo saber hoy?',
        createdAt: '2026-01-13T10:00:00Z',
        cardsCount: 3,
      };

      expect(reading.cardsCount).toBe(3);
      expect(typeof reading.cardsCount).toBe('number');
    });

    it('should allow Reading with optional cardPreviews array', () => {
      const cardPreviews: CardPreview[] = [
        {
          id: 1,
          name: 'El Loco',
          imageUrl: '/cards/fool.jpg',
          isReversed: false,
        },
        {
          id: 2,
          name: 'La Emperatriz',
          imageUrl: '/cards/empress.jpg',
          isReversed: true,
        },
      ];

      const reading: Reading = {
        id: 1,
        spreadId: 2,
        spreadName: '3 Cartas',
        question: '¿Qué me depara el futuro?',
        createdAt: '2026-01-13T10:00:00Z',
        cardsCount: 3,
        cardPreviews,
      };

      expect(reading.cardPreviews).toHaveLength(2);
      expect(reading.cardPreviews?.[0].name).toBe('El Loco');
      expect(reading.cardPreviews?.[1].isReversed).toBe(true);
    });

    it('should allow Reading without cardPreviews (optional)', () => {
      const reading: Reading = {
        id: 1,
        spreadId: 2,
        spreadName: 'Cruz Celta',
        question: '¿Qué puedo esperar?',
        createdAt: '2026-01-13T10:00:00Z',
        cardsCount: 10,
      };

      expect(reading.cardPreviews).toBeUndefined();
    });

    it('should allow Reading with optional deletedAt', () => {
      const reading: Reading = {
        id: 1,
        spreadId: 2,
        spreadName: 'Cruz Celta',
        question: '¿Qué puedo esperar?',
        createdAt: '2026-01-13T10:00:00Z',
        cardsCount: 10,
        deletedAt: '2026-01-13T11:00:00Z',
      };

      expect(reading.deletedAt).toBe('2026-01-13T11:00:00Z');
    });

    it('should allow Reading with optional shareToken', () => {
      const reading: Reading = {
        id: 1,
        spreadId: 2,
        spreadName: 'Cruz Celta',
        question: '¿Qué puedo esperar?',
        createdAt: '2026-01-13T10:00:00Z',
        cardsCount: 10,
        shareToken: 'abc123def456',
      };

      expect(reading.shareToken).toBe('abc123def456');
    });
  });

  describe('CardPreview interface', () => {
    it('should create valid CardPreview with all required fields', () => {
      const cardPreview: CardPreview = {
        id: 1,
        name: 'El Mago',
        imageUrl: '/cards/magician.jpg',
        isReversed: false,
      };

      expect(cardPreview.id).toBe(1);
      expect(cardPreview.name).toBe('El Mago');
      expect(cardPreview.imageUrl).toBe('/cards/magician.jpg');
      expect(cardPreview.isReversed).toBe(false);
    });

    it('should create valid reversed CardPreview', () => {
      const cardPreview: CardPreview = {
        id: 5,
        name: 'La Justicia',
        imageUrl: '/cards/justice.jpg',
        isReversed: true,
      };

      expect(cardPreview.isReversed).toBe(true);
    });

    it('should allow array of CardPreviews', () => {
      const cardPreviews: CardPreview[] = [
        {
          id: 1,
          name: 'El Loco',
          imageUrl: '/cards/fool.jpg',
          isReversed: false,
        },
        {
          id: 2,
          name: 'El Mago',
          imageUrl: '/cards/magician.jpg',
          isReversed: false,
        },
        {
          id: 3,
          name: 'La Sacerdotisa',
          imageUrl: '/cards/high-priestess.jpg',
          isReversed: true,
        },
      ];

      expect(cardPreviews).toHaveLength(3);
      expect(cardPreviews[0].name).toBe('El Loco');
      expect(cardPreviews[2].isReversed).toBe(true);
    });
  });

  describe('Type compatibility', () => {
    it('should allow cardPreviews to be used in Reading', () => {
      const preview1: CardPreview = {
        id: 1,
        name: 'El Loco',
        imageUrl: '/cards/fool.jpg',
        isReversed: false,
      };

      const preview2: CardPreview = {
        id: 2,
        name: 'El Mago',
        imageUrl: '/cards/magician.jpg',
        isReversed: true,
      };

      const reading: Reading = {
        id: 1,
        spreadId: 2,
        spreadName: '3 Cartas',
        question: '¿Qué me depara el futuro?',
        createdAt: '2026-01-13T10:00:00Z',
        cardsCount: 3,
        cardPreviews: [preview1, preview2],
      };

      expect(reading.cardPreviews).toHaveLength(2);
    });

    it('should allow empty cardPreviews array', () => {
      const reading: Reading = {
        id: 1,
        spreadId: 2,
        spreadName: '3 Cartas',
        question: '¿Qué me depara el futuro?',
        createdAt: '2026-01-13T10:00:00Z',
        cardsCount: 3,
        cardPreviews: [],
      };

      expect(reading.cardPreviews).toHaveLength(0);
    });
  });

  describe('Backward compatibility', () => {
    it('should maintain compatibility with existing Reading fields', () => {
      const reading: Reading = {
        id: 1,
        spreadId: 2,
        spreadName: 'Cruz Celta',
        question: '¿Qué puedo esperar?',
        createdAt: '2026-01-13T10:00:00Z',
        cardsCount: 10,
      };

      // Verificar campos existentes
      expect(reading.id).toBe(1);
      expect(reading.spreadId).toBe(2);
      expect(reading.question).toBe('¿Qué puedo esperar?');
      expect(reading.createdAt).toBe('2026-01-13T10:00:00Z');
    });
  });
});
