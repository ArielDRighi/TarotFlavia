import { describe, it, expect } from 'vitest';

import { getArticleEditorial } from './encyclopedia-editorial.data';

describe('getArticleEditorial', () => {
  it('should return the editorial config for the tarot guide', () => {
    const editorial = getArticleEditorial('guia-tarot');

    expect(editorial).toBeDefined();
    expect(editorial?.hero?.src).toBe('/images/enciclopedia/guia-tarot-hero.webp');
    expect(editorial?.hero?.alt).toMatch(/tarot/i);
  });

  it('should map per-section images keyed by the H2 section number', () => {
    const editorial = getArticleEditorial('guia-tarot');

    // Sección 1 → ilustración lateral (estilo lápiz + dorado)
    expect(editorial?.sections?.[1]?.image?.src).toBe('/images/enciclopedia/tarot-que-es.webp');
    // Sección 5 → historia
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

  it('should return undefined for a slug without editorial config', () => {
    expect(getArticleEditorial('aries')).toBeUndefined();
    expect(getArticleEditorial('inexistente')).toBeUndefined();
  });
});
