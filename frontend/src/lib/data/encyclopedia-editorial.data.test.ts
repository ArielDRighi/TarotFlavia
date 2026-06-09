import { describe, it, expect } from 'vitest';

import { getArticleEditorial } from './encyclopedia-editorial.data';

// ─── Tarot (existente — sin regresión) ─────────────────────────────────────

describe('getArticleEditorial – guia-tarot', () => {
  it('should return the editorial config for the tarot guide', () => {
    const editorial = getArticleEditorial('guia-tarot');

    expect(editorial).toBeDefined();
    expect(editorial?.hero?.src).toBe('/images/enciclopedia/guia-tarot-hero.webp');
    expect(editorial?.hero?.alt).toMatch(/tarot/i);
  });

  it('should map per-section images keyed by the H2 section number', () => {
    const editorial = getArticleEditorial('guia-tarot');

    expect(editorial?.sections?.[1]?.image?.src).toBe('/images/enciclopedia/tarot-que-es.webp');
    expect(editorial?.sections?.[5]?.image?.src).toBe('/images/enciclopedia/tarot-historia.webp');
  });

  it('should include a "clave" callout in section 1 and a "sabias" callout in section 3', () => {
    const editorial = getArticleEditorial('guia-tarot');

    expect(editorial?.sections?.[1]?.callout?.variant).toBe('clave');
    expect(editorial?.sections?.[3]?.callout?.variant).toBe('sabias');
    expect(editorial?.sections?.[3]?.callout?.text).toBeTruthy();
  });

  it('should provide a Spanish alt for every section image', () => {
    const editorial = getArticleEditorial('guia-tarot');
    const sections = Object.values(editorial?.sections ?? {});

    expect(sections.length).toBeGreaterThan(0);
    for (const section of sections) {
      if (section.image) {
        expect(section.image.alt.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Slugs sin config (no debe romper) ────────────────────────────────────

describe('getArticleEditorial – slugs sin config', () => {
  it('should return undefined for a slug without editorial config', () => {
    expect(getArticleEditorial('aries')).toBeUndefined();
    expect(getArticleEditorial('inexistente')).toBeUndefined();
  });
});

// ─── Helper compartido ────────────────────────────────────────────────────

function assertGuideEditorial(slug: string, heroFilename: string, expectedSectionCount: number) {
  const editorial = getArticleEditorial(slug);

  it(`${slug}: debe tener config editorial`, () => {
    expect(editorial).toBeDefined();
  });

  it(`${slug}: hero src apunta al asset correcto`, () => {
    expect(editorial?.hero?.src).toBe(`/images/enciclopedia/${heroFilename}`);
  });

  it(`${slug}: hero alt no está vacío`, () => {
    expect(editorial?.hero?.alt.trim().length).toBeGreaterThan(0);
  });

  it(`${slug}: tiene ${expectedSectionCount} secciones con imagen`, () => {
    const sections = Object.values(editorial?.sections ?? {});
    const withImage = sections.filter((s) => s.image !== undefined);
    expect(withImage.length).toBe(expectedSectionCount);
  });

  it(`${slug}: todas las imágenes de sección tienen alt en español (no vacío)`, () => {
    const sections = Object.values(editorial?.sections ?? {});
    for (const section of sections) {
      if (section.image) {
        expect(section.image.alt.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it(`${slug}: secciones están keyed por número de H2 (empiezan en 1)`, () => {
    const keys = Object.keys(editorial?.sections ?? {}).map(Number);
    expect(keys.every((k) => k >= 1)).toBe(true);
  });
}

// ─── Las 6 guías restantes ─────────────────────────────────────────────────

describe('getArticleEditorial – guia-numerologia', () => {
  assertGuideEditorial('guia-numerologia', 'guia-numerologia-hero.webp', 5);
});

describe('getArticleEditorial – guia-pendulo', () => {
  assertGuideEditorial('guia-pendulo', 'guia-pendulo-hero.webp', 5);
});

describe('getArticleEditorial – guia-carta-astral', () => {
  assertGuideEditorial('guia-carta-astral', 'guia-carta-astral-hero.webp', 5);
});

describe('getArticleEditorial – guia-rituales', () => {
  assertGuideEditorial('guia-rituales', 'guia-rituales-hero.webp', 4);
});

describe('getArticleEditorial – guia-horoscopo-occidental', () => {
  assertGuideEditorial('guia-horoscopo-occidental', 'guia-horoscopo-hero.webp', 3);
});

describe('getArticleEditorial – guia-horoscopo-chino', () => {
  assertGuideEditorial('guia-horoscopo-chino', 'guia-horoscopo-chino-hero.webp', 4);
});

// ─── Verificación de src individuales (spot-check por guía) ──────────────

describe('getArticleEditorial – spot-checks de src de sección', () => {
  it('numerologia: sección 1 → pitagoras, sección 5 → ciclos', () => {
    const ed = getArticleEditorial('guia-numerologia');
    expect(ed?.sections?.[1]?.image?.src).toBe('/images/enciclopedia/numerologia-pitagoras.webp');
    expect(ed?.sections?.[5]?.image?.src).toBe('/images/enciclopedia/numerologia-ciclos.webp');
  });

  it('pendulo: sección 1 → historia, sección 5 → preguntar', () => {
    const ed = getArticleEditorial('guia-pendulo');
    expect(ed?.sections?.[1]?.image?.src).toBe('/images/enciclopedia/pendulo-historia.webp');
    expect(ed?.sections?.[5]?.image?.src).toBe('/images/enciclopedia/pendulo-preguntar.webp');
  });

  it('carta-astral: sección 1 → requisitos, sección 5 → aspectos', () => {
    const ed = getArticleEditorial('guia-carta-astral');
    expect(ed?.sections?.[1]?.image?.src).toBe('/images/enciclopedia/carta-astral-requisitos.webp');
    expect(ed?.sections?.[5]?.image?.src).toBe('/images/enciclopedia/carta-astral-aspectos.webp');
  });

  it('rituales: sección 1 → espacio, sección 4 → estructura', () => {
    const ed = getArticleEditorial('guia-rituales');
    expect(ed?.sections?.[1]?.image?.src).toBe('/images/enciclopedia/rituales-espacio.webp');
    expect(ed?.sections?.[4]?.image?.src).toBe('/images/enciclopedia/rituales-estructura.webp');
  });

  it('horoscopo-occidental: sección 1 → elementos, sección 3 → compatibilidad', () => {
    const ed = getArticleEditorial('guia-horoscopo-occidental');
    expect(ed?.sections?.[1]?.image?.src).toBe('/images/enciclopedia/horoscopo-elementos.webp');
    expect(ed?.sections?.[3]?.image?.src).toBe(
      '/images/enciclopedia/horoscopo-compatibilidad.webp'
    );
  });

  it('horoscopo-chino: sección 1 → carrera, sección 4 → compatibilidad', () => {
    const ed = getArticleEditorial('guia-horoscopo-chino');
    expect(ed?.sections?.[1]?.image?.src).toBe('/images/enciclopedia/horoscopo-chino-carrera.webp');
    expect(ed?.sections?.[4]?.image?.src).toBe(
      '/images/enciclopedia/horoscopo-chino-compatibilidad.webp'
    );
  });
});
