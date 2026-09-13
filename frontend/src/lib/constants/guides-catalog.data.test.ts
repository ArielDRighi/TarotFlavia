import { describe, it, expect } from 'vitest';

import { GUIDES_CATALOG, GUIDES_CATALOG_LIST, getGuideTheme } from './guides-catalog.data';
import { ArticleCategory, GUIDE_CATEGORIES } from '@/types/encyclopedia-article.types';

/**
 * Catálogo estático de las siete guías (T-SEO-022).
 *
 * Es el piso de "Últimas guías" cuando la API no responde y la fuente única de
 * la miniatura por categoría que comparten `GuiasContent` y `LatestGuides`.
 */
describe('GUIDES_CATALOG (T-SEO-022)', () => {
  it('tiene una entrada por categoría de guía, en el orden editorial de GUIDE_CATEGORIES', () => {
    expect(GUIDES_CATALOG_LIST.map((guide) => guide.category)).toEqual(GUIDE_CATEGORIES);
    expect(GUIDES_CATALOG_LIST).toHaveLength(7);
  });

  it('cada guía trae slug, título, extracto, chip y miniatura del catálogo de la enciclopedia', () => {
    for (const guide of GUIDES_CATALOG_LIST) {
      expect(guide.slug).toMatch(/^guia-[a-z-]+$/);
      expect(guide.nameEs).toMatch(/^Guía de/);
      expect(guide.snippet.split(/\s+/).length).toBeGreaterThanOrEqual(20);
      expect(guide.chip.length).toBeGreaterThan(0);
      expect(guide.image.src).toMatch(/^\/images\/enciclopedia\/guia-[a-z-]+-hero\.webp$/);
      expect(guide.image.alt.length).toBeGreaterThan(0);
    }
  });

  it('los slugs son únicos y coinciden con las rutas reales de /enciclopedia/guias', () => {
    const slugs = GUIDES_CATALOG_LIST.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(GUIDES_CATALOG[ArticleCategory.GUIDE_TAROT].slug).toBe('guia-tarot');
    expect(GUIDES_CATALOG[ArticleCategory.GUIDE_HOROSCOPE].slug).toBe('guia-horoscopo-occidental');
    expect(GUIDES_CATALOG[ArticleCategory.GUIDE_CHINESE].slug).toBe('guia-horoscopo-chino');
  });

  it('⚠️ los extractos no usan lenguaje de salud ni promesas (T-SEO-013 / T-SEO-018)', () => {
    const everything = JSON.stringify(GUIDES_CATALOG);
    expect(everything).not.toMatch(/salud|\bsana|\bcura|garanti|infalible|peligro|advertencia/i);
  });

  it('getGuideTheme devuelve chip + miniatura para una guía y el chip genérico para el resto', () => {
    expect(getGuideTheme(ArticleCategory.GUIDE_PENDULUM)).toEqual({
      chip: 'Péndulo',
      image: GUIDES_CATALOG[ArticleCategory.GUIDE_PENDULUM].image,
    });
    expect(getGuideTheme(ArticleCategory.ZODIAC_SIGN)).toEqual({ chip: 'Guía' });
  });
});
