import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { CardFreeInterpretation } from '../../modules/tarot/cards/entities/card-free-interpretation.entity';
import { ReadingCategory } from '../../modules/categories/entities/reading-category.entity';
import { seedCardFreeInterpretations } from './card-free-interpretations.seeder';
import { CARD_FREE_INTERPRETATIONS } from '../../modules/tarot/cards/seeds/card-free-interpretations.data';

// ─── Helpers ────────────────────────────────────────────────────────────────

const MAJOR_ARCANA_CARDS: Partial<TarotCard>[] = [
  { id: 1, name: 'El Loco', number: 0, category: 'arcanos_mayores' },
  { id: 2, name: 'El Mago', number: 1, category: 'arcanos_mayores' },
  { id: 3, name: 'La Sacerdotisa', number: 2, category: 'arcanos_mayores' },
  { id: 4, name: 'La Emperatriz', number: 3, category: 'arcanos_mayores' },
  { id: 5, name: 'El Emperador', number: 4, category: 'arcanos_mayores' },
  {
    id: 6,
    name: 'El Papa (El Hierofante)',
    number: 5,
    category: 'arcanos_mayores',
  },
  { id: 7, name: 'Los Amantes', number: 6, category: 'arcanos_mayores' },
  { id: 8, name: 'El Carro', number: 7, category: 'arcanos_mayores' },
  { id: 9, name: 'La Fuerza', number: 8, category: 'arcanos_mayores' },
  { id: 10, name: 'El Ermitaño', number: 9, category: 'arcanos_mayores' },
  {
    id: 11,
    name: 'La Rueda de la Fortuna',
    number: 10,
    category: 'arcanos_mayores',
  },
  { id: 12, name: 'La Justicia', number: 11, category: 'arcanos_mayores' },
  { id: 13, name: 'El Colgado', number: 12, category: 'arcanos_mayores' },
  { id: 14, name: 'La Muerte', number: 13, category: 'arcanos_mayores' },
  { id: 15, name: 'La Templanza', number: 14, category: 'arcanos_mayores' },
  { id: 16, name: 'El Diablo', number: 15, category: 'arcanos_mayores' },
  { id: 17, name: 'La Torre', number: 16, category: 'arcanos_mayores' },
  { id: 18, name: 'La Estrella', number: 17, category: 'arcanos_mayores' },
  { id: 19, name: 'La Luna', number: 18, category: 'arcanos_mayores' },
  { id: 20, name: 'El Sol', number: 19, category: 'arcanos_mayores' },
  { id: 21, name: 'El Juicio', number: 20, category: 'arcanos_mayores' },
  { id: 22, name: 'El Mundo', number: 21, category: 'arcanos_mayores' },
];

const FREE_CATEGORIES: Partial<ReadingCategory>[] = [
  { id: 1, slug: 'amor-relaciones' },
  { id: 2, slug: 'salud-bienestar' },
  { id: 3, slug: 'dinero-finanzas' },
];

function buildMockQueryBuilder(): jest.Mocked<
  Partial<SelectQueryBuilder<CardFreeInterpretation>>
> {
  const qb = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    orUpdate: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ identifiers: [{ id: 1 }] }),
  };
  return qb as jest.Mocked<Partial<SelectQueryBuilder<CardFreeInterpretation>>>;
}

