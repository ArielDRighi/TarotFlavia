import { describe, it, expect } from 'vitest';
import { PREMIUM_BENEFITS } from './premium-benefits';

describe('PREMIUM_BENEFITS', () => {
  it('should export PREMIUM_BENEFITS constant', () => {
    expect(PREMIUM_BENEFITS).toBeDefined();
  });

  it('should have readings benefits', () => {
    expect(PREMIUM_BENEFITS.readings).toBeDefined();
    expect(Array.isArray(PREMIUM_BENEFITS.readings)).toBe(true);
    expect(PREMIUM_BENEFITS.readings.length).toBeGreaterThan(0);
  });

  it('should have rituals benefits', () => {
    expect(PREMIUM_BENEFITS.rituals).toBeDefined();
    expect(Array.isArray(PREMIUM_BENEFITS.rituals)).toBe(true);
    expect(PREMIUM_BENEFITS.rituals.length).toBeGreaterThan(0);
  });

  it('should have general benefits', () => {
    expect(PREMIUM_BENEFITS.general).toBeDefined();
    expect(Array.isArray(PREMIUM_BENEFITS.general)).toBe(true);
    expect(PREMIUM_BENEFITS.general.length).toBeGreaterThan(0);
  });

  describe('readings benefits', () => {
    it('should have valid structure with icon and text', () => {
      PREMIUM_BENEFITS.readings.forEach((benefit) => {
        expect(benefit).toHaveProperty('icon');
        expect(benefit).toHaveProperty('text');
        expect(typeof benefit.icon).toBe('string');
        expect(typeof benefit.text).toBe('string');
        expect(benefit.icon.length).toBeGreaterThan(0);
        expect(benefit.text.length).toBeGreaterThan(0);
      });
    });

    it('should include todas las tiradas benefit', () => {
      const hasAllSpreads = PREMIUM_BENEFITS.readings.some((b) =>
        b.text.toLowerCase().includes('todas las tiradas')
      );
      expect(hasAllSpreads).toBe(true);
    });

    it('should include 3 lecturas completas benefit', () => {
      const hasThreeReadings = PREMIUM_BENEFITS.readings.some((b) =>
        b.text.toLowerCase().includes('3 lecturas')
      );
      expect(hasThreeReadings).toBe(true);
    });
  });

  describe('rituals benefits', () => {
    it('should have valid structure with icon and text', () => {
      PREMIUM_BENEFITS.rituals.forEach((benefit) => {
        expect(benefit).toHaveProperty('icon');
        expect(benefit).toHaveProperty('text');
        expect(typeof benefit.icon).toBe('string');
        expect(typeof benefit.text).toBe('string');
        expect(benefit.icon.length).toBeGreaterThan(0);
        expect(benefit.text.length).toBeGreaterThan(0);
      });
    });

    it('should include calendario sagrado benefit', () => {
      const hasCalendar = PREMIUM_BENEFITS.rituals.some((b) =>
        b.text.toLowerCase().includes('calendario sagrado')
      );
      expect(hasCalendar).toBe(true);
    });

    it('should include notificaciones benefit', () => {
      const hasNotifications = PREMIUM_BENEFITS.rituals.some((b) =>
        b.text.toLowerCase().includes('notificaciones')
      );
      expect(hasNotifications).toBe(true);
    });

    it('should include rituales recomendados benefit', () => {
      const hasRecommendations = PREMIUM_BENEFITS.rituals.some((b) =>
        b.text.toLowerCase().includes('rituales recomendados')
      );
      expect(hasRecommendations).toBe(true);
    });

    it('should include historial benefit', () => {
      const hasHistory = PREMIUM_BENEFITS.rituals.some((b) =>
        b.text.toLowerCase().includes('historial')
      );
      expect(hasHistory).toBe(true);
    });
  });

  describe('general benefits', () => {
    it('should have valid structure with icon and text', () => {
      PREMIUM_BENEFITS.general.forEach((benefit) => {
        expect(benefit).toHaveProperty('icon');
        expect(benefit).toHaveProperty('text');
        expect(typeof benefit.icon).toBe('string');
        expect(typeof benefit.text).toBe('string');
        expect(benefit.icon.length).toBeGreaterThan(0);
        expect(benefit.text.length).toBeGreaterThan(0);
      });
    });

    it('should include historial 365 días benefit', () => {
      const hasExtendedHistory = PREMIUM_BENEFITS.general.some((b) =>
        b.text.toLowerCase().includes('365 días')
      );
      expect(hasExtendedHistory).toBe(true);
    });

    it('should include interpretaciones IA benefit', () => {
      const hasAI = PREMIUM_BENEFITS.general.some(
        (b) =>
          b.text.toLowerCase().includes('ia avanzada') ||
          b.text.toLowerCase().includes('interpretaciones')
      );
      expect(hasAI).toBe(true);
    });
  });
});
