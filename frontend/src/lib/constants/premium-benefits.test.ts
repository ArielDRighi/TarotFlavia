import { describe, it, expect } from 'vitest';
import { PREMIUM_BENEFITS, PLAN_MATRIX, PREMIUM_UPGRADE_HIGHLIGHTS } from './premium-benefits';

describe('PREMIUM_BENEFITS', () => {
  it('should export PREMIUM_BENEFITS constant', () => {
    expect(PREMIUM_BENEFITS).toBeDefined();
  });

  it('should have readings, rituals and general groups as non-empty arrays', () => {
    for (const group of [
      PREMIUM_BENEFITS.readings,
      PREMIUM_BENEFITS.rituals,
      PREMIUM_BENEFITS.general,
    ]) {
      expect(Array.isArray(group)).toBe(true);
      expect(group.length).toBeGreaterThan(0);
    }
  });

  it('every benefit has a non-empty icon and text', () => {
    const all = [
      ...PREMIUM_BENEFITS.readings,
      ...PREMIUM_BENEFITS.rituals,
      ...PREMIUM_BENEFITS.general,
    ];
    all.forEach((benefit) => {
      expect(typeof benefit.icon).toBe('string');
      expect(benefit.icon.length).toBeGreaterThan(0);
      expect(typeof benefit.text).toBe('string');
      expect(benefit.text.length).toBeGreaterThan(0);
    });
  });

  it('reflects the real reading limits (3 lecturas/día, todas las tiradas)', () => {
    const readingsText = PREMIUM_BENEFITS.readings.map((b) => b.text.toLowerCase());
    expect(readingsText.some((t) => t.includes('3 lecturas'))).toBe(true);
    expect(readingsText.some((t) => t.includes('todas las tiradas'))).toBe(true);
  });

  it('exposes the premium birth-chart summary and 365-day history', () => {
    const generalText = PREMIUM_BENEFITS.general.map((b) => b.text.toLowerCase());
    expect(generalText.some((t) => t.includes('carta astral'))).toBe(true);
    expect(generalText.some((t) => t.includes('365 días'))).toBe(true);
  });

  it('does NOT promise unsubstantiated or nonexistent benefits', () => {
    const allText = [
      ...PREMIUM_BENEFITS.readings.map((b) => b.text),
      ...PREMIUM_BENEFITS.rituals.map((b) => b.text),
      ...PREMIUM_BENEFITS.general.map((b) => b.text),
      ...PREMIUM_UPGRADE_HIGHLIGHTS,
    ]
      .map((text) => text.toLowerCase())
      .join(' | ');

    // Falsas promesas del audit FBK-004
    expect(allText).not.toContain('ilimitad'); // lecturas/historial ilimitados
    expect(allText).not.toContain('publicidad'); // no hay sistema de ads
    expect(allText).not.toContain('prioritario'); // sin lógica de acceso prioritario
    expect(allText).not.toContain('estadística'); // no hay módulo de estadísticas
    expect(allText).not.toContain('herradura'); // tirada inexistente
    expect(allText).not.toContain('año completo'); // tirada inexistente
    expect(allText).not.toContain('oráculo'); // feature inexistente en la web
  });
});

describe('PREMIUM_UPGRADE_HIGHLIGHTS', () => {
  it('is a non-empty list of strings', () => {
    expect(Array.isArray(PREMIUM_UPGRADE_HIGHLIGHTS)).toBe(true);
    expect(PREMIUM_UPGRADE_HIGHLIGHTS.length).toBeGreaterThan(0);
    PREMIUM_UPGRADE_HIGHLIGHTS.forEach((text) => {
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });
  });

  it('replaces "Lecturas ilimitadas" with the real 3 lecturas/día', () => {
    const joined = PREMIUM_UPGRADE_HIGHLIGHTS.join(' | ').toLowerCase();
    expect(joined).not.toContain('ilimitad');
    expect(joined).toContain('3 lecturas');
  });
});

describe('PLAN_MATRIX', () => {
  const byKey = (key: string) => {
    const row = PLAN_MATRIX.find((r) => r.key === key);
    if (!row) throw new Error(`Fila de PLAN_MATRIX no encontrada: ${key}`);
    return row;
  };

  it('is a non-empty array of rows with feature + three plan cells', () => {
    expect(PLAN_MATRIX.length).toBeGreaterThan(0);
    PLAN_MATRIX.forEach((row) => {
      expect(typeof row.key).toBe('string');
      expect(row.feature.length).toBeGreaterThan(0);
      for (const cell of [row.anonymous, row.free, row.premium]) {
        expect(['boolean', 'string']).toContain(typeof cell);
        if (typeof cell === 'string') expect(cell.length).toBeGreaterThan(0);
      }
    });
  });

  it('has unique keys', () => {
    const keys = PLAN_MATRIX.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('marks the 3-card spread as available to Free (only 5 cards & Cruz Céltica are premium)', () => {
    const tarot = byKey('tarot-readings');
    expect(String(tarot.free).toLowerCase()).toContain('3 cartas');
    const advanced = byKey('advanced-spreads');
    expect(advanced.free).toBe(false);
    expect(advanced.premium).toBe(true);
    expect(advanced.feature.toLowerCase()).toContain('5 cartas');
    expect(advanced.feature.toLowerCase()).toContain('cruz céltica');
  });

  it('gates personalized interpretation (IA) and custom questions to Premium only', () => {
    for (const key of ['personalized-interpretation', 'custom-questions']) {
      const row = byKey(key);
      expect(row.free).toBe(false);
      expect(row.premium).toBe(true);
    }
  });

  it('matches the real birth-chart limits (Free unlimited, Premium unlimited + summary)', () => {
    const chart = byKey('birth-chart');
    // T-FBK-009: BIRTH_CHART FREE = -1 (ilimitada), PREMIUM = -1 (ilimitada).
    // El único diferenciador Premium es el resumen personalizado con IA.
    expect(String(chart.free).toLowerCase()).toContain('ilimitada');
    expect(String(chart.premium).toLowerCase()).toContain('ilimitada');
    // El resumen personalizado (síntesis con IA) es exclusivo de Premium
    expect(String(chart.premium).toLowerCase()).toContain('resumen');
    expect(String(chart.free).toLowerCase()).not.toContain('resumen');
  });

  it('reflects real pendulum and history differences', () => {
    const pendulum = byKey('pendulum');
    expect(String(pendulum.free)).toContain('1 por día');
    expect(String(pendulum.premium)).toContain('3 por día');

    const history = byKey('history');
    expect(String(history.free)).toContain('30 días');
    expect(String(history.premium)).toContain('365 días');
  });

  it('does NOT include nonexistent features (oráculo, regeneración, estadísticas)', () => {
    const features = PLAN_MATRIX.map((r) => r.feature.toLowerCase()).join(' | ');
    expect(features).not.toContain('oráculo');
    expect(features).not.toContain('regenera');
    expect(features).not.toContain('estadística');
  });
});