function buildMockDataSource(overrides?: {
  majorArcana?: Partial<TarotCard>[];
  categories?: Partial<ReadingCategory>[];
  interpretationCount?: number;
}): jest.Mocked<Partial<DataSource>> {
  const cards = overrides?.majorArcana ?? MAJOR_ARCANA_CARDS;
  const categories = overrides?.categories ?? FREE_CATEGORIES;
  const interpretationCount = overrides?.interpretationCount ?? 132;

  const cardRepo: jest.Mocked<Partial<Repository<TarotCard>>> = {
    find: jest.fn().mockResolvedValue(cards),
  };

  const categoryRepo: jest.Mocked<Partial<Repository<ReadingCategory>>> = {
    find: jest.fn().mockResolvedValue(categories),
  };

  const mockQb = buildMockQueryBuilder();

  const interpretationRepo: jest.Mocked<
    Partial<Repository<CardFreeInterpretation>>
  > = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQb),
    count: jest.fn().mockResolvedValue(interpretationCount),
  };

  const mockDataSource: jest.Mocked<Partial<DataSource>> = {
    getRepository: jest.fn().mockImplementation((entity: unknown) => {
      const entityName =
        typeof entity === 'function' ? entity.name : String(entity);
      if (entityName === 'TarotCard') return cardRepo;
      if (entityName === 'ReadingCategory') return categoryRepo;
      if (entityName === 'CardFreeInterpretation') return interpretationRepo;
      return {};
    }),
  };

  return mockDataSource;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('seedCardFreeInterpretations', () => {
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

  // ── Data integrity ────────────────────────────────────────────────────────

  describe('CARD_FREE_INTERPRETATIONS data', () => {
    it('should contain exactly 132 records (22 cards × 3 categories × 2 orientations)', () => {
      expect(CARD_FREE_INTERPRETATIONS).toHaveLength(132);
    });

    it('should have 6 entries per card (3 categories × 2 orientations)', () => {
      const cardSlugs = [
        ...new Set(CARD_FREE_INTERPRETATIONS.map((d) => d.cardSlug)),
      ];
      expect(cardSlugs).toHaveLength(22);

      for (const slug of cardSlugs) {
        const entries = CARD_FREE_INTERPRETATIONS.filter(
          (d) => d.cardSlug === slug,
        );
        expect(entries).toHaveLength(6);
      }
    });

    it('should cover all 3 FREE categories for every card', () => {
      const cardSlugs = [
        ...new Set(CARD_FREE_INTERPRETATIONS.map((d) => d.cardSlug)),
      ];
      const expectedCategories = [
        'amor-relaciones',
        'salud-bienestar',
        'dinero-finanzas',
      ] as const;

      for (const slug of cardSlugs) {
        const categoriesForCard = CARD_FREE_INTERPRETATIONS.filter(
          (d) => d.cardSlug === slug,
        ).map((d) => d.categorySlug);

        for (const cat of expectedCategories) {
          expect(categoriesForCard).toContain(cat);
        }
      }
    });

    it('should have both upright and reversed for every card+category combination', () => {
      const cardSlugs = [
        ...new Set(CARD_FREE_INTERPRETATIONS.map((d) => d.cardSlug)),
      ];
      const categories = [
        'amor-relaciones',
        'salud-bienestar',
        'dinero-finanzas',
      ] as const;

      for (const slug of cardSlugs) {
        for (const cat of categories) {
          const entries = CARD_FREE_INTERPRETATIONS.filter(
            (d) => d.cardSlug === slug && d.categorySlug === cat,
          );
          const orientations = entries.map((d) => d.orientation);
          expect(orientations).toContain('upright');
          expect(orientations).toContain('reversed');
        }
      }
    });

    it('should have non-empty content for every record', () => {
      for (const data of CARD_FREE_INTERPRETATIONS) {
        expect(data.content).toBeTruthy();
        expect(data.content.trim().length).toBeGreaterThan(0);
      }
    });

    it('should have content with at least 30 characters per record', () => {
      for (const data of CARD_FREE_INTERPRETATIONS) {
        expect(data.content.length).toBeGreaterThanOrEqual(30);
      }
    });

    it('should have no duplicate (cardSlug, categorySlug, orientation) combinations', () => {
      const keys = CARD_FREE_INTERPRETATIONS.map(
        (d) => `${d.cardSlug}|${d.categorySlug}|${d.orientation}`,
      );
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(CARD_FREE_INTERPRETATIONS.length);
    });

    it('should only use valid category slugs', () => {
      const validSlugs = new Set([
        'amor-relaciones',
        'salud-bienestar',
        'dinero-finanzas',
      ]);
      for (const data of CARD_FREE_INTERPRETATIONS) {
        expect(validSlugs.has(data.categorySlug)).toBe(true);
      }
    });

    it('should only use valid orientations', () => {
      const validOrientations = new Set(['upright', 'reversed']);
      for (const data of CARD_FREE_INTERPRETATIONS) {
        expect(validOrientations.has(data.orientation)).toBe(true);
      }
    });

    it('should include all 22 expected Major Arcana card slugs', () => {
      const expectedSlugs = [
        'el-loco',
        'el-mago',
        'la-sacerdotisa',
        'la-emperatriz',
        'el-emperador',
        'el-papa-el-hierofante',
        'los-amantes',
        'el-carro',
        'la-fuerza',
        'el-ermitano',
        'la-rueda-de-la-fortuna',
        'la-justicia',
        'el-colgado',
        'la-muerte',
        'la-templanza',
        'el-diablo',
        'la-torre',
        'la-estrella',
        'la-luna',
        'el-sol',
        'el-juicio',
        'el-mundo',
      ];
      const actualSlugs = [
        ...new Set(CARD_FREE_INTERPRETATIONS.map((d) => d.cardSlug)),
      ].sort();
      expect(actualSlugs).toEqual(expectedSlugs.sort());
    });
  });

  // ── Seeder happy path ──────────────────────────────────────────────────────

  describe('happy path — all 22 cards and 3 categories found', () => {
    it('should call getRepository for TarotCard, ReadingCategory and CardFreeInterpretation', async () => {
      const mockDs = buildMockDataSource();

      await seedCardFreeInterpretations(mockDs as unknown as DataSource);

      expect(mockDs.getRepository).toHaveBeenCalledWith(TarotCard);
      expect(mockDs.getRepository).toHaveBeenCalledWith(ReadingCategory);
      expect(mockDs.getRepository).toHaveBeenCalledWith(CardFreeInterpretation);
    });

    it('should execute upsert for all 132 interpretations', async () => {
      const mockDs = buildMockDataSource();
      const interpretationRepo = mockDs.getRepository!(
        CardFreeInterpretation,
      ) as jest.Mocked<Partial<Repository<CardFreeInterpretation>>>;

      await seedCardFreeInterpretations(mockDs as unknown as DataSource);

      const qb = (interpretationRepo.createQueryBuilder as jest.Mock).mock
        .results[0]?.value;
      expect(qb.execute).toHaveBeenCalledTimes(132);
    });

    it('should log completion message', async () => {
      const mockDs = buildMockDataSource();

      await seedCardFreeInterpretations(mockDs as unknown as DataSource);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Card Free Interpretations seeding complete'),
      );
    });

    it('should query only arcanos_mayores cards', async () => {
      const mockDs = buildMockDataSource();
      const cardRepo = mockDs.getRepository!(TarotCard) as jest.Mocked<
        Partial<Repository<TarotCard>>
      >;

      await seedCardFreeInterpretations(mockDs as unknown as DataSource);

      expect(cardRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'arcanos_mayores' },
        }),
      );
    });
  });

  // ── Error cases ────────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('should throw if no Major Arcana cards found', async () => {
      const mockDs = buildMockDataSource({ majorArcana: [] });

      await expect(
        seedCardFreeInterpretations(mockDs as unknown as DataSource),
      ).rejects.toThrow('No Major Arcana cards found');
    });

    it('should warn and return early if no FREE categories found', async () => {
      const mockDs = buildMockDataSource({ categories: [] });

      await expect(
        seedCardFreeInterpretations(mockDs as unknown as DataSource),
      ).resolves.toBeUndefined();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No FREE categories found'),
      );
    });
  });

  // ── Partial category data ─────────────────────────────────────────────────

  describe('partial categories (missing one)', () => {
    it('should warn and skip records when a category is missing', async () => {
      // Only amor-relaciones and salud-bienestar — dinero-finanzas is missing
      const mockDs = buildMockDataSource({
        categories: [
          { id: 1, slug: 'amor-relaciones' },
          { id: 2, slug: 'salud-bienestar' },
        ],
      });
      const interpretationRepo = mockDs.getRepository!(
        CardFreeInterpretation,
      ) as jest.Mocked<Partial<Repository<CardFreeInterpretation>>>;

      await seedCardFreeInterpretations(mockDs as unknown as DataSource);

      // Only 2 of 3 categories are available → 22 × 2 × 2 = 88 upserts
      const qb = (interpretationRepo.createQueryBuilder as jest.Mock).mock
        .results[0]?.value;
      expect(qb.execute).toHaveBeenCalledTimes(88);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing categories'),
      );
    });
  });
});
