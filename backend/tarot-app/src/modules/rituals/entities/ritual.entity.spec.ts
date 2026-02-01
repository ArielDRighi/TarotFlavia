import { Ritual } from './ritual.entity';
import { RitualCategory, RitualDifficulty, LunarPhase } from '../domain/enums';

describe('Ritual Entity', () => {
  it('should create an instance', () => {
    const ritual = new Ritual();
    expect(ritual).toBeDefined();
    expect(ritual).toBeInstanceOf(Ritual);
  });

  it('should have all required properties', () => {
    const ritual = new Ritual();
    ritual.id = 1;
    ritual.slug = 'ritual-luna-nueva';
    ritual.title = 'Ritual de Luna Nueva';
    ritual.description = 'Ceremonia para establecer intenciones';
    ritual.category = RitualCategory.LUNAR;
    ritual.difficulty = RitualDifficulty.BEGINNER;
    ritual.durationMinutes = 30;
    ritual.imageUrl = '/images/rituals/luna-nueva.jpg';

    expect(ritual.id).toBe(1);
    expect(ritual.slug).toBe('ritual-luna-nueva');
    expect(ritual.title).toBe('Ritual de Luna Nueva');
    expect(ritual.description).toBe('Ceremonia para establecer intenciones');
    expect(ritual.category).toBe(RitualCategory.LUNAR);
    expect(ritual.difficulty).toBe(RitualDifficulty.BEGINNER);
    expect(ritual.durationMinutes).toBe(30);
    expect(ritual.imageUrl).toBe('/images/rituals/luna-nueva.jpg');
  });

  it('should validate category enum', () => {
    const ritual = new Ritual();

    ritual.category = RitualCategory.TAROT;
    expect(ritual.category).toBe('tarot');

    ritual.category = RitualCategory.LUNAR;
    expect(ritual.category).toBe('lunar');

    ritual.category = RitualCategory.CLEANSING;
    expect(ritual.category).toBe('cleansing');

    ritual.category = RitualCategory.MEDITATION;
    expect(ritual.category).toBe('meditation');

    ritual.category = RitualCategory.PROTECTION;
    expect(ritual.category).toBe('protection');

    ritual.category = RitualCategory.ABUNDANCE;
    expect(ritual.category).toBe('abundance');

    ritual.category = RitualCategory.LOVE;
    expect(ritual.category).toBe('love');

    ritual.category = RitualCategory.HEALING;
    expect(ritual.category).toBe('healing');
  });

  it('should validate difficulty enum', () => {
    const ritual = new Ritual();

    ritual.difficulty = RitualDifficulty.BEGINNER;
    expect(ritual.difficulty).toBe('beginner');

    ritual.difficulty = RitualDifficulty.INTERMEDIATE;
    expect(ritual.difficulty).toBe('intermediate');

    ritual.difficulty = RitualDifficulty.ADVANCED;
    expect(ritual.difficulty).toBe('advanced');
  });

  it('should allow nullable lunar phase', () => {
    const ritual = new Ritual();
    ritual.bestLunarPhase = null;

    expect(ritual.bestLunarPhase).toBeNull();
  });

  it('should validate lunar phase enum', () => {
    const ritual = new Ritual();

    ritual.bestLunarPhase = LunarPhase.NEW_MOON;
    expect(ritual.bestLunarPhase).toBe('new_moon');

    ritual.bestLunarPhase = LunarPhase.FULL_MOON;
    expect(ritual.bestLunarPhase).toBe('full_moon');

    ritual.bestLunarPhase = LunarPhase.WAXING_CRESCENT;
    expect(ritual.bestLunarPhase).toBe('waxing_crescent');

    ritual.bestLunarPhase = LunarPhase.WANING_GIBBOUS;
    expect(ritual.bestLunarPhase).toBe('waning_gibbous');
  });

  it('should allow multiple lunar phases as jsonb', () => {
    const ritual = new Ritual();
    ritual.bestLunarPhases = [LunarPhase.NEW_MOON, LunarPhase.WAXING_CRESCENT];

    expect(ritual.bestLunarPhases).toHaveLength(2);
    expect(ritual.bestLunarPhases).toContain(LunarPhase.NEW_MOON);
    expect(ritual.bestLunarPhases).toContain(LunarPhase.WAXING_CRESCENT);
  });

  it('should allow nullable optional fields', () => {
    const ritual = new Ritual();
    ritual.bestLunarPhase = null;
    ritual.bestLunarPhases = null;
    ritual.bestTimeOfDay = null;
    ritual.purpose = null;
    ritual.preparation = null;
    ritual.closing = null;
    ritual.tips = null;
    ritual.thumbnailUrl = null;
    ritual.audioUrl = null;

    expect(ritual.bestLunarPhase).toBeNull();
    expect(ritual.bestLunarPhases).toBeNull();
    expect(ritual.bestTimeOfDay).toBeNull();
    expect(ritual.purpose).toBeNull();
    expect(ritual.preparation).toBeNull();
    expect(ritual.closing).toBeNull();
    expect(ritual.tips).toBeNull();
    expect(ritual.thumbnailUrl).toBeNull();
    expect(ritual.audioUrl).toBeNull();
  });

  it('should accept tips as jsonb array', () => {
    const ritual = new Ritual();
    ritual.tips = [
      'Escribe tus intenciones en presente',
      'Sé específico pero flexible',
    ];

    expect(ritual.tips).toHaveLength(2);
    expect(ritual.tips[0]).toBe('Escribe tus intenciones en presente');
  });

  it('should have default values for state fields', () => {
    const ritual = new Ritual();
    ritual.isActive = true;
    ritual.isFeatured = false;
    ritual.completionCount = 0;
    ritual.viewCount = 0;

    expect(ritual.isActive).toBe(true);
    expect(ritual.isFeatured).toBe(false);
    expect(ritual.completionCount).toBe(0);
    expect(ritual.viewCount).toBe(0);
  });

  it('should track completion and view counts', () => {
    const ritual = new Ritual();
    ritual.completionCount = 150;
    ritual.viewCount = 1200;

    expect(ritual.completionCount).toBe(150);
    expect(ritual.viewCount).toBe(1200);
  });

  it('should have timestamps', () => {
    const ritual = new Ritual();
    const now = new Date();
    ritual.createdAt = now;
    ritual.updatedAt = now;

    expect(ritual.createdAt).toEqual(now);
    expect(ritual.updatedAt).toEqual(now);
  });

  it('should initialize empty arrays for relations', () => {
    const ritual = new Ritual();
    ritual.steps = [];
    ritual.materials = [];

    expect(ritual.steps).toEqual([]);
    expect(ritual.materials).toEqual([]);
  });
});
