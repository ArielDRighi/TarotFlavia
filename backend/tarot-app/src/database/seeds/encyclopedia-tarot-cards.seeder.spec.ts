import { DataSource, Repository } from 'typeorm';
import { EncyclopediaTarotCard } from '../../modules/encyclopedia/entities/encyclopedia-tarot-card.entity';
import { ArcanaType, Suit } from '../../modules/encyclopedia/enums/tarot.enums';
import { seedEncyclopediaTarotCards } from './encyclopedia-tarot-cards.seeder';
import {
  ALL_TAROT_CARDS,
  TOTAL_CARDS,
} from '../../modules/encyclopedia/data/cards-seed.data';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRepository(
  count: number,
  savedCards: Partial<EncyclopediaTarotCard>[] = [],
): jest.Mocked<Repository<EncyclopediaTarotCard>> {
  return {
    count: jest.fn().mockResolvedValue(count),
    create: jest
      .fn()
      .mockImplementation(
        (data: Partial<EncyclopediaTarotCard>) => data as EncyclopediaTarotCard,
      ),
    save: jest
      .fn()
      .mockImplementation(
        (cards: EncyclopediaTarotCard | EncyclopediaTarotCard[]) =>
          Array.isArray(cards)
            ? Promise.resolve(cards.map((c, i) => ({ ...c, id: i + 1 })))
            : Promise.resolve({ ...cards, id: 1 } as EncyclopediaTarotCard),
      ),
    find: jest.fn().mockResolvedValue(savedCards),
  } as unknown as jest.Mocked<Repository<EncyclopediaTarotCard>>;
}

function makeDataSource(
  repo: jest.Mocked<Repository<EncyclopediaTarotCard>>,
): jest.Mocked<DataSource> {
  return {
    getRepository: jest.fn().mockReturnValue(repo),
  } as unknown as jest.Mocked<DataSource>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('seedEncyclopediaTarotCards', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---- Idempotencia --------------------------------------------------------

  it('should skip seeding when cards already exist', async () => {
    const repo = makeRepository(78);
    const dataSource = makeDataSource(repo);

    await seedEncyclopediaTarotCards(dataSource);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should insert cards when database is empty', async () => {
    const repo = makeRepository(0);
    const dataSource = makeDataSource(repo);

    await seedEncyclopediaTarotCards(dataSource);

    expect(repo.save).toHaveBeenCalled();
  });

  // ---- Cantidad de cartas --------------------------------------------------

  it('should insert exactly 78 cards', async () => {
    const repo = makeRepository(0);
    const dataSource = makeDataSource(repo);

    await seedEncyclopediaTarotCards(dataSource);

    expect(repo.save).toHaveBeenCalledTimes(1);
    const savedCards = repo.save.mock.calls[0][0] as EncyclopediaTarotCard[];
    expect(savedCards).toHaveLength(78);
  });

  // ---- Datos de seed -------------------------------------------------------

  it('TOTAL_CARDS constant should equal 78', () => {
    expect(TOTAL_CARDS).toBe(78);
  });

  it('ALL_TAROT_CARDS should contain exactly 78 cards', () => {
    expect(ALL_TAROT_CARDS).toHaveLength(78);
  });

  it('should have exactly 22 major arcana cards', () => {
    const majorCards = ALL_TAROT_CARDS.filter(
      (c) => c.arcanaType === ArcanaType.MAJOR,
    );
    expect(majorCards).toHaveLength(22);
  });

  it('should have exactly 56 minor arcana cards', () => {
    const minorCards = ALL_TAROT_CARDS.filter(
      (c) => c.arcanaType === ArcanaType.MINOR,
    );
    expect(minorCards).toHaveLength(56);
  });

  it('should have 14 cards per suit', () => {
    const suits = [Suit.WANDS, Suit.CUPS, Suit.SWORDS, Suit.PENTACLES];
    suits.forEach((suit) => {
      const cards = ALL_TAROT_CARDS.filter((c) => c.suit === suit);
      expect(cards).toHaveLength(14);
    });
  });

  it('should have all unique slugs', () => {
    const slugs = ALL_TAROT_CARDS.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(ALL_TAROT_CARDS.length);
  });

  it('should have all required fields filled for every card', () => {
    ALL_TAROT_CARDS.forEach((card) => {
      expect(card.slug).toBeTruthy();
      expect(card.nameEn).toBeTruthy();
      expect(card.nameEs).toBeTruthy();
      expect(card.arcanaType).toBeTruthy();
      expect(card.number).toBeDefined();
      expect(card.meaningUpright).toBeTruthy();
      expect(card.meaningReversed).toBeTruthy();
      expect(card.description).toBeTruthy();
      expect(card.keywords).toBeDefined();
      expect(card.keywords.upright.length).toBeGreaterThan(0);
      expect(card.keywords.reversed.length).toBeGreaterThan(0);
      expect(card.imageUrl).toBeTruthy();
    });
  });

  it('should have roman numerals for all major arcana cards', () => {
    const majorCards = ALL_TAROT_CARDS.filter(
      (c) => c.arcanaType === ArcanaType.MAJOR,
    );
    majorCards.forEach((card) => {
      expect(card.romanNumeral).toBeTruthy();
    });
  });

  it('should have suit set for all minor arcana cards', () => {
    const minorCards = ALL_TAROT_CARDS.filter(
      (c) => c.arcanaType === ArcanaType.MINOR,
    );
    minorCards.forEach((card) => {
      expect(card.suit).toBeTruthy();
    });
  });

  it('should have no suit for major arcana cards', () => {
    const majorCards = ALL_TAROT_CARDS.filter(
      (c) => c.arcanaType === ArcanaType.MAJOR,
    );
    majorCards.forEach((card) => {
      expect(card.suit).toBeUndefined();
    });
  });

  it('should have no roman numeral for minor arcana cards', () => {
    const minorCards = ALL_TAROT_CARDS.filter(
      (c) => c.arcanaType === ArcanaType.MINOR,
    );
    minorCards.forEach((card) => {
      expect(card.romanNumeral).toBeUndefined();
    });
  });

  it('should have slugs matching kebab-case pattern', () => {
    const slugPattern = /^[a-z0-9-]+$/;
    ALL_TAROT_CARDS.forEach((card) => {
      expect(card.slug).toMatch(slugPattern);
    });
  });

  it('should have major arcana numbers from 0 to 21', () => {
    const majorCards = ALL_TAROT_CARDS.filter(
      (c) => c.arcanaType === ArcanaType.MAJOR,
    );
    const numbers = majorCards.map((c) => c.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 22 }, (_, i) => i));
  });

  it('should have minor arcana numbers from 1 to 14 per suit', () => {
    const suits = [Suit.WANDS, Suit.CUPS, Suit.SWORDS, Suit.PENTACLES];
    suits.forEach((suit) => {
      const cards = ALL_TAROT_CARDS.filter((c) => c.suit === suit);
      const numbers = cards.map((c) => c.number).sort((a, b) => a - b);
      expect(numbers).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    });
  });

  // ---- Descripción mínima --------------------------------------------------

  it('should have meaningful content (description >= 30 chars per card)', () => {
    ALL_TAROT_CARDS.forEach((card) => {
      expect(card.description.length).toBeGreaterThanOrEqual(30);
      expect(card.meaningUpright.length).toBeGreaterThanOrEqual(20);
      expect(card.meaningReversed.length).toBeGreaterThanOrEqual(20);
    });
  });
});
