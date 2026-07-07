import { describe, it, expect } from 'vitest';

import { getContrastRatio, meetsWcagAA } from './contrast';

/**
 * Contrato de contraste WCAG del home rediseñado (T-DASH-007 / hallazgo DASH-007).
 *
 * Fija con la fórmula de luminancia WCAG que:
 * - el texto crema sobre la banda noche cumple AA;
 * - los chips dorados deben llevar texto noche (no blanco) para cumplir AA.
 *
 * Colores de marca (sincronizados con `globals.css` y `DashboardHero`):
 */
const NIGHT = '#1a0a2e'; // --color-bg-hero (noche profunda)
const CREAM = '#f9f7f2'; // texto crema sobre la banda
const GOLD = '#d69e2e'; // --color-secondary (dorado mate)
const WHITE = '#ffffff';
const BLACK = '#000000';

describe('getContrastRatio', () => {
  it('should return 21:1 for black vs white (máximo teórico)', () => {
    expect(getContrastRatio(BLACK, WHITE)).toBeCloseTo(21, 0);
  });

  it('should return 1:1 for a color against itself', () => {
    expect(getContrastRatio(GOLD, GOLD)).toBeCloseTo(1, 5);
  });

  it('should be symmetric regardless of argument order', () => {
    expect(getContrastRatio(NIGHT, CREAM)).toBeCloseTo(getContrastRatio(CREAM, NIGHT), 5);
  });

  it('should accept hex values with or without the leading "#"', () => {
    expect(getContrastRatio('1a0a2e', 'f9f7f2')).toBeCloseTo(getContrastRatio(NIGHT, CREAM), 5);
  });

  it('should support shorthand 3-digit hex', () => {
    expect(getContrastRatio('#fff', '#000')).toBeCloseTo(21, 0);
  });
});

describe('meetsWcagAA', () => {
  it('should pass cream text over the night band (banda oscura)', () => {
    const ratio = getContrastRatio(CREAM, NIGHT);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(meetsWcagAA(ratio)).toBe(true);
  });

  it('should pass a gold chip with night text (contrato de chip dorado)', () => {
    const ratio = getContrastRatio(GOLD, NIGHT);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(meetsWcagAA(ratio)).toBe(true);
  });

  it('should FAIL a gold chip with white text (por eso se usa texto noche)', () => {
    const ratio = getContrastRatio(GOLD, WHITE);
    expect(ratio).toBeLessThan(4.5);
    expect(meetsWcagAA(ratio)).toBe(false);
  });

  it('should use the relaxed 3:1 threshold for large text', () => {
    const ratio = getContrastRatio(GOLD, WHITE); // ≈ 2.4:1
    expect(meetsWcagAA(ratio, { largeText: true })).toBe(false);

    // Un ratio intermedio que solo cumple para texto grande.
    expect(meetsWcagAA(3.2, { largeText: true })).toBe(true);
    expect(meetsWcagAA(3.2)).toBe(false);
  });
});
