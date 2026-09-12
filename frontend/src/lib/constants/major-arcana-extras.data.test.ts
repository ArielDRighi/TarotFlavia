/**
 * Tests del contenido extra de los 22 Arcanos Mayores (T-SEO-020).
 *
 * Es el guardarraíl de "romper la plantilla": si alguien saca una carta del
 * mapa, deja una sección corta, repite un párrafo entre fichas o vuelve a
 * poner las 22 fichas con el mismo orden de secciones, falla acá y no en el
 * próximo rechazo de AdSense.
 */

import { describe, it, expect } from 'vitest';

import { CARD_TEXT_SECTIONS } from '@/lib/constants/card-content-sections.data';
import {
  MAJOR_ARCANA_EXTRAS,
  MAJOR_ARCANA_EXTRA_SECTION_KEYS,
  MAJOR_ARCANA_SLUGS,
  MIN_DISTINCT_SECTION_ORDERS,
  MIN_MAJOR_ARCANA_EXTRAS_WORDS,
  getMajorArcanaExtras,
  getMajorArcanaExtrasWordCount,
} from '@/lib/constants/major-arcana-extras.data';
import type { MajorArcanaExtras, MajorArcanaSlug } from '@/lib/constants/major-arcana-extras.data';

const BASE_SECTION_KEYS = CARD_TEXT_SECTIONS.map((section) => section.key);

/** Todos los párrafos de texto de autor de una ficha, en orden de lectura. */
function collectParagraphs(extras: MajorArcanaExtras): string[] {
  return [
    ...extras.reversed.paragraphs,
    extras.readingCase.question,
    ...extras.readingCase.reading,
    extras.iconography.intro,
    ...extras.iconography.symbols.map((symbol) => symbol.meaning),
  ];
}

describe('MAJOR_ARCANA_SLUGS', () => {
  it('son exactamente los 22 Arcanos Mayores, del Loco al Mundo', () => {
    expect(MAJOR_ARCANA_SLUGS).toHaveLength(22);
    expect(MAJOR_ARCANA_SLUGS[0]).toBe('the-fool');
    expect(MAJOR_ARCANA_SLUGS[21]).toBe('the-world');
    expect(new Set(MAJOR_ARCANA_SLUGS).size).toBe(22);
  });
});

