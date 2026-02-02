import { SacredEvent } from './sacred-event.entity';
import {
  SacredEventType,
  Sabbat,
  LunarPhase,
  Hemisphere,
  SacredEventImportance,
  RitualCategory,
} from '../domain/enums';

describe('SacredEvent Entity', () => {
  it('should create an instance', () => {
    const event = new SacredEvent();
    expect(event).toBeDefined();
    expect(event).toBeInstanceOf(SacredEvent);
  });

  it('should have all required properties', () => {
    const event = new SacredEvent();
    event.id = 1;
    event.name = 'Luna Llena en Leo';
    event.slug = 'luna-llena-leo-2026-01';
    event.description = 'Luna llena en el signo de Leo';
    event.eventType = SacredEventType.LUNAR_PHASE;
    event.eventDate = new Date('2026-01-15');
    event.importance = SacredEventImportance.HIGH;
    event.energyDescription = 'Energía ideal para manifestación y creatividad';

    expect(event.id).toBe(1);
    expect(event.name).toBe('Luna Llena en Leo');
    expect(event.slug).toBe('luna-llena-leo-2026-01');
    expect(event.description).toBe('Luna llena en el signo de Leo');
    expect(event.eventType).toBe(SacredEventType.LUNAR_PHASE);
    expect(event.eventDate).toEqual(new Date('2026-01-15'));
    expect(event.importance).toBe(SacredEventImportance.HIGH);
    expect(event.energyDescription).toBe(
      'Energía ideal para manifestación y creatividad',
    );
  });

  it('should validate event type enum', () => {
    const event = new SacredEvent();

    event.eventType = SacredEventType.SABBAT;
    expect(event.eventType).toBe('sabbat');

    event.eventType = SacredEventType.LUNAR_PHASE;
    expect(event.eventType).toBe('lunar_phase');

    event.eventType = SacredEventType.PORTAL;
    expect(event.eventType).toBe('portal');

    event.eventType = SacredEventType.CULTURAL;
    expect(event.eventType).toBe('cultural');

    event.eventType = SacredEventType.ECLIPSE;
    expect(event.eventType).toBe('eclipse');
  });

  it('should validate sabbat enum for SABBAT events', () => {
    const event = new SacredEvent();
    event.eventType = SacredEventType.SABBAT;

    event.sabbat = Sabbat.SAMHAIN;
    expect(event.sabbat).toBe('samhain');

    event.sabbat = Sabbat.YULE;
    expect(event.sabbat).toBe('yule');

    event.sabbat = Sabbat.IMBOLC;
    expect(event.sabbat).toBe('imbolc');

    event.sabbat = Sabbat.OSTARA;
    expect(event.sabbat).toBe('ostara');

    event.sabbat = Sabbat.BELTANE;
    expect(event.sabbat).toBe('beltane');

    event.sabbat = Sabbat.LITHA;
    expect(event.sabbat).toBe('litha');

    event.sabbat = Sabbat.LAMMAS;
    expect(event.sabbat).toBe('lammas');

    event.sabbat = Sabbat.MABON;
    expect(event.sabbat).toBe('mabon');
  });

  it('should allow sabbat to be null for non-SABBAT events', () => {
    const event = new SacredEvent();
    event.eventType = SacredEventType.LUNAR_PHASE;
    event.sabbat = null;

    expect(event.sabbat).toBeNull();
  });

  it('should validate lunar phase enum for LUNAR_PHASE events', () => {
    const event = new SacredEvent();
    event.eventType = SacredEventType.LUNAR_PHASE;

    event.lunarPhase = LunarPhase.NEW_MOON;
    expect(event.lunarPhase).toBe('new_moon');

    event.lunarPhase = LunarPhase.FULL_MOON;
    expect(event.lunarPhase).toBe('full_moon');

    event.lunarPhase = LunarPhase.WAXING_CRESCENT;
    expect(event.lunarPhase).toBe('waxing_crescent');

    event.lunarPhase = LunarPhase.WANING_GIBBOUS;
    expect(event.lunarPhase).toBe('waning_gibbous');
  });

  it('should allow lunar phase to be null for non-LUNAR events', () => {
    const event = new SacredEvent();
    event.eventType = SacredEventType.SABBAT;
    event.lunarPhase = null;

    expect(event.lunarPhase).toBeNull();
  });

  it('should validate hemisphere enum', () => {
    const event = new SacredEvent();

    event.hemisphere = Hemisphere.NORTH;
    expect(event.hemisphere).toBe('north');

    event.hemisphere = Hemisphere.SOUTH;
    expect(event.hemisphere).toBe('south');
  });

  it('should allow hemisphere to be null for global events', () => {
    const event = new SacredEvent();
    event.eventType = SacredEventType.LUNAR_PHASE;
    event.hemisphere = null; // Eventos lunares son globales

    expect(event.hemisphere).toBeNull();
  });

  it('should validate importance enum', () => {
    const event = new SacredEvent();

    event.importance = SacredEventImportance.HIGH;
    expect(event.importance).toBe('high');

    event.importance = SacredEventImportance.MEDIUM;
    expect(event.importance).toBe('medium');

    event.importance = SacredEventImportance.LOW;
    expect(event.importance).toBe('low');
  });

  it('should allow event time to be null', () => {
    const event = new SacredEvent();
    event.eventTime = null;

    expect(event.eventTime).toBeNull();
  });

  it('should accept event time as string', () => {
    const event = new SacredEvent();
    event.eventTime = '18:30:00';

    expect(event.eventTime).toBe('18:30:00');
  });

  it('should accept suggested ritual categories as jsonb array', () => {
    const event = new SacredEvent();
    event.suggestedRitualCategories = [
      RitualCategory.LUNAR,
      RitualCategory.MEDITATION,
    ];

    expect(event.suggestedRitualCategories).toHaveLength(2);
    expect(event.suggestedRitualCategories).toContain(RitualCategory.LUNAR);
    expect(event.suggestedRitualCategories).toContain(
      RitualCategory.MEDITATION,
    );
  });

  it('should allow suggested ritual categories to be null', () => {
    const event = new SacredEvent();
    event.suggestedRitualCategories = null;

    expect(event.suggestedRitualCategories).toBeNull();
  });

  it('should accept suggested ritual IDs as jsonb array', () => {
    const event = new SacredEvent();
    event.suggestedRitualIds = [1, 5, 12];

    expect(event.suggestedRitualIds).toHaveLength(3);
    expect(event.suggestedRitualIds).toContain(1);
    expect(event.suggestedRitualIds).toContain(5);
    expect(event.suggestedRitualIds).toContain(12);
  });

  it('should allow suggested ritual IDs to be null', () => {
    const event = new SacredEvent();
    event.suggestedRitualIds = null;

    expect(event.suggestedRitualIds).toBeNull();
  });

  it('should have default value for isActive', () => {
    const event = new SacredEvent();
    event.isActive = true;

    expect(event.isActive).toBe(true);
  });

  it('should have timestamp', () => {
    const event = new SacredEvent();
    const now = new Date();
    event.createdAt = now;

    expect(event.createdAt).toEqual(now);
  });

  describe('Sabbat Event Example', () => {
    it('should create a complete Samhain event for North hemisphere', () => {
      const event = new SacredEvent();
      event.name = 'Samhain';
      event.slug = 'samhain-2026-norte';
      event.description =
        'Sabbat de la Muerte y los Ancestros, marca el inicio del año brujo';
      event.eventType = SacredEventType.SABBAT;
      event.sabbat = Sabbat.SAMHAIN;
      event.lunarPhase = null;
      event.eventDate = new Date('2026-10-31');
      event.eventTime = '18:00:00';
      event.hemisphere = Hemisphere.NORTH;
      event.importance = SacredEventImportance.HIGH;
      event.energyDescription =
        'Momento de honrar ancestros y trabajar con el velo delgado entre mundos';
      event.suggestedRitualCategories = [
        RitualCategory.PROTECTION,
        RitualCategory.MEDITATION,
      ];
      event.isActive = true;

      expect(event.eventType).toBe(SacredEventType.SABBAT);
      expect(event.sabbat).toBe(Sabbat.SAMHAIN);
      expect(event.hemisphere).toBe(Hemisphere.NORTH);
      expect(event.importance).toBe(SacredEventImportance.HIGH);
    });
  });

  describe('Lunar Event Example', () => {
    it('should create a complete Full Moon event (global)', () => {
      const event = new SacredEvent();
      event.name = 'Luna Llena en Acuario';
      event.slug = 'luna-llena-acuario-2026-08';
      event.description =
        'Luna llena en el signo de Acuario, energía innovadora';
      event.eventType = SacredEventType.LUNAR_PHASE;
      event.sabbat = null;
      event.lunarPhase = LunarPhase.FULL_MOON;
      event.eventDate = new Date('2026-08-03');
      event.eventTime = '15:43:00';
      event.hemisphere = null; // Global
      event.importance = SacredEventImportance.HIGH;
      event.energyDescription =
        'Momento de culminación y liberación, ideal para soltar lo viejo';
      event.suggestedRitualCategories = [
        RitualCategory.LUNAR,
        RitualCategory.CLEANSING,
      ];
      event.suggestedRitualIds = [2, 5]; // IDs de rituales de luna llena
      event.isActive = true;

      expect(event.eventType).toBe(SacredEventType.LUNAR_PHASE);
      expect(event.lunarPhase).toBe(LunarPhase.FULL_MOON);
      expect(event.hemisphere).toBeNull();
      expect(event.importance).toBe(SacredEventImportance.HIGH);
      expect(event.suggestedRitualIds).toContain(2);
    });
  });

  describe('Portal Event Example', () => {
    it('should create a complete Portal event (11/11)', () => {
      const event = new SacredEvent();
      event.name = 'Portal 11:11';
      event.slug = 'portal-11-11-2026';
      event.description =
        'Portal numérico 11/11, maestría y manifestación acelerada';
      event.eventType = SacredEventType.PORTAL;
      event.sabbat = null;
      event.lunarPhase = null;
      event.eventDate = new Date('2026-11-11');
      event.eventTime = '11:11:00';
      event.hemisphere = null; // Global
      event.importance = SacredEventImportance.MEDIUM;
      event.energyDescription =
        'Activación de código maestro, ideal para manifestar intenciones elevadas';
      event.suggestedRitualCategories = [
        RitualCategory.ABUNDANCE,
        RitualCategory.MEDITATION,
      ];
      event.isActive = true;

      expect(event.eventType).toBe(SacredEventType.PORTAL);
      expect(event.sabbat).toBeNull();
      expect(event.lunarPhase).toBeNull();
      expect(event.hemisphere).toBeNull();
      expect(event.importance).toBe(SacredEventImportance.MEDIUM);
    });
  });
});
