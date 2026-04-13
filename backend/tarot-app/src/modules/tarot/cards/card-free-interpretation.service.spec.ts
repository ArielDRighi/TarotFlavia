import { Test, TestingModule } from '@nestjs/testing';
import { CardFreeInterpretationService } from './card-free-interpretation.service';
import { ICardFreeInterpretationRepository } from './domain/interfaces/card-free-interpretation-repository.interface';
import { CardFreeInterpretation } from './entities/card-free-interpretation.entity';
import { TarotCard } from './entities/tarot-card.entity';

type CardPosition = { cardId: number; position: string; isReversed: boolean };

const buildCard = (id: number, overrides: Partial<TarotCard> = {}): TarotCard =>
  ({
    id,
    name: `Carta ${id}`,
    number: id,
    category: 'arcanos_mayores',
    imageUrl: '',
    reversedImageUrl: null,
    meaningUpright: `Significado derecho de carta ${id}`,
    meaningReversed: `Significado invertido de carta ${id}`,
    description: '',
    keywords: '',
    deckId: 1,
    dailyFreeUpright: null,
    dailyFreeReversed: null,
    deck: { id: 1, name: 'Test Deck' } as TarotCard['deck'],
    readings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as TarotCard;

const buildInterpretation = (
  cardId: number,
  categoryId: number,
  orientation: 'upright' | 'reversed',
  content: string,
): CardFreeInterpretation =>
  ({
    id: Math.random(),
    cardId,
    categoryId,
    orientation,
    content,
    card: { id: cardId } as CardFreeInterpretation['card'],
    category: { id: categoryId } as CardFreeInterpretation['category'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as CardFreeInterpretation;

describe('CardFreeInterpretationService', () => {
  let service: CardFreeInterpretationService;
  let mockRepo: jest.Mocked<ICardFreeInterpretationRepository>;

  const mockCards: TarotCard[] = [buildCard(1), buildCard(3), buildCard(7)];

  const mockPositions: CardPosition[] = [
    { cardId: 1, position: 'pasado', isReversed: false },
    { cardId: 3, position: 'presente', isReversed: true },
    { cardId: 7, position: 'futuro', isReversed: false },
  ];

  const categoryId = 2;

  beforeEach(async () => {
    mockRepo = {
      findByCardsAndCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardFreeInterpretationService,
        {
          provide: 'ICardFreeInterpretationRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CardFreeInterpretationService>(
      CardFreeInterpretationService,
    );
    jest.clearAllMocks();
  });

  describe('findByCardsAndCategory', () => {
    it('debería retornar un mapa indexado por posición con los textos encontrados', async () => {
      mockRepo.findByCardsAndCategory.mockResolvedValue([
        buildInterpretation(1, categoryId, 'upright', 'El Loco en amor...'),
        buildInterpretation(
          3,
          categoryId,
          'reversed',
          'La Torre invertida en amor...',
        ),
        buildInterpretation(7, categoryId, 'upright', 'El Sol en amor...'),
      ]);

      const result = await service.findByCardsAndCategory(
        mockCards,
        mockPositions,
        categoryId,
      );

      // pasado: cardId=1, upright → 'El Loco en amor...'
      expect(result[0]).toEqual({ content: 'El Loco en amor...' });
      // presente: cardId=3, reversed → 'La Torre invertida en amor...'
      expect(result[1]).toEqual({ content: 'La Torre invertida en amor...' });
      // futuro: cardId=7, upright → 'El Sol en amor...'
      expect(result[2]).toEqual({ content: 'El Sol en amor...' });
    });

    it('debería llamar al repositorio con los cardIds, orientaciones y categoryId correctos (deduplicados)', async () => {
      mockRepo.findByCardsAndCategory.mockResolvedValue([]);

      await service.findByCardsAndCategory(
        mockCards,
        mockPositions,
        categoryId,
      );

      // cardIds [1,3,7] ya son únicos; orientaciones ['upright','reversed','upright'] → dedup → ['upright','reversed']
      expect(mockRepo.findByCardsAndCategory).toHaveBeenCalledWith(
        [1, 3, 7],
        ['upright', 'reversed'],
        categoryId,
      );
    });

    it('debería deduplicar cardIds duplicados antes de llamar al repositorio', async () => {
      const cardsWithDup = [buildCard(1), buildCard(1), buildCard(3)];
      const positionsWithDup: CardPosition[] = [
        { cardId: 1, position: 'primera', isReversed: false },
        { cardId: 1, position: 'segunda', isReversed: false },
        { cardId: 3, position: 'tercera', isReversed: false },
      ];

      mockRepo.findByCardsAndCategory.mockResolvedValue([]);

      await service.findByCardsAndCategory(
        cardsWithDup,
        positionsWithDup,
        categoryId,
      );

      // cardIds [1,1,3] → dedup → [1,3]; orientaciones ['upright','upright','upright'] → dedup → ['upright']
      expect(mockRepo.findByCardsAndCategory).toHaveBeenCalledWith(
        [1, 3],
        ['upright'],
        categoryId,
      );
    });

    it('debería usar meaningUpright como fallback cuando no hay interpretación pre-escrita para una carta upright', async () => {
      // Solo retorna interpretación para la carta 1, no para 3 y 7
      mockRepo.findByCardsAndCategory.mockResolvedValue([
        buildInterpretation(1, categoryId, 'upright', 'El Loco en amor...'),
      ]);

      const result = await service.findByCardsAndCategory(
        mockCards,
        mockPositions,
        categoryId,
      );

      // pasado: tiene interpretación
      expect(result[0]).toEqual({ content: 'El Loco en amor...' });
      // presente: cardId=3, reversed → usa meaningReversed de la carta (fallback)
      expect(result[1]).toEqual({
        content: 'Significado invertido de carta 3',
      });
      // futuro: cardId=7, upright → usa meaningUpright de la carta (fallback)
      expect(result[2]).toEqual({ content: 'Significado derecho de carta 7' });
    });

    it('debería usar meaningReversed como fallback cuando la carta es reversed y no hay interpretación', async () => {
      mockRepo.findByCardsAndCategory.mockResolvedValue([]);

      const positionsAllReversed: CardPosition[] = [
        { cardId: 1, position: 'pasado', isReversed: true },
      ];
      const cardsSubset = [buildCard(1)];

      const result = await service.findByCardsAndCategory(
        cardsSubset,
        positionsAllReversed,
        categoryId,
      );

      expect(result[0]).toEqual({
        content: 'Significado invertido de carta 1',
      });
    });

    it('debería manejar correctamente una tirada de 1 carta', async () => {
      const singleCard = [buildCard(5)];
      const singlePosition: CardPosition[] = [
        { cardId: 5, position: 'carta', isReversed: false },
      ];

      mockRepo.findByCardsAndCategory.mockResolvedValue([
        buildInterpretation(
          5,
          categoryId,
          'upright',
          'Texto único de la carta 5',
        ),
      ]);

      const result = await service.findByCardsAndCategory(
        singleCard,
        singlePosition,
        categoryId,
      );

      expect(Object.keys(result)).toHaveLength(1);
      expect(result[0]).toEqual({ content: 'Texto único de la carta 5' });
    });

    it('debería indexar por posición (índice 0..N-1) en el orden de cardPositions', async () => {
      const cards = [buildCard(10), buildCard(20)];
      const positions: CardPosition[] = [
        { cardId: 10, position: 'primera', isReversed: false },
        { cardId: 20, position: 'segunda', isReversed: false },
      ];

      mockRepo.findByCardsAndCategory.mockResolvedValue([
        buildInterpretation(10, categoryId, 'upright', 'Texto carta 10'),
        buildInterpretation(20, categoryId, 'upright', 'Texto carta 20'),
      ]);

      const result = await service.findByCardsAndCategory(
        cards,
        positions,
        categoryId,
      );

      expect(result[0]).toEqual({ content: 'Texto carta 10' });
      expect(result[1]).toEqual({ content: 'Texto carta 20' });
    });

    it('debería manejar cartas duplicadas en diferentes posiciones', async () => {
      // Tirada donde la misma carta aparece dos veces (improbable pero posible)
      const cards = [buildCard(1), buildCard(1)];
      const positions: CardPosition[] = [
        { cardId: 1, position: 'primera', isReversed: false },
        { cardId: 1, position: 'segunda', isReversed: true },
      ];

      mockRepo.findByCardsAndCategory.mockResolvedValue([
        buildInterpretation(1, categoryId, 'upright', 'Carta 1 upright'),
        buildInterpretation(1, categoryId, 'reversed', 'Carta 1 reversed'),
      ]);

      const result = await service.findByCardsAndCategory(
        cards,
        positions,
        categoryId,
      );

      expect(result[0]).toEqual({ content: 'Carta 1 upright' });
      expect(result[1]).toEqual({ content: 'Carta 1 reversed' });
    });

    it('debería retornar objeto vacío cuando no hay cartas ni posiciones', async () => {
      const result = await service.findByCardsAndCategory([], [], categoryId);

      expect(result).toEqual({});
      // El repositorio NO es llamado: guard clause por arrays vacíos
      expect(mockRepo.findByCardsAndCategory).not.toHaveBeenCalled();
    });
  });
});
