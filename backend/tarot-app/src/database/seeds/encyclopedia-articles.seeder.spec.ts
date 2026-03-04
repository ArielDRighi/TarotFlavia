import { DataSource, Repository } from 'typeorm';
import { EncyclopediaArticle } from '../../modules/encyclopedia/entities/encyclopedia-article.entity';
import { ArticleCategory } from '../../modules/encyclopedia/enums/article.enums';
import { seedEncyclopediaArticles } from './encyclopedia-articles.seeder';
import {
  ALL_ARTICLES_DATA,
  TOTAL_ARTICLES,
} from '../../modules/encyclopedia/data/articles-seed.data';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRepository(
  count: number,
): jest.Mocked<Repository<EncyclopediaArticle>> {
  return {
    count: jest.fn().mockResolvedValue(count),
    create: jest
      .fn()
      .mockImplementation(
        (data: Partial<EncyclopediaArticle>) => data as EncyclopediaArticle,
      ),
    save: jest.fn().mockResolvedValue([]),
  } as unknown as jest.Mocked<Repository<EncyclopediaArticle>>;
}

function makeDataSource(
  repo: jest.Mocked<Repository<EncyclopediaArticle>>,
): jest.Mocked<DataSource> {
  return {
    getRepository: jest.fn().mockReturnValue(repo),
  } as unknown as jest.Mocked<DataSource>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('seedEncyclopediaArticles', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---- Idempotencia --------------------------------------------------------

  it('should skip seeding when articles already exist', async () => {
    const repo = makeRepository(95);
    const dataSource = makeDataSource(repo);

    await seedEncyclopediaArticles(dataSource);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should insert articles when database is empty', async () => {
    const repo = makeRepository(0);
    const dataSource = makeDataSource(repo);

    await seedEncyclopediaArticles(dataSource);

    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  // ---- Datos de seed -------------------------------------------------------

  it('TOTAL_ARTICLES constant should equal the real data count', () => {
    expect(TOTAL_ARTICLES).toBe(ALL_ARTICLES_DATA.length);
  });

  it('should have at least 47 articles in total', () => {
    expect(ALL_ARTICLES_DATA.length).toBeGreaterThanOrEqual(47);
  });

  // ---- Signos zodiacales ---------------------------------------------------

  it('should have exactly 12 zodiac sign articles', () => {
    const zodiacArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.ZODIAC_SIGN,
    );
    expect(zodiacArticles).toHaveLength(12);
  });

  it('should have sortOrder 1-12 for zodiac signs', () => {
    const zodiacArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.ZODIAC_SIGN,
    );
    const sortOrders = zodiacArticles
      .map((a) => a.sortOrder)
      .sort((x, y) => x - y);
    expect(sortOrders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  // ---- Planetas ------------------------------------------------------------

  it('should have exactly 10 planet articles', () => {
    const planetArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.PLANET,
    );
    expect(planetArticles).toHaveLength(10);
  });

  // ---- Casas astrológicas --------------------------------------------------

  it('should have exactly 12 astrological house articles', () => {
    const houseArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.ASTROLOGICAL_HOUSE,
    );
    expect(houseArticles).toHaveLength(12);
  });

  it('should have sortOrder 1-12 for astrological houses', () => {
    const houseArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.ASTROLOGICAL_HOUSE,
    );
    const sortOrders = houseArticles
      .map((a) => a.sortOrder)
      .sort((x, y) => x - y);
    expect(sortOrders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  // ---- Elementos y modalidades ---------------------------------------------

  it('should have exactly 4 element articles', () => {
    const elementArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.ELEMENT,
    );
    expect(elementArticles).toHaveLength(4);
  });

  it('should have exactly 3 modality articles', () => {
    const modalityArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.MODALITY,
    );
    expect(modalityArticles).toHaveLength(3);
  });

  // ---- Guías ---------------------------------------------------------------

  it('should have exactly 1 guide_numerology article', () => {
    const articles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.GUIDE_NUMEROLOGY,
    );
    expect(articles).toHaveLength(1);
  });

  it('should have exactly 1 guide_pendulum article', () => {
    const articles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.GUIDE_PENDULUM,
    );
    expect(articles).toHaveLength(1);
  });

  it('should have exactly 1 guide_birth_chart article', () => {
    const articles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.GUIDE_BIRTH_CHART,
    );
    expect(articles).toHaveLength(1);
  });

  it('should have exactly 1 guide_ritual article', () => {
    const articles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.GUIDE_RITUAL,
    );
    expect(articles).toHaveLength(1);
  });

  it('should have exactly 1 guide_horoscope article', () => {
    const articles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.GUIDE_HOROSCOPE,
    );
    expect(articles).toHaveLength(1);
  });

  it('should have exactly 1 guide_chinese article', () => {
    const articles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.GUIDE_CHINESE,
    );
    expect(articles).toHaveLength(1);
  });

  // ---- Calidad de slugs ----------------------------------------------------

  it('should have all unique slugs', () => {
    const slugs = ALL_ARTICLES_DATA.map((a) => a.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(ALL_ARTICLES_DATA.length);
  });

  it('should have slugs matching URL-safe pattern (lowercase, hyphens only)', () => {
    const slugPattern = /^[a-z0-9-]+$/;
    ALL_ARTICLES_DATA.forEach((article) => {
      expect(article.slug).toMatch(slugPattern);
    });
  });

  // ---- Campos requeridos ---------------------------------------------------

  it('should have non-empty snippet and content for every article', () => {
    ALL_ARTICLES_DATA.forEach((article) => {
      expect(article.snippet.trim().length).toBeGreaterThan(0);
      expect(article.content.trim().length).toBeGreaterThan(0);
    });
  });

  it('should have non-empty nameEs for every article', () => {
    ALL_ARTICLES_DATA.forEach((article) => {
      expect(article.nameEs.trim().length).toBeGreaterThan(0);
    });
  });

  it('should have snippet length <= 400 characters', () => {
    ALL_ARTICLES_DATA.forEach((article) => {
      expect(article.snippet.length).toBeLessThanOrEqual(400);
    });
  });

  // ---- Metadata de signos zodiacales ---------------------------------------

  it('should have metadata with required fields for zodiac signs', () => {
    const zodiacArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.ZODIAC_SIGN,
    );
    zodiacArticles.forEach((article) => {
      expect(article.metadata).not.toBeNull();
      expect(article.metadata?.symbol).toBeTruthy();
      expect(article.metadata?.element).toBeTruthy();
      expect(article.metadata?.modality).toBeTruthy();
      expect(article.metadata?.rulingPlanet).toBeTruthy();
      expect(article.metadata?.dateRange).toBeTruthy();
    });
  });

  // ---- Metadata de planetas ------------------------------------------------

  it('should have metadata with required fields for planets', () => {
    const planetArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.PLANET,
    );
    planetArticles.forEach((article) => {
      expect(article.metadata).not.toBeNull();
      expect(article.metadata?.symbol).toBeTruthy();
    });
  });

  // ---- Metadata de casas ---------------------------------------------------

  it('should have metadata with houseNumber for astrological houses', () => {
    const houseArticles = ALL_ARTICLES_DATA.filter(
      (a) => a.category === ArticleCategory.ASTROLOGICAL_HOUSE,
    );
    houseArticles.forEach((article) => {
      expect(article.metadata).not.toBeNull();
      expect(typeof article.metadata?.houseNumber).toBe('number');
    });
  });
});
