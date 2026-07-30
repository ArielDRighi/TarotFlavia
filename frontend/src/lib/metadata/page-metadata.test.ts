import { describe, it, expect } from 'vitest';
import type { Metadata } from 'next';

import { ROUTES } from '@/lib/constants/routes';
import { ZodiacSign } from '@/types/horoscope.types';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';
import {
  STATIC_PAGE_METADATA,
  buildPageMetadata,
  getCardDetailMetadata,
  getChineseZodiacMetadata,
  getHoroscopeSignMetadata,
  getRitualDetailMetadata,
  getServiceDetailMetadata,
} from './page-metadata';

/**
 * Los tests de este módulo custodian el motivo por el que existe (T-PROD-020):
 * Search Console reportó "Duplicada: Google ha elegido una versión canónica
 * diferente a la del usuario" porque casi todas las URLs del sitemap servían el
 * MISMO `<title>` ("Auguria") y la MISMA description heredados del root layout.
 *
 * Por eso las aserciones centrales no son "¿tiene título?" sino
 * **"¿son todos distintos entre sí?"**.
 */

/** Longitud a partir de la cual Google trunca el título en el SERP. */
const MAX_TITLE_LENGTH = 60;
/** Longitud a partir de la cual Google trunca la description. */
const MAX_DESCRIPTION_LENGTH = 160;

function titleOf(metadata: Metadata): string {
  return typeof metadata.title === 'string' ? metadata.title : '';
}

function canonicalOf(metadata: Metadata): string {
  const canonical = metadata.alternates?.canonical;
  return typeof canonical === 'string' ? canonical : '';
}

describe('buildPageMetadata', () => {
  const metadata = buildPageMetadata({
    title: 'Título de prueba',
    description: 'Descripción de prueba.',
    canonical: '/ruta',
  });

  it('expone title, description y canonical propios', () => {
    expect(metadata.title).toBe('Título de prueba');
    expect(metadata.description).toBe('Descripción de prueba.');
    expect(metadata.alternates?.canonical).toBe('/ruta');
  });

  it('replica title y description en Open Graph (preview social por página)', () => {
    expect(metadata.openGraph?.title).toBe('Título de prueba');
    expect(metadata.openGraph?.description).toBe('Descripción de prueba.');
  });

  it('declara un canonical absoluto de path, nunca relativo', () => {
    // `'./'` sirve como default heredable en el root layout, pero una página que
    // declara su canonical debe fijar SU path: si Next lo resolviera contra otro
    // pathname (p. ej. tras un redirect) volveríamos al duplicado.
    expect(canonicalOf(metadata).startsWith('/')).toBe(true);
  });
});

describe('STATIC_PAGE_METADATA', () => {
  const entries = Object.entries(STATIC_PAGE_METADATA);

  it('cubre todas las rutas públicas estáticas del sitemap', () => {
    const covered = entries.map(([, metadata]) => canonicalOf(metadata));

    expect(covered).toEqual(
      expect.arrayContaining([
        ROUTES.ENCICLOPEDIA,
        ROUTES.ENCICLOPEDIA_TAROT,
        ROUTES.ENCICLOPEDIA_ASTROLOGIA,
        ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS,
        ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS,
        ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS,
        ROUTES.ENCICLOPEDIA_GUIAS,
        ROUTES.HOROSCOPO,
        ROUTES.HOROSCOPO_CHINO,
        ROUTES.NUMEROLOGIA,
        ROUTES.PENDULO,
        ROUTES.RITUALES,
        ROUTES.SERVICIOS,
        ROUTES.PREMIUM,
        ROUTES.CONTACTO,
        ROUTES.PRIVACIDAD,
        ROUTES.TERMINOS,
      ])
    );
  });

  it('⚠️ REGRESIÓN T-PROD-020: ningún título se repite entre rutas', () => {
    const titles = entries.map(([, metadata]) => titleOf(metadata));
    const unique = new Set(titles);

    expect(unique.size).toBe(titles.length);
  });

  it('⚠️ REGRESIÓN T-PROD-020: ninguna description se repite entre rutas', () => {
    const descriptions = entries.map(([, metadata]) => metadata.description);
    const unique = new Set(descriptions);

    expect(unique.size).toBe(descriptions.length);
  });

  it('⚠️ REGRESIÓN T-PROD-020: ningún canonical se repite entre rutas', () => {
    const canonicals = entries.map(([, metadata]) => canonicalOf(metadata));
    const unique = new Set(canonicals);

    expect(unique.size).toBe(canonicals.length);
  });

  it.each(Object.keys(STATIC_PAGE_METADATA))('%s tiene title y description no vacíos', (key) => {
    const metadata = STATIC_PAGE_METADATA[key as keyof typeof STATIC_PAGE_METADATA];

    expect(titleOf(metadata).length).toBeGreaterThan(0);
    expect(metadata.description?.length ?? 0).toBeGreaterThan(0);
  });

  it.each(Object.keys(STATIC_PAGE_METADATA))('%s no se trunca en el SERP', (key) => {
    const metadata = STATIC_PAGE_METADATA[key as keyof typeof STATIC_PAGE_METADATA];

    // El template del root layout agrega " | Auguria" (10 caracteres) al title.
    expect(titleOf(metadata).length).toBeLessThanOrEqual(MAX_TITLE_LENGTH - ' | Auguria'.length);
    expect(metadata.description?.length ?? 0).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });

  it.each(Object.keys(STATIC_PAGE_METADATA))('%s escribe en español', (key) => {
    const metadata = STATIC_PAGE_METADATA[key as keyof typeof STATIC_PAGE_METADATA];
    const text = `${titleOf(metadata)} ${metadata.description}`;

    expect(text).not.toMatch(/\b(the|your|discover|free|read)\b/i);
  });
});