describe('MAJOR_ARCANA_EXTRAS', () => {
  it('tiene contenido extra para cada uno de los 22 mayores y para ninguna otra carta', () => {
    expect(Object.keys(MAJOR_ARCANA_EXTRAS).sort()).toEqual([...MAJOR_ARCANA_SLUGS].sort());
  });

  describe.each(MAJOR_ARCANA_SLUGS)('%s', (slug) => {
    const extras = MAJOR_ARCANA_EXTRAS[slug];

    it('tiene la sección "Invertida" con encabezado propio y dos párrafos', () => {
      expect(extras.reversed.heading.length).toBeGreaterThan(8);
      expect(extras.reversed.paragraphs).toHaveLength(2);
      extras.reversed.paragraphs.forEach((paragraph) => {
        expect(paragraph.length).toBeGreaterThan(150);
      });
    });

    it('tiene un mini-caso de tirada completo', () => {
      const { readingCase } = extras;

      expect(readingCase.heading.length).toBeGreaterThan(8);
      expect(readingCase.question.length).toBeGreaterThan(30);
      expect(readingCase.spread.length).toBeGreaterThan(5);
      expect(readingCase.position.length).toBeGreaterThan(3);
      expect(['upright', 'reversed']).toContain(readingCase.orientation);
      expect(readingCase.reading).toHaveLength(2);
      readingCase.reading.forEach((paragraph) => {
        expect(paragraph.length).toBeGreaterThan(150);
      });
    });

    it('tiene una nota iconográfica con entre 3 y 5 símbolos ubicados sobre la lámina', () => {
      const { iconography } = extras;

      expect(iconography.heading.length).toBeGreaterThan(8);
      expect(iconography.intro.length).toBeGreaterThan(100);
      expect(iconography.symbols.length).toBeGreaterThanOrEqual(3);
      expect(iconography.symbols.length).toBeLessThanOrEqual(5);

      iconography.symbols.forEach((symbol) => {
        expect(symbol.label.length).toBeGreaterThan(3);
        expect(symbol.meaning.length).toBeGreaterThan(40);
        // Coordenadas en porcentaje del ancho/alto de la lámina, sin tocar el
        // borde: un marcador en 0 o 100 queda cortado por el `overflow-hidden`.
        expect(symbol.x).toBeGreaterThanOrEqual(3);
        expect(symbol.x).toBeLessThanOrEqual(97);
        expect(symbol.y).toBeGreaterThanOrEqual(3);
        expect(symbol.y).toBeLessThanOrEqual(97);
      });
    });

    it('no repite etiquetas de símbolo dentro de la misma lámina', () => {
      const labels = extras.iconography.symbols.map((symbol) => symbol.label.toLowerCase());

      expect(new Set(labels).size).toBe(labels.length);
    });

    it('el orden de secciones incluye las tres secciones nuevas, sin duplicados', () => {
      const { sectionOrder } = extras;

      expect(new Set(sectionOrder).size).toBe(sectionOrder.length);
      MAJOR_ARCANA_EXTRA_SECTION_KEYS.forEach((key) => {
        expect(sectionOrder).toContain(key);
      });
    });

    it('el orden de secciones solo usa claves conocidas', () => {
      const known: string[] = [...BASE_SECTION_KEYS, ...MAJOR_ARCANA_EXTRA_SECTION_KEYS];

      extras.sectionOrder.forEach((key) => {
        expect(known).toContain(key);
      });
    });

    it(`aporta al menos ${MIN_MAJOR_ARCANA_EXTRAS_WORDS} palabras propias`, () => {
      expect(getMajorArcanaExtrasWordCount(slug)).toBeGreaterThanOrEqual(
        MIN_MAJOR_ARCANA_EXTRAS_WORDS
      );
    });
  });

  it('no repite ningún párrafo entre cartas (contenido único por URL)', () => {
    const seen = new Map<string, MajorArcanaSlug>();

    MAJOR_ARCANA_SLUGS.forEach((slug) => {
      collectParagraphs(MAJOR_ARCANA_EXTRAS[slug]).forEach((paragraph) => {
        const normalized = paragraph.trim().toLowerCase();
        expect(seen.get(normalized), `párrafo repetido en ${slug}`).toBeUndefined();
        seen.set(normalized, slug);
      });
    });
  });

  it('no repite encabezados entre cartas: los h2 nuevos son propios de cada ficha', () => {
    const headings = MAJOR_ARCANA_SLUGS.flatMap((slug) => {
      const extras = MAJOR_ARCANA_EXTRAS[slug];
      return [extras.reversed.heading, extras.readingCase.heading, extras.iconography.heading];
    });

    expect(new Set(headings.map((heading) => heading.toLowerCase())).size).toBe(headings.length);
  });

  /**
   * El motivo de la tarea: que 78 fichas tengan los mismos `h2` en el mismo
   * orden es lo que dispara la alarma de plantilla. Los 22 mayores tienen que
   * diferir de verdad entre sí, no solo del resto del mazo.
   */
  it(`usa al menos ${MIN_DISTINCT_SECTION_ORDERS} órdenes de secciones distintos`, () => {
    const orders = MAJOR_ARCANA_SLUGS.map((slug) =>
      MAJOR_ARCANA_EXTRAS[slug].sectionOrder.join('>')
    );

    expect(new Set(orders).size).toBeGreaterThanOrEqual(MIN_DISTINCT_SECTION_ORDERS);
  });

  it('la mayoría de las fichas conserva las seis secciones base; la omisión es la excepción', () => {
    const complete = MAJOR_ARCANA_SLUGS.filter((slug) =>
      BASE_SECTION_KEYS.every((key) => MAJOR_ARCANA_EXTRAS[slug].sectionOrder.includes(key))
    );

    expect(complete.length).toBeGreaterThanOrEqual(15);
  });

  it('cuando una ficha omite una sección base, es solo "¿Sí o no?"', () => {
    MAJOR_ARCANA_SLUGS.forEach((slug) => {
      const missing = BASE_SECTION_KEYS.filter(
        (key) => !MAJOR_ARCANA_EXTRAS[slug].sectionOrder.includes(key)
      );

      expect(
        missing.every((key) => key === 'yesNo'),
        `${slug} omite ${missing.join(',')}`
      ).toBe(true);
    });
  });

  it('alterna casos de tirada con la carta derecha e invertida', () => {
    const orientations = new Set(
      MAJOR_ARCANA_SLUGS.map((slug) => MAJOR_ARCANA_EXTRAS[slug].readingCase.orientation)
    );

    expect(orientations).toEqual(new Set(['upright', 'reversed']));
  });

  it('no repite la misma tirada y posición en todos los casos', () => {
    const spreads = new Set(
      MAJOR_ARCANA_SLUGS.map(
        (slug) =>
          `${MAJOR_ARCANA_EXTRAS[slug].readingCase.spread}|${MAJOR_ARCANA_EXTRAS[slug].readingCase.position}`
      )
    );

    expect(spreads.size).toBeGreaterThanOrEqual(8);
  });
});

describe('getMajorArcanaExtras', () => {
  it('devuelve el contenido extra de un Arcano Mayor', () => {
    expect(getMajorArcanaExtras('the-fool')).toBe(MAJOR_ARCANA_EXTRAS['the-fool']);
  });

  it('devuelve undefined para un Arcano Menor: las 56 quedan como están', () => {
    expect(getMajorArcanaExtras('five-of-swords')).toBeUndefined();
  });

  it('devuelve undefined para un slug desconocido', () => {
    expect(getMajorArcanaExtras('carta-inventada')).toBeUndefined();
  });
});

describe('getMajorArcanaExtrasWordCount', () => {
  it('cuenta las palabras de todos los bloques de texto', () => {
    const extras = MAJOR_ARCANA_EXTRAS['the-fool'];
    const reversedWords = extras.reversed.paragraphs.join(' ').trim().split(/\s+/).length;

    expect(getMajorArcanaExtrasWordCount('the-fool')).toBeGreaterThan(reversedWords);
  });
});
