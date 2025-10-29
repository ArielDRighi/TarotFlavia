import { DataSource, Repository } from 'typeorm';
import { TarotSpread } from '../../modules/tarot/spreads/entities/tarot-spread.entity';
import { seedTarotSpreads } from './tarot-spreads.seeder';

interface SpreadData {
  name: string;
  description: string;
  cardCount: number;
  positions: Array<{
    position: number;
    name: string;
    description: string;
    interpretation_focus: string;
  }>;
  difficulty?: string;
  isBeginnerFriendly?: boolean;
  whenToUse?: string;
}

describe('TarotSpreads Seeder', () => {
  let dataSource: DataSource;
  let spreadsRepository: Repository<TarotSpread>;
  let mockCount: jest.Mock;
  let mockSave: jest.Mock;
  let mockFind: jest.Mock;

  beforeEach(() => {
    mockCount = jest.fn();
    mockSave = jest.fn();
    mockFind = jest.fn();

    // Mock del repository
    spreadsRepository = {
      count: mockCount,
      save: mockSave,
      find: mockFind,
      create: jest.fn((data) => data as TarotSpread),
    } as unknown as Repository<TarotSpread>;

    // Mock del dataSource
    dataSource = {
      getRepository: jest.fn().mockReturnValue(spreadsRepository),
    } as unknown as DataSource;
  });

  describe('seedTarotSpreads', () => {
    it('should be defined', () => {
      expect(seedTarotSpreads).toBeDefined();
    });

    it('should skip seeding if spreads already exist', async () => {
      // Arrange
      mockCount.mockResolvedValue(4);

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      expect(mockCount).toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should seed spreads when database is empty', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      mockSave.mockResolvedValue([]);

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      expect(mockCount).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });

    it('should seed exactly 4 spreads', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      expect(savedSpreads).toHaveLength(4);
    });

    it('should seed spreads with correct structure', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      savedSpreads.forEach((spread) => {
        expect(spread.name).toBeDefined();
        expect(spread.description).toBeDefined();
        expect(spread.cardCount).toBeDefined();
        expect(spread.positions).toBeDefined();
        expect(Array.isArray(spread.positions)).toBe(true);

        // Validar que cardCount coincide con la longitud de positions
        expect(spread.positions.length).toBe(spread.cardCount);

        // Validar estructura de positions
        spread.positions.forEach((position, index) => {
          expect(position.position).toBe(index + 1);
          expect(position.name).toBeDefined();
          expect(position.description).toBeDefined();
          expect(position.interpretation_focus).toBeDefined();
        });
      });
    });

    it('should include 1-card spread', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      const oneCardSpread = savedSpreads.find(
        (spread) => spread.cardCount === 1,
      );
      expect(oneCardSpread).toBeDefined();
      expect(oneCardSpread?.name).toContain('1 Carta');
    });

    it('should include 3-card spread (Past-Present-Future)', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      const threeCardSpread = savedSpreads.find(
        (spread) => spread.cardCount === 3,
      );
      expect(threeCardSpread).toBeDefined();
      expect(threeCardSpread?.positions).toHaveLength(3);
      expect(threeCardSpread?.positions[0]?.name).toBe('Pasado');
      expect(threeCardSpread?.positions[1]?.name).toBe('Presente');
      expect(threeCardSpread?.positions[2]?.name).toBe('Futuro');
    });

    it('should include 5-card spread', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      const fiveCardSpread = savedSpreads.find(
        (spread) => spread.cardCount === 5,
      );
      expect(fiveCardSpread).toBeDefined();
      expect(fiveCardSpread?.positions).toHaveLength(5);
    });

    it('should include 10-card spread (Celtic Cross)', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      const celticCrossSpread = savedSpreads.find(
        (spread) => spread.cardCount === 10,
      );
      expect(celticCrossSpread).toBeDefined();
      expect(celticCrossSpread?.name).toContain('Cruz Céltica');
      expect(celticCrossSpread?.positions).toHaveLength(10);
    });

    it('should include difficulty field in all spreads', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      savedSpreads.forEach((spread) => {
        expect(spread.difficulty).toBeDefined();
        expect(['beginner', 'intermediate', 'advanced']).toContain(
          spread.difficulty,
        );
      });
    });

    it('should include is_beginner_friendly field in all spreads', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      savedSpreads.forEach((spread) => {
        expect(spread.isBeginnerFriendly).toBeDefined();
        expect(typeof spread.isBeginnerFriendly).toBe('boolean');
      });
    });

    it('should include when_to_use field in all spreads', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      savedSpreads.forEach((spread) => {
        expect(spread.whenToUse).toBeDefined();
        if (spread.whenToUse) {
          expect(typeof spread.whenToUse).toBe('string');
          expect(spread.whenToUse.length).toBeGreaterThan(10);
        }
      });
    });

    it('should validate that cardCount matches positions length', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      let savedSpreads: SpreadData[] = [];
      mockSave.mockImplementation((spreads: SpreadData[]) => {
        savedSpreads = spreads;
        return Promise.resolve(spreads);
      });

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      savedSpreads.forEach((spread) => {
        expect(spread.positions.length).toBe(spread.cardCount);
      });
    });

    it('should log seeding information', async () => {
      // Arrange
      mockCount.mockResolvedValue(0);
      mockSave.mockResolvedValue([]);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await seedTarotSpreads(dataSource);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tarot spreads seeded successfully'),
      );

      consoleSpy.mockRestore();
    });
  });
});
