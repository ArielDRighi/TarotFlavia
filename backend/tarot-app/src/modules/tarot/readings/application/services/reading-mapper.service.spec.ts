import { Test, TestingModule } from '@nestjs/testing';
import { ReadingMapperService } from './reading-mapper.service';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { TarotCard } from '../../../cards/entities/tarot-card.entity';
import { ReadingListItemDto } from '../../dto/reading-list-item.dto';

describe('ReadingMapperService', () => {
  let service: ReadingMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadingMapperService],
    }).compile();

    service = module.get<ReadingMapperService>(ReadingMapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toListItemDto', () => {
    it('should map TarotReading to ReadingListItemDto with card previews', () => {
      const mockCards: Partial<TarotCard>[] = [
        { id: 1, name: 'El Loco', imageUrl: 'https://example.com/loco.jpg' },
        { id: 2, name: 'El Mago', imageUrl: 'https://example.com/mago.jpg' },
        {
          id: 3,
          name: 'La Sacerdotisa',
          imageUrl: 'https://example.com/sacerdotisa.jpg',
        },
        {
          id: 4,
          name: 'La Emperatriz',
          imageUrl: 'https://example.com/emperatriz.jpg',
        },
      ];

      const mockReading: Partial<TarotReading> = {
        id: 1,
        question: '¿Qué me depara el futuro?',
        cards: mockCards as TarotCard[],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
          { cardId: 3, position: 'future', isReversed: false },
          { cardId: 4, position: 'outcome', isReversed: true },
        ],
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
        deletedAt: undefined,
      };

      const result: ReadingListItemDto = service.toListItemDto(
        mockReading as TarotReading,
        1,
        'Tirada de 3 cartas',
      );

      expect(result).toEqual({
        id: 1,
        question: '¿Qué me depara el futuro?',
        spreadId: 1,
        spreadName: 'Tirada de 3 cartas',
        cardsCount: 4,
        cardPreviews: [
          {
            id: 1,
            name: 'El Loco',
            imageUrl: 'https://example.com/loco.jpg',
            isReversed: false,
          },
          {
            id: 2,
            name: 'El Mago',
            imageUrl: 'https://example.com/mago.jpg',
            isReversed: true,
          },
          {
            id: 3,
            name: 'La Sacerdotisa',
            imageUrl: 'https://example.com/sacerdotisa.jpg',
            isReversed: false,
          },
        ],
        createdAt: '2023-12-01T10:00:00.000Z',
        deletedAt: undefined,
      });
    });

    it('should handle readings with less than 3 cards', () => {
      const mockCards: Partial<TarotCard>[] = [
        { id: 1, name: 'El Loco', imageUrl: 'https://example.com/loco.jpg' },
        { id: 2, name: 'El Mago', imageUrl: 'https://example.com/mago.jpg' },
      ];

      const mockReading: Partial<TarotReading> = {
        id: 1,
        question: '¿Pregunta?',
        cards: mockCards as TarotCard[],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: true },
        ],
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
      };

      const result = service.toListItemDto(
        mockReading as TarotReading,
        1,
        'Tirada simple',
      );

      expect(result.cardsCount).toBe(2);
      expect(result.cardPreviews).toHaveLength(2);
    });

    it('should handle readings with no cards', () => {
      const mockReading: Partial<TarotReading> = {
        id: 1,
        question: '¿Pregunta?',
        cards: [],
        cardPositions: [],
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
      };

      const result = service.toListItemDto(
        mockReading as TarotReading,
        1,
        'Tirada simple',
      );

      expect(result.cardsCount).toBe(0);
      expect(result.cardPreviews).toEqual([]);
    });

    it('should handle readings with deletedAt', () => {
      const mockReading: Partial<TarotReading> = {
        id: 1,
        question: '¿Pregunta?',
        cards: [],
        cardPositions: [],
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
        deletedAt: new Date('2023-12-05T10:00:00.000Z'),
      };

      const result = service.toListItemDto(
        mockReading as TarotReading,
        1,
        'Tirada simple',
      );

      expect(result.deletedAt).toBe('2023-12-05T10:00:00.000Z');
    });

    it('should use customQuestion if question is not set', () => {
      const mockReading: Partial<TarotReading> = {
        id: 1,
        question: undefined,
        customQuestion: '¿Custom question?',
        cards: [],
        cardPositions: [],
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
      };

      const result = service.toListItemDto(
        mockReading as TarotReading,
        1,
        'Tirada simple',
      );

      expect(result.question).toBe('¿Custom question?');
    });

    it('should use predefinedQuestion.question if available', () => {
      const mockReading: Partial<TarotReading> = {
        id: 1,
        question: undefined,
        customQuestion: undefined,
        predefinedQuestion: { id: 1, question: '¿Predefined question?' },
        cards: [],
        cardPositions: [],
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
      };

      const result = service.toListItemDto(
        mockReading as TarotReading,
        1,
        'Tirada simple',
      );

      expect(result.question).toBe('¿Predefined question?');
    });

    it('should fallback to empty string if no question is available', () => {
      const mockReading: Partial<TarotReading> = {
        id: 1,
        question: undefined,
        customQuestion: undefined,
        predefinedQuestion: undefined,
        cards: [],
        cardPositions: [],
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
      };

      const result = service.toListItemDto(
        mockReading as TarotReading,
        1,
        'Tirada simple',
      );

      expect(result.question).toBe('');
    });
  });
});
