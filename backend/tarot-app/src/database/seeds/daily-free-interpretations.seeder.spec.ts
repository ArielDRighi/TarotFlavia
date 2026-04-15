import { DataSource, Repository } from 'typeorm';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { seedDailyFreeInterpretations } from './daily-free-interpretations.seeder';
import { DAILY_FREE_INTERPRETATIONS } from '../../modules/tarot/cards/seeds/daily-free-interpretations.data';

// ─── Helpers ────────────────────────────────────────────────────────────────

const MAJOR_ARCANA_CARDS: Partial<TarotCard>[] = [
  { id: 1, name: 'El Loco', category: 'arcanos_mayores' },
  { id: 2, name: 'El Mago', category: 'arcanos_mayores' },
  { id: 3, name: 'La Sacerdotisa', category: 'arcanos_mayores' },
  { id: 4, name: 'La Emperatriz', category: 'arcanos_mayores' },
  { id: 5, name: 'El Emperador', category: 'arcanos_mayores' },
  { id: 6, name: 'El Papa (El Hierofante)', category: 'arcanos_mayores' },
  { id: 7, name: 'Los Amantes', category: 'arcanos_mayores' },
  { id: 8, name: 'El Carro', category: 'arcanos_mayores' },
  { id: 9, name: 'La Fuerza', category: 'arcanos_mayores' },
  { id: 10, name: 'El Ermitaño', category: 'arcanos_mayores' },
  { id: 11, name: 'La Rueda de la Fortuna', category: 'arcanos_mayores' },
  { id: 12, name: 'La Justicia', category: 'arcanos_mayores' },
  { id: 13, name: 'El Colgado', category: 'arcanos_mayores' },
  { id: 14, name: 'La Muerte', category: 'arcanos_mayores' },
  { id: 15, name: 'La Templanza', category: 'arcanos_mayores' },
  { id: 16, name: 'El Diablo', category: 'arcanos_mayores' },
  { id: 17, name: 'La Torre', category: 'arcanos_mayores' },
  { id: 18, name: 'La Estrella', category: 'arcanos_mayores' },
  { id: 19, name: 'La Luna', category: 'arcanos_mayores' },
  { id: 20, name: 'El Sol', category: 'arcanos_mayores' },
  { id: 21, name: 'El Juicio', category: 'arcanos_mayores' },
  { id: 22, name: 'El Mundo', category: 'arcanos_mayores' },
];

function buildMockDataSource(overrides?: {
  majorArcana?: Partial<TarotCard>[];
  cardCount?: number;
}): jest.Mocked<Partial<DataSource>> {
  const cards = overrides?.majorArcana ?? MAJOR_ARCANA_CARDS;
  const cardCount = overrides?.cardCount ?? 22;

  const cardRepo: jest.Mocked<Partial<Repository<TarotCard>>> = {
    find: jest.fn().mockResolvedValue(cards),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    count: jest.fn().mockResolvedValue(cardCount),
  };

  const mockDataSource: jest.Mocked<Partial<DataSource>> = {
    getRepository: jest.fn().mockReturnValue(cardRepo),
  };

  return mockDataSource;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('seedDailyFreeInterpretations', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  describe('happy path — all 22 Major Arcana found', () => {
    it('should call getRepository with TarotCard', async () => {
      const mockDs = buildMockDataSource();

      await seedDailyFreeInterpretations(mockDs as unknown as DataSource);

      expect(mockDs.getRepository).toHaveBeenCalledWith(TarotCard);
    });

    it('should call update exactly 22 times (one per card)', async () => {
      const mockDs = buildMockDataSource();
      const cardRepo = mockDs.getRepository!(TarotCard) as jest.Mocked<
        Partial<Repository<TarotCard>>
      >;

      await seedDailyFreeInterpretations(mockDs as unknown as DataSource);

      expect(cardRepo.update).toHaveBeenCalledTimes(
        DAILY_FREE_INTERPRETATIONS.length,
      );
    });

    it('should update each card with dailyFreeUpright and dailyFreeReversed fields', async () => {
      const mockDs = buildMockDataSource();
      const cardRepo = mockDs.getRepository!(TarotCard) as jest.Mocked<
        Partial<Repository<TarotCard>>
      >;

      await seedDailyFreeInterpretations(mockDs as unknown as DataSource);

      const calls = (cardRepo.update as jest.Mock).mock.calls;
      for (const [, payload] of calls) {
        expect(payload).toHaveProperty('dailyFreeUpright');
        expect(payload).toHaveProperty('dailyFreeReversed');
        expect(typeof payload.dailyFreeUpright).toBe('string');
        expect(typeof payload.dailyFreeReversed).toBe('string');
      }
    });

    it('should query cards filtered to arcanos_mayores category', async () => {
      const mockDs = buildMockDataSource();
      const cardRepo = mockDs.getRepository!(TarotCard) as jest.Mocked<
        Partial<Repository<TarotCard>>
      >;

      await seedDailyFreeInterpretations(mockDs as unknown as DataSource);

      expect(cardRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'arcanos_mayores' },
        }),
      );
    });

    it('should log a completion message', async () => {
      const mockDs = buildMockDataSource();

      await seedDailyFreeInterpretations(mockDs as unknown as DataSource);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Daily Free Interpretations seeding complete'),
      );
    });
  });

  // ── Error cases ─────────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('should throw if no Major Arcana cards are found', async () => {
      const mockDs = buildMockDataSource({ majorArcana: [] });

      await expect(
        seedDailyFreeInterpretations(mockDs as unknown as DataSource),
      ).rejects.toThrow('No Major Arcana cards found');
    });
  });

  // ── Slug mismatch ────────────────────────────────────────────────────────────

  describe('slug mismatch handling', () => {
    it('should warn and skip cards whose slug does not match any data entry', async () => {
      // Replace one real card with a name that will never match a data slug
      const cardsWithUnknown: Partial<TarotCard>[] = [
        ...MAJOR_ARCANA_CARDS.slice(1), // drop El Loco
        { id: 99, name: 'Carta Desconocida', category: 'arcanos_mayores' },
      ];

      const mockDs = buildMockDataSource({ majorArcana: cardsWithUnknown });
      const cardRepo = mockDs.getRepository!(TarotCard) as jest.Mocked<
        Partial<Repository<TarotCard>>
      >;

      await seedDailyFreeInterpretations(mockDs as unknown as DataSource);

      // El Loco data entry won't find a matching card → warn logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('el-loco'),
      );
      // 21 known cards updated (El Loco missing), 'Carta Desconocida' never matches
      expect(cardRepo.update).toHaveBeenCalledTimes(21);
    });
  });
});
