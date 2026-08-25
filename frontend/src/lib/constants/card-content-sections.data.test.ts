import { describe, it, expect } from 'vitest';

import {
  CARD_COMBINATIONS_SECTION,
  CARD_TEXT_SECTIONS,
  MIN_CARD_DETAIL_WORDS,
} from '@/lib/constants/card-content-sections.data';

/**
 * Contrato de secciones de la ficha de tarot (T-SEO-010).
 *
 * Acá se verifica **la declaración**: qué secciones existen, con qué encabezado
 * salen y que ninguna use vocabulario prohibido. La medición del largo es otra
 * cosa y vive donde puede medir algo real: el corpus de las 78 fichas, en el test
 * de datos del backend (T-SEO-009), y el HTML renderizado, en el guardarraíl de
 * `CardDetailView.test.tsx`.
 */

describe('CARD_TEXT_SECTIONS', () => {
  it('declara las seis secciones de texto de T-SEO-010 con su encabezado', () => {
    expect(CARD_TEXT_SECTIONS.map((section) => [section.key, section.heading])).toEqual([
      ['meaningLove', 'En el amor'],
      ['meaningWork', 'En el trabajo'],
      ['meaningWellbeing', 'En la energía y el bienestar'],
      ['symbolism', 'El simbolismo de la carta'],
      ['advice', 'El consejo de la carta'],
      ['yesNo', '¿Sí o no?'],
    ]);
  });

  it('las combinaciones son la séptima sección', () => {
    expect(CARD_COMBINATIONS_SECTION.heading).toBe('Combinaciones frecuentes');
  });

  it('ningún encabezado usa la palabra "salud" (territorio YMYL, T-SEO-013)', () => {
    const headings = [
      ...CARD_TEXT_SECTIONS.map((section) => section.heading),
      CARD_COMBINATIONS_SECTION.heading,
    ];

    headings.forEach((heading) => {
      expect(heading.toLowerCase()).not.toContain('salud');
    });
  });

  it('cada sección tiene un data-testid único', () => {
    const testIds = [
      ...CARD_TEXT_SECTIONS.map((section) => section.testId),
      CARD_COMBINATIONS_SECTION.testId,
    ];

    expect(new Set(testIds).size).toBe(testIds.length);
  });
});

describe('MIN_CARD_DETAIL_WORDS', () => {
  it('cubre el criterio de aceptación de T-SEO-010 (500 palabras propias)', () => {
    expect(MIN_CARD_DETAIL_WORDS).toBeGreaterThanOrEqual(500);
  });
});
