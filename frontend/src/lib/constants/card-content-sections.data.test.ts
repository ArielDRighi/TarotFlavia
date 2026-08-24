import { describe, it, expect } from 'vitest';

import {
  CARD_COMBINATIONS_SECTION,
  CARD_TEXT_SECTIONS,
  MIN_CARD_DETAIL_WORDS,
  getCardDetailWordCount,
  getMissingCardSections,
} from '@/lib/constants/card-content-sections.data';
import { createMockCardDetail } from '@/test/factories';

/**
 * Guardarraíl de contenido de las fichas de tarot (T-SEO-010).
 *
 * Mismo criterio que `about-page.data.test.ts` y
 * `chinese-zodiac-profiles.data.test.ts`: si una ficha baja del piso o le falta
 * una sección, se entera acá y no en el próximo rechazo de AdSense.
 *
 * El corpus de las 78 fichas vive en el backend, así que lo que se mide desde el
 * frontend es la ficha **más corta** del corpus (`five-of-swords`, el fixture) y
 * el contrato de secciones que consume el render. La verificación sobre el HTML
 * servido la hace `npm run check:indexable -- --min-words 500`.
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

describe('getCardDetailWordCount', () => {
  it(`la ficha más corta del corpus supera las ${MIN_CARD_DETAIL_WORDS} palabras`, () => {
    expect(getCardDetailWordCount(createMockCardDetail())).toBeGreaterThanOrEqual(
      MIN_CARD_DETAIL_WORDS
    );
  });

  it('cuenta las secciones extendidas: sin ellas la misma ficha no llega al piso', () => {
    const sinExtendido = createMockCardDetail({
      meaningLove: undefined,
      meaningWork: undefined,
      meaningWellbeing: undefined,
      symbolism: undefined,
      advice: undefined,
      yesNo: undefined,
      combinations: undefined,
    });

    expect(getCardDetailWordCount(sinExtendido)).toBeLessThan(MIN_CARD_DETAIL_WORDS);
  });

  it('cuenta las lecturas de las combinaciones', () => {
    const conCombinaciones = createMockCardDetail();
    const sinCombinaciones = createMockCardDetail({ combinations: undefined });

    expect(getCardDetailWordCount(conCombinaciones)).toBeGreaterThan(
      getCardDetailWordCount(sinCombinaciones)
    );
  });

  it('tolera una ficha sin descripción', () => {
    expect(getCardDetailWordCount(createMockCardDetail({ description: null }))).toBeGreaterThan(0);
  });
});

describe('getMissingCardSections', () => {
  it('no reporta nada en una ficha completa', () => {
    expect(getMissingCardSections(createMockCardDetail())).toEqual([]);
  });

  it('reporta la clave ausente', () => {
    expect(getMissingCardSections(createMockCardDetail({ advice: undefined }))).toEqual(['advice']);
  });

  it('trata un string en blanco como sección faltante', () => {
    expect(getMissingCardSections(createMockCardDetail({ symbolism: '   ' }))).toEqual([
      'symbolism',
    ]);
  });

  it('trata una lista de combinaciones vacía como sección faltante', () => {
    expect(getMissingCardSections(createMockCardDetail({ combinations: [] }))).toEqual([
      'combinations',
    ]);
  });

  it('reporta las siete secciones en una ficha sin contenido extendido', () => {
    const sinExtendido = createMockCardDetail({
      meaningLove: undefined,
      meaningWork: undefined,
      meaningWellbeing: undefined,
      symbolism: undefined,
      advice: undefined,
      yesNo: undefined,
      combinations: undefined,
    });

    expect(getMissingCardSections(sinExtendido)).toEqual([
      'meaningLove',
      'meaningWork',
      'meaningWellbeing',
      'symbolism',
      'advice',
      'yesNo',
      'combinations',
    ]);
  });
});
