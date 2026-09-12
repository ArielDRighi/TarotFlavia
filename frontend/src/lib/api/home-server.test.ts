/**
 * home-server - Tests (T-SEO-014)
 *
 * La portada resuelve tres bloques en el servidor y cada uno degrada por
 * separado: una API caída no vacía las otras secciones.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getEditorialHomeData, interleaveByCategory, LATEST_GUIDES_LIMIT } from './home-server';
import { ArticleCategory, GUIDE_CATEGORIES } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

const mockGetCanonicalDailyHoroscopes = vi.fn();
const mockGetCanonicalDailyCard = vi.fn();
const mockGetArticlesByCategories = vi.fn();

vi.mock('./horoscope-server', () => ({
  getCanonicalDailyHoroscopes: () => mockGetCanonicalDailyHoroscopes(),
}));

vi.mock('./daily-card-server', () => ({
  getCanonicalDailyCard: () => mockGetCanonicalDailyCard(),
}));

vi.mock('./encyclopedia-articles-api', () => ({
  getArticlesByCategories: (categories: ArticleCategory[]) =>
    mockGetArticlesByCategories(categories),
}));

function buildGuide(category: ArticleCategory, id: number): ArticleSummary {
  return {
    id,
    slug: `guia-${id}`,
    nameEs: `Guía ${id}`,
    category,
    snippet: `Extracto de la guía ${id}`,
    imageUrl: null,
    sortOrder: 1,
  };
}

describe('getEditorialHomeData', () => {
  beforeEach(() => {
    mockGetCanonicalDailyHoroscopes.mockReset().mockResolvedValue(undefined);
    mockGetCanonicalDailyCard.mockReset().mockResolvedValue(undefined);
    mockGetArticlesByCategories.mockReset().mockResolvedValue({});
  });

  it('pide las guías en el orden editorial y las recorta al límite de la portada', async () => {
    const byCategory = Object.fromEntries(
      GUIDE_CATEGORIES.map((category, index) => [category, [buildGuide(category, index + 1)]])
    );
    mockGetArticlesByCategories.mockResolvedValue(byCategory);

    const data = await getEditorialHomeData();

    expect(mockGetArticlesByCategories).toHaveBeenCalledWith(GUIDE_CATEGORIES);
    expect(data.latestGuides).toHaveLength(LATEST_GUIDES_LIMIT);
    expect(data.latestGuides?.[0].category).toBe(GUIDE_CATEGORIES[0]);
    expect(GUIDE_CATEGORIES.length).toBeGreaterThan(LATEST_GUIDES_LIMIT);
  });

  it('intercala por categoría: una categoría con muchas guías no se lleva todos los cupos', async () => {
    mockGetArticlesByCategories.mockResolvedValue({
      [ArticleCategory.GUIDE_TAROT]: [1, 2, 3, 4, 5, 6, 7].map((id) =>
        buildGuide(ArticleCategory.GUIDE_TAROT, id)
      ),
      [ArticleCategory.GUIDE_PENDULUM]: [buildGuide(ArticleCategory.GUIDE_PENDULUM, 20)],
      [ArticleCategory.GUIDE_CHINESE]: [buildGuide(ArticleCategory.GUIDE_CHINESE, 30)],
    });

    const data = await getEditorialHomeData();

    expect(data.latestGuides?.map((guide) => guide.id)).toEqual([1, 20, 30, 2, 3, 4]);
  });

  it('salta las categorías que no resolvieron sin dejar huecos', async () => {
    mockGetArticlesByCategories.mockResolvedValue({
      [ArticleCategory.GUIDE_TAROT]: [buildGuide(ArticleCategory.GUIDE_TAROT, 1)],
      [ArticleCategory.GUIDE_RITUAL]: [buildGuide(ArticleCategory.GUIDE_RITUAL, 2)],
    });

    const data = await getEditorialHomeData();

    expect(data.latestGuides?.map((guide) => guide.id)).toEqual([1, 2]);
  });

  it('deja las guías en undefined si ninguna categoría resolvió', async () => {
    const data = await getEditorialHomeData();

    expect(data.latestGuides).toBeUndefined();
  });

  it('cada bloque degrada por separado', async () => {
    mockGetCanonicalDailyHoroscopes.mockResolvedValue({
      canonicalDate: '2026-09-12',
      horoscopes: [],
      isShowingPreviousDay: false,
    });
    mockGetCanonicalDailyCard.mockResolvedValue(undefined);

    const data = await getEditorialHomeData();

    expect(data.dailyHoroscopes?.canonicalDate).toBe('2026-09-12');
    expect(data.dailyCard).toBeUndefined();
  });

  it('⚠️ un fetcher que rechaza vacía su bloque, no la portada', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockGetCanonicalDailyCard.mockRejectedValue(new Error('API caída'));
    mockGetArticlesByCategories.mockResolvedValue({
      [ArticleCategory.GUIDE_TAROT]: [buildGuide(ArticleCategory.GUIDE_TAROT, 1)],
    });

    const data = await getEditorialHomeData();

    expect(data.dailyCard).toBeUndefined();
    expect(data.latestGuides).toHaveLength(1);
    expect(console.warn).toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('resuelve los tres bloques en paralelo', async () => {
    const order: string[] = [];
    mockGetCanonicalDailyHoroscopes.mockImplementation(async () => {
      order.push('horoscopes:start');
      await Promise.resolve();
      order.push('horoscopes:end');
      return undefined;
    });
    mockGetCanonicalDailyCard.mockImplementation(async () => {
      order.push('card:start');
      return undefined;
    });

    await getEditorialHomeData();

    expect(order.indexOf('card:start')).toBeLessThan(order.indexOf('horoscopes:end'));
  });
});

describe('interleaveByCategory', () => {
  it('devuelve vacío sin categorías resueltas', () => {
    expect(interleaveByCategory({}, GUIDE_CATEGORIES)).toEqual([]);
  });

  it('respeta el orden de categorías dentro de cada vuelta', () => {
    const result = interleaveByCategory(
      {
        [ArticleCategory.GUIDE_RITUAL]: [buildGuide(ArticleCategory.GUIDE_RITUAL, 3)],
        [ArticleCategory.GUIDE_TAROT]: [
          buildGuide(ArticleCategory.GUIDE_TAROT, 1),
          buildGuide(ArticleCategory.GUIDE_TAROT, 2),
        ],
      },
      [ArticleCategory.GUIDE_TAROT, ArticleCategory.GUIDE_RITUAL]
    );

    expect(result.map((guide) => guide.id)).toEqual([1, 3, 2]);
  });
});
