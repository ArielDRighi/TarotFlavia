import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { TarotDeck } from '../../modules/tarot/decks/entities/tarot-deck.entity';
import { seedTarotCards } from './tarot-cards.seeder';

describe('TarotCards Seeder', () => {
  let cardRepository: Repository<TarotCard>;
  let deckRepository: Repository<TarotDeck>;
  let mockDeck: TarotDeck;

  beforeEach(async () => {
    // Create mock deck
    mockDeck = {
      id: 1,
      name: 'Rider-Waite',
      description: 'Standard Rider-Waite deck',
      imageUrl: 'https://example.com/rider-waite.jpg',
      cardCount: 78,
      isActive: true,
      isDefault: true,
      artist: 'Pamela Colman Smith',
      yearCreated: 1909,
      tradition: 'Hermética',
      publisher: 'Rider & Company',
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(TarotCard),
          useValue: {
            count: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              insert: jest.fn().mockReturnThis(),
              into: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              orIgnore: jest.fn().mockReturnThis(),
              execute: jest.fn().mockResolvedValue({}),
            })),
          },
        },
        {
          provide: getRepositoryToken(TarotDeck),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockDeck),
            count: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    cardRepository = module.get<Repository<TarotCard>>(
      getRepositoryToken(TarotCard),
    );
    deckRepository = module.get<Repository<TarotDeck>>(
      getRepositoryToken(TarotDeck),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Card Count Validation', () => {
    it('should seed exactly 78 tarot cards', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      expect(saveSpy).toHaveBeenCalled();
      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      expect(savedCards).toHaveLength(78);
    });

    it('should have 22 Arcanos Mayores', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      const arcanosMayores = savedCards.filter(
        (card) => card.category === 'arcanos_mayores',
      );
      expect(arcanosMayores).toHaveLength(22);
    });

    it('should have 14 Bastos cards', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      const bastos = savedCards.filter((card) => card.category === 'bastos');
      expect(bastos).toHaveLength(14);
    });

    it('should have 14 Copas cards', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      const copas = savedCards.filter((card) => card.category === 'copas');
      expect(copas).toHaveLength(14);
    });

    it('should have 14 Espadas cards', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      const espadas = savedCards.filter((card) => card.category === 'espadas');
      expect(espadas).toHaveLength(14);
    });

    it('should have 14 Oros cards', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      const oros = savedCards.filter((card) => card.category === 'oros');
      expect(oros).toHaveLength(14);
    });
  });

  describe('Card Data Validation', () => {
    it('should have all required fields for each card', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];

      savedCards.forEach((card) => {
        expect(card.name).toBeDefined();
        expect(card.name).not.toBe('');
        expect(card.number).toBeDefined();
        expect(card.category).toBeDefined();
        expect(card.imageUrl).toBeDefined();
        expect(card.meaningUpright).toBeDefined();
        expect(card.meaningReversed).toBeDefined();
        expect(card.description).toBeDefined();
        expect(card.keywords).toBeDefined();
        expect(card.deckId).toBe(mockDeck.id);
      });
    });

    it('should have unique card names', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      const names = savedCards.map((card) => card.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(78);
    });
  });

  describe('Idempotency', () => {
    it('should not seed cards if cards already exist', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(78);
      const saveSpy = jest.spyOn(cardRepository, 'save');

      await seedTarotCards(cardRepository, deckRepository);

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should seed cards only once when run multiple times on empty database', async () => {
      let callCount = 0;
      jest.spyOn(cardRepository, 'count').mockImplementation(() => {
        const count = callCount > 0 ? 78 : 0;
        callCount++;
        return Promise.resolve(count);
      });

      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      // First call - should seed
      await seedTarotCards(cardRepository, deckRepository);
      expect(saveSpy).toHaveBeenCalledTimes(1);

      // Second call - should not seed
      await seedTarotCards(cardRepository, deckRepository);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deck Association', () => {
    it('should require a deck to exist before seeding cards', async () => {
      jest.spyOn(deckRepository, 'count').mockResolvedValue(0);
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);

      await expect(
        seedTarotCards(cardRepository, deckRepository),
      ).rejects.toThrow('Cannot seed cards: no deck exists');
    });

    it('should associate all cards with the Rider-Waite deck', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      savedCards.forEach((card) => {
        expect(card.deckId).toBe(mockDeck.id);
      });
    });
  });

  describe('Card Categories', () => {
    it('should only have valid categories', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      const validCategories = [
        'arcanos_mayores',
        'bastos',
        'copas',
        'espadas',
        'oros',
      ];

      savedCards.forEach((card) => {
        expect(validCategories).toContain(card.category);
      });
    });
  });

  describe('Card Numbers', () => {
    it('should have numbers 0-21 for Arcanos Mayores', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      const arcanosMayores = savedCards.filter(
        (card) => card.category === 'arcanos_mayores',
      );
      const numbers = arcanosMayores
        .map((card) => card.number)
        .sort((a, b) => a - b);

      expect(numbers).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21,
      ]);
    });

    it('should have numbers 1-14 for each Minor Arcana suit', async () => {
      jest.spyOn(cardRepository, 'count').mockResolvedValue(0);
      const saveSpy = jest
        .spyOn(cardRepository, 'save')
        .mockImplementation((cards) => Promise.resolve(cards as any));

      await seedTarotCards(cardRepository, deckRepository);

      const savedCards = saveSpy.mock.calls[0][0] as TarotCard[];
      const suits = ['bastos', 'copas', 'espadas', 'oros'];

      suits.forEach((suit) => {
        const suitCards = savedCards.filter((card) => card.category === suit);
        const numbers = suitCards
          .map((card) => card.number)
          .sort((a, b) => a - b);
        expect(numbers).toEqual([
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        ]);
      });
    });
  });
});
