import { UserRitualHistory } from './user-ritual-history.entity';
import { LunarPhase } from '../domain/enums';

describe('UserRitualHistory Entity', () => {
  it('should create an instance', () => {
    const history = new UserRitualHistory();
    expect(history).toBeDefined();
    expect(history).toBeInstanceOf(UserRitualHistory);
  });

  it('should have all required properties', () => {
    const history = new UserRitualHistory();
    const completedDate = new Date();

    history.id = 1;
    history.userId = 1;
    history.ritualId = 1;
    history.completedAt = completedDate;

    expect(history.id).toBe(1);
    expect(history.userId).toBe(1);
    expect(history.ritualId).toBe(1);
    expect(history.completedAt).toEqual(completedDate);
  });

  it('should validate lunar phase enum', () => {
    const history = new UserRitualHistory();

    history.lunarPhase = LunarPhase.NEW_MOON;
    expect(history.lunarPhase).toBe('new_moon');

    history.lunarPhase = LunarPhase.FULL_MOON;
    expect(history.lunarPhase).toBe('full_moon');

    history.lunarPhase = LunarPhase.FIRST_QUARTER;
    expect(history.lunarPhase).toBe('first_quarter');

    history.lunarPhase = LunarPhase.LAST_QUARTER;
    expect(history.lunarPhase).toBe('last_quarter');
  });

  it('should allow nullable optional fields', () => {
    const history = new UserRitualHistory();
    history.lunarPhase = null;
    history.lunarSign = null;
    history.notes = null;
    history.rating = null;
    history.durationMinutes = null;

    expect(history.lunarPhase).toBeNull();
    expect(history.lunarSign).toBeNull();
    expect(history.notes).toBeNull();
    expect(history.rating).toBeNull();
    expect(history.durationMinutes).toBeNull();
  });

  it('should accept lunar sign', () => {
    const history = new UserRitualHistory();
    history.lunarSign = 'Capricornio';

    expect(history.lunarSign).toBe('Capricornio');
  });

  it('should accept user notes', () => {
    const history = new UserRitualHistory();
    history.notes = 'Me sentí muy tranquilo durante la práctica';

    expect(history.notes).toBe('Me sentí muy tranquilo durante la práctica');
  });

  it('should accept rating between 1 and 5', () => {
    const history = new UserRitualHistory();

    history.rating = 1;
    expect(history.rating).toBe(1);

    history.rating = 3;
    expect(history.rating).toBe(3);

    history.rating = 5;
    expect(history.rating).toBe(5);
  });

  it('should accept duration in minutes', () => {
    const history = new UserRitualHistory();
    history.durationMinutes = 45;

    expect(history.durationMinutes).toBe(45);
  });

  it('should have createdAt timestamp', () => {
    const history = new UserRitualHistory();
    const now = new Date();
    history.createdAt = now;

    expect(history.createdAt).toEqual(now);
  });

  it('should track lunar phase and sign at completion time', () => {
    const history = new UserRitualHistory();
    history.lunarPhase = LunarPhase.NEW_MOON;
    history.lunarSign = 'Capricornio';
    history.completedAt = new Date('2026-01-15T20:00:00Z');

    expect(history.lunarPhase).toBe('new_moon');
    expect(history.lunarSign).toBe('Capricornio');
  });
});
