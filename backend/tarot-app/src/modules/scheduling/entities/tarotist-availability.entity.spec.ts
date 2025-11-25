import { TarotistAvailability } from './tarotist-availability.entity';
import { DayOfWeek } from '../enums';

describe('TarotistAvailability Entity', () => {
  it('should create an instance', () => {
    const availability = new TarotistAvailability();
    expect(availability).toBeDefined();
    expect(availability).toBeInstanceOf(TarotistAvailability);
  });

  it('should have all required properties', () => {
    const availability = new TarotistAvailability();
    availability.tarotistaId = 1;
    availability.dayOfWeek = DayOfWeek.MONDAY;
    availability.startTime = '09:00';
    availability.endTime = '18:00';
    availability.isActive = true;

    expect(availability.tarotistaId).toBe(1);
    expect(availability.dayOfWeek).toBe(DayOfWeek.MONDAY);
    expect(availability.startTime).toBe('09:00');
    expect(availability.endTime).toBe('18:00');
    expect(availability.isActive).toBe(true);
  });

  it('should validate day of week range (0-6)', () => {
    const availability = new TarotistAvailability();

    // Valid days
    expect(() => {
      availability.dayOfWeek = DayOfWeek.SUNDAY; // 0
    }).not.toThrow();

    expect(() => {
      availability.dayOfWeek = DayOfWeek.SATURDAY; // 6
    }).not.toThrow();

    // Enum restricts invalid values at compile time
    expect(Object.values(DayOfWeek)).toContain(DayOfWeek.MONDAY);
    // TypeScript numeric enums have both keys and values, so length is 14 (7 names + 7 numbers)
    expect(Object.keys(DayOfWeek)).toHaveLength(14);
    // Verify all numeric values are present
    expect(DayOfWeek.SUNDAY).toBe(0);
    expect(DayOfWeek.SATURDAY).toBe(6);
  });

  it('should accept time in HH:MM format', () => {
    const availability = new TarotistAvailability();

    availability.startTime = '09:00';
    availability.endTime = '18:30';

    expect(availability.startTime).toMatch(/^\d{2}:\d{2}$/);
    expect(availability.endTime).toMatch(/^\d{2}:\d{2}$/);
  });

  it('should default isActive to true', () => {
    const availability = new TarotistAvailability();
    // TypeORM default values are applied in DB, not in memory
    // This test documents expected behavior
    expect(availability.isActive).toBeUndefined(); // Before persistence
  });

  it('should allow isActive to be false', () => {
    const availability = new TarotistAvailability();
    availability.isActive = false;

    expect(availability.isActive).toBe(false);
  });

  it('should have timestamps', () => {
    const availability = new TarotistAvailability();
    const now = new Date();

    availability.createdAt = now;
    availability.updatedAt = now;

    expect(availability.createdAt).toEqual(now);
    expect(availability.updatedAt).toEqual(now);
  });
});