describe('getHoroscopeSignMetadata', () => {
  const signs = Object.values(ZodiacSign);

  it('genera un título distinto por signo', () => {
    const titles = signs.map((sign) => titleOf(getHoroscopeSignMetadata(sign)));

    expect(new Set(titles).size).toBe(signs.length);
  });

  it('nombra el signo en español', () => {
    expect(titleOf(getHoroscopeSignMetadata(ZodiacSign.TAURUS))).toContain('Tauro');
    expect(getHoroscopeSignMetadata(ZodiacSign.GEMINI).description).toContain('Géminis');
  });

  it('apunta el canonical a la ruta del signo', () => {
    expect(getHoroscopeSignMetadata(ZodiacSign.ARIES).alternates?.canonical).toBe(
      ROUTES.HOROSCOPO_SIGN(ZodiacSign.ARIES)
    );
  });
});

describe('getChineseZodiacMetadata', () => {
  const animals = Object.values(ChineseZodiacAnimal);

  it('genera un título distinto por animal', () => {
    const titles = animals.map((animal) => titleOf(getChineseZodiacMetadata(animal)));

    expect(new Set(titles).size).toBe(animals.length);
  });

  it('nombra el animal en español', () => {
    expect(titleOf(getChineseZodiacMetadata(ChineseZodiacAnimal.RAT))).toContain('Rata');
  });

  it('apunta el canonical a la ruta del animal', () => {
    expect(getChineseZodiacMetadata(ChineseZodiacAnimal.OX).alternates?.canonical).toBe(
      ROUTES.HOROSCOPO_CHINO_ANIMAL(ChineseZodiacAnimal.OX)
    );
  });
});

describe('getCardDetailMetadata', () => {
  const card = {
    slug: 'the-fool',
    nameEs: 'El Loco',
    description: 'El Loco representa los comienzos y el salto al vacío.',
    meaningUpright: 'Nuevos comienzos, inocencia, espontaneidad.',
  };

  it('usa el nombre de la carta en el título', () => {
    expect(titleOf(getCardDetailMetadata(card))).toContain('El Loco');
  });

  it('apunta el canonical a la ficha canónica de tarot', () => {
    expect(getCardDetailMetadata(card).alternates?.canonical).toBe(
      ROUTES.ENCICLOPEDIA_TAROT_CARD('the-fool')
    );
  });

  it('cae al significado derecho cuando la carta no tiene descripción', () => {
    const metadata = getCardDetailMetadata({ ...card, description: null });

    expect(metadata.description).toContain('Nuevos comienzos');
  });

  it('recorta la description al límite del SERP', () => {
    const metadata = getCardDetailMetadata({
      ...card,
      description: 'Muy larga. '.repeat(40),
    });

    expect(metadata.description?.length ?? 0).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });
});

describe('getRitualDetailMetadata', () => {
  const ritual = {
    slug: 'bano-de-luna',
    title: 'Baño de Luna Llena',
    description: 'Un ritual de limpieza energética para la luna llena.',
  };

  it('usa el título del ritual', () => {
    expect(titleOf(getRitualDetailMetadata(ritual))).toContain('Baño de Luna Llena');
  });

  it('apunta el canonical a la ficha del ritual', () => {
    expect(getRitualDetailMetadata(ritual).alternates?.canonical).toBe(
      ROUTES.RITUAL_DETAIL('bano-de-luna')
    );
  });

  it('recorta la description al límite del SERP', () => {
    const metadata = getRitualDetailMetadata({ ...ritual, description: 'Larga. '.repeat(40) });

    expect(metadata.description?.length ?? 0).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });
});

describe('getServiceDetailMetadata', () => {
  const service = {
    slug: 'registros-akashicos',
    name: 'Registros Akáshicos',
    shortDescription: 'Sesión de lectura de registros akáshicos con Flavia.',
  };

  it('usa el nombre del servicio', () => {
    expect(titleOf(getServiceDetailMetadata(service))).toContain('Registros Akáshicos');
  });

  it('apunta el canonical a la ficha del servicio', () => {
    expect(getServiceDetailMetadata(service).alternates?.canonical).toBe(
      ROUTES.SERVICIO_DETAIL('registros-akashicos')
    );
  });
});
