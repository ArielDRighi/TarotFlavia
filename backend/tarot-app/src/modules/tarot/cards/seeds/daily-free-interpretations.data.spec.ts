import {
  DAILY_FREE_INTERPRETATIONS,
  DailyFreeInterpretationData,
} from './daily-free-interpretations.data';

const EXPECTED_SLUGS = [
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

describe('DAILY_FREE_INTERPRETATIONS data integrity', () => {
  it('should contain exactly 22 entries (one per Major Arcana)', () => {
    expect(DAILY_FREE_INTERPRETATIONS).toHaveLength(22);
  });

  it('should include all 22 expected Major Arcana card slugs', () => {
    const actualSlugs = DAILY_FREE_INTERPRETATIONS.map(
      (d: DailyFreeInterpretationData) => d.cardSlug,
    ).sort();
    expect(actualSlugs).toEqual(EXPECTED_SLUGS.sort());
  });

  it('should have no duplicate cardSlugs', () => {
    const slugs = DAILY_FREE_INTERPRETATIONS.map(
      (d: DailyFreeInterpretationData) => d.cardSlug,
    );
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(DAILY_FREE_INTERPRETATIONS.length);
  });

  it('should have non-empty dailyUpright for every entry', () => {
    for (const data of DAILY_FREE_INTERPRETATIONS) {
      expect(data.dailyUpright).toBeTruthy();
      expect(data.dailyUpright.trim().length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty dailyReversed for every entry', () => {
    for (const data of DAILY_FREE_INTERPRETATIONS) {
      expect(data.dailyReversed).toBeTruthy();
      expect(data.dailyReversed.trim().length).toBeGreaterThan(0);
    }
  });

  it('should have dailyUpright with at least 50 characters per entry', () => {
    for (const data of DAILY_FREE_INTERPRETATIONS) {
      expect(data.dailyUpright.length).toBeGreaterThanOrEqual(50);
    }
  });

  it('should have dailyReversed with at least 50 characters per entry', () => {
    for (const data of DAILY_FREE_INTERPRETATIONS) {
      expect(data.dailyReversed.length).toBeGreaterThanOrEqual(50);
    }
  });

  it('should have different dailyUpright and dailyReversed texts for every entry', () => {
    for (const data of DAILY_FREE_INTERPRETATIONS) {
      expect(data.dailyUpright).not.toBe(data.dailyReversed);
    }
  });
});
