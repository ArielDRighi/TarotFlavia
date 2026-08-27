import { describe, it, expect } from 'vitest';

import {
  LISTING_INTROS,
  MIN_LISTING_INTRO_WORDS,
  MIN_LISTING_INTRO_WORDS_BY_KEY,
  getListingIntroWordCount,
  getMinListingIntroWords,
  type ListingIntroData,
  type ListingIntroKey,
} from './listing-intros.data';

/**
 * Guardarraíl de contenido indexable de los listados y hubs (T-SEO-003).
 *
 * Mismo criterio que `chinese-zodiac-profiles.data.test.ts`: si alguien recorta
 * el texto, se entera acá y no en el próximo rechazo de AdSense.
 */

const KEYS = Object.keys(LISTING_INTROS) as ListingIntroKey[];

/** Las 10 rutas que este bloque de contenido tiene que cubrir. */
const RUTAS_ESPERADAS: ListingIntroKey[] = [
  'enciclopedia',
  'enciclopediaTarot',
  'enciclopediaGuias',
  'enciclopediaAstrologia',
  'enciclopediaSignos',
  'enciclopediaPlanetas',
  'enciclopediaCasas',
  'servicios',
  'explorar',
  'contacto',
];

function paragraphsOf(intro: ListingIntroData): string[] {
  return [intro.lead, ...intro.sections.map((section) => section.body)];
}

describe('LISTING_INTROS', () => {
  it('cubre exactamente las rutas delgadas de T-SEO-003', () => {
    expect([...KEYS].sort()).toEqual([...RUTAS_ESPERADAS].sort());
  });

  it.each(RUTAS_ESPERADAS)('%s aporta al menos el piso de palabras propias de su ruta', (key) => {
    expect(getListingIntroWordCount(LISTING_INTROS[key])).toBeGreaterThanOrEqual(
      getMinListingIntroWords(key)
    );
  });

  it('⚠️ T-SEO-012: /servicios tiene un piso propio, más alto que el general', () => {
    // Es la cuarta URL de la sección y la única que no es una ficha: sin este
    // piso, borrar las secciones que T-SEO-012 agregó dejaba el CI en verde.
    expect(getMinListingIntroWords('servicios')).toBeGreaterThan(MIN_LISTING_INTRO_WORDS);
  });

  it('una ruta sin piso propio cae en el general', () => {
    expect(MIN_LISTING_INTRO_WORDS_BY_KEY.contacto).toBeUndefined();
    expect(getMinListingIntroWords('contacto')).toBe(MIN_LISTING_INTRO_WORDS);
  });

  it.each(RUTAS_ESPERADAS)('%s tiene título, lead y al menos dos secciones', (key) => {
    const intro = LISTING_INTROS[key];

    expect(intro.title.trim().length).toBeGreaterThan(0);
    expect(intro.lead.trim().length).toBeGreaterThan(0);
    expect(intro.sections.length).toBeGreaterThanOrEqual(2);
    intro.sections.forEach((section) => {
      expect(section.heading.trim().length).toBeGreaterThan(0);
      expect(section.body.trim().length).toBeGreaterThan(0);
    });
  });

  it('⚠️ no repite títulos entre rutas: dos URLs con el mismo texto son duplicadas', () => {
    const titles = KEYS.map((key) => LISTING_INTROS[key].title);

    expect(new Set(titles).size).toBe(titles.length);
  });

  it('⚠️ no repite ningún párrafo entre rutas', () => {
    const paragraphs = KEYS.flatMap((key) => paragraphsOf(LISTING_INTROS[key]));

    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });

  it('no deja un enlace interno sin texto ni destino', () => {
    KEYS.forEach((key) => {
      LISTING_INTROS[key].links?.forEach((link) => {
        expect(link.label.trim().length).toBeGreaterThan(0);
        expect(link.href.startsWith('/')).toBe(true);
      });
    });
  });
});

describe('getListingIntroWordCount', () => {
  it('suma el lead y el cuerpo de cada sección', () => {
    const intro: ListingIntroData = {
      title: 'Título de prueba',
      lead: 'Una dos tres',
      sections: [
        { heading: 'Encabezado', body: 'cuatro cinco' },
        { heading: 'Otro', body: 'seis' },
      ],
    };

    expect(getListingIntroWordCount(intro)).toBe(6);
  });

  it('no cuenta los espacios de más como palabras', () => {
    const intro: ListingIntroData = {
      title: 'Título',
      lead: '  una   dos  ',
      sections: [{ heading: 'Encabezado', body: '  tres ' }],
    };

    expect(getListingIntroWordCount(intro)).toBe(3);
  });
});
