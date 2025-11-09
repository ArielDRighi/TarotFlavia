import { Repository } from 'typeorm';
import { TarotDeck } from '../../modules/tarot/decks/entities/tarot-deck.entity';
import { seedTarotDecks } from './tarot-decks.seeder';
import { RIDER_WAITE_DECK } from './data/tarot-decks.data';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

describe('TarotDecksSeeder', () => {
  let mockDeckRepository: jest.Mocked<Repository<TarotDeck>>;

  beforeEach(() => {
    mockDeckRepository = {
      count: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<TarotDeck>>;
  });

  describe('seedTarotDecks', () => {
    it('should seed the Rider-Waite deck when database is empty', async () => {
      // Arrange
      mockDeckRepository.count.mockResolvedValue(0);
      const savedDeck = {
        id: 1,
        ...RIDER_WAITE_DECK,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TarotDeck;
      mockDeckRepository.save.mockResolvedValue(savedDeck);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      expect(mockDeckRepository.count).toHaveBeenCalledTimes(1);
      expect(mockDeckRepository.save).toHaveBeenCalledTimes(1);
      expect(mockDeckRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Rider-Waite',
          isDefault: true,
          cardCount: 78,
        }),
      );
    });

    it('should skip seeding if decks already exist (idempotency)', async () => {
      // Arrange
      mockDeckRepository.count.mockResolvedValue(1);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      expect(mockDeckRepository.count).toHaveBeenCalledTimes(1);
      expect(mockDeckRepository.save).not.toHaveBeenCalled();
    });

    it('should seed deck with correct historical metadata', async () => {
      // Arrange
      mockDeckRepository.count.mockResolvedValue(0);
      const savedDeck = {
        id: 1,
        ...RIDER_WAITE_DECK,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TarotDeck;
      mockDeckRepository.save.mockResolvedValue(savedDeck);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      expect(mockDeckRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          artist: 'Pamela Colman Smith',
          yearCreated: 1909,
          tradition: 'Hermética / Orden del Amanecer Dorado',
        }),
      );
    });

    it('should set isDefault to true for Rider-Waite deck', async () => {
      // Arrange
      mockDeckRepository.count.mockResolvedValue(0);
      const savedDeck = {
        id: 1,
        ...RIDER_WAITE_DECK,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TarotDeck;
      mockDeckRepository.save.mockResolvedValue(savedDeck);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      expect(mockDeckRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isDefault: true,
        }),
      );
    });

    it('should set isActive to true for the deck', async () => {
      // Arrange
      mockDeckRepository.count.mockResolvedValue(0);
      const savedDeck = {
        id: 1,
        ...RIDER_WAITE_DECK,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TarotDeck;
      mockDeckRepository.save.mockResolvedValue(savedDeck);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      expect(mockDeckRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('should seed deck with complete description', async () => {
      // Arrange
      mockDeckRepository.count.mockResolvedValue(0);
      const savedDeck = {
        id: 1,
        ...RIDER_WAITE_DECK,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TarotDeck;
      mockDeckRepository.save.mockResolvedValue(savedDeck);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      const savedData = mockDeckRepository.save.mock.calls[0][0] as TarotDeck;
      expect(savedData.description).toContain('Arthur Edward Waite');
      expect(savedData.description).toContain('Pamela Colman Smith');
      expect(savedData.description).toContain('1909');
    });

    it('should seed deck with valid imageUrl', async () => {
      // Arrange
      mockDeckRepository.count.mockResolvedValue(0);
      const savedDeck = {
        id: 1,
        ...RIDER_WAITE_DECK,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TarotDeck;
      mockDeckRepository.save.mockResolvedValue(savedDeck);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      expect(mockDeckRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: expect.stringContaining('http'),
        }),
      );
    });

    it('should seed exactly 78 cards in the deck', async () => {
      // Arrange
      mockDeckRepository.count.mockResolvedValue(0);
      const savedDeck = {
        id: 1,
        ...RIDER_WAITE_DECK,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TarotDeck;
      mockDeckRepository.save.mockResolvedValue(savedDeck);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      expect(mockDeckRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          cardCount: 78,
        }),
      );
    });

    it('should log the seeding process', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockDeckRepository.count.mockResolvedValue(0);
      const savedDeck = {
        id: 1,
        ...RIDER_WAITE_DECK,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TarotDeck;
      mockDeckRepository.save.mockResolvedValue(savedDeck);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting Tarot Decks seeding'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successfully seeded'),
      );

      consoleSpy.mockRestore();
    });

    it('should create deck entity with all required fields from data', async () => {
      // Arrange
      mockDeckRepository.count.mockResolvedValue(0);
      const savedDeck = {
        id: 1,
        ...RIDER_WAITE_DECK,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TarotDeck;
      mockDeckRepository.save.mockResolvedValue(savedDeck);

      // Act
      await seedTarotDecks(mockDeckRepository);

      // Assert
      const savedData = mockDeckRepository.save.mock.calls[0][0] as TarotDeck;
      expect(savedData).toMatchObject({
        name: RIDER_WAITE_DECK.name,
        description: RIDER_WAITE_DECK.description,
        imageUrl: RIDER_WAITE_DECK.imageUrl,
        cardCount: RIDER_WAITE_DECK.cardCount,
        isActive: RIDER_WAITE_DECK.isActive,
        isDefault: RIDER_WAITE_DECK.isDefault,
      });
    });
  });
});
