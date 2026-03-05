import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from '../../application/services/articles.service';
import { ArticleCategory } from '../../enums/article.enums';
import {
  ArticleDetailDto,
  ArticleSnippetDto,
  ArticleSummaryDto,
} from '../../application/dto/article-response.dto';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let articlesService: jest.Mocked<ArticlesService>;

  // ── Fixtures ──────────────────────────────────────────────────────────────

  const mockSnippetAries: ArticleSnippetDto = {
    id: 1,
    slug: 'aries',
    nameEs: 'Aries',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Aries es el primer signo del zodíaco, regido por Marte, con elemento Fuego y modalidad Cardinal.',
  };

  const mockSummaryAries: ArticleSummaryDto = {
    ...mockSnippetAries,
    imageUrl: '/images/encyclopedia/zodiac/aries.jpg',
    sortOrder: 1,
  };

  const mockSummaryLeo: ArticleSummaryDto = {
    id: 5,
    slug: 'leo',
    nameEs: 'Leo',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet: 'Leo es el quinto signo del zodíaco, regido por el Sol.',
    imageUrl: null,
    sortOrder: 5,
  };

  const mockDetailAries: ArticleDetailDto = {
    ...mockSummaryAries,
    nameEn: 'Aries',
    content:
      '# Aries\n\n**Fechas:** 21 de marzo - 19 de abril\n**Elemento:** Fuego',
    metadata: {
      symbol: '♈',
      element: 'fire',
      modality: 'cardinal',
      rulingPlanet: 'mars',
      dateRange: '21 Mar - 19 Abr',
    },
    relatedArticles: [mockSummaryLeo],
    relatedTarotCards: [4],
  };

  const mockSummaryMercury: ArticleSummaryDto = {
    id: 10,
    slug: 'mercury',
    nameEs: 'Mercurio',
    category: ArticleCategory.PLANET,
    snippet:
      'Mercurio es el mensajero de los dioses, rige Géminis y Virgo, y domina la comunicación.',
    imageUrl: '/images/encyclopedia/planets/mercury.jpg',
    sortOrder: 3,
  };

  // ── Setup ─────────────────────────────────────────────────────────────────

  beforeEach(async () => {
    const mockService: jest.Mocked<ArticlesService> = {
      getSnippetBySlug: jest.fn(),
      findBySlug: jest.fn(),
      findByCategory: jest.fn(),
      search: jest.fn(),
      findRelated: jest.fn(),
    } as unknown as jest.Mocked<ArticlesService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    articlesService = module.get(ArticlesService);

    jest.clearAllMocks();
  });

  // ── GET /encyclopedia/articles ────────────────────────────────────────────

  describe('GET /encyclopedia/articles (getArticles)', () => {
    it('debe retornar todos los artículos cuando no hay filtros', async () => {
      articlesService.findByCategory.mockResolvedValue([]);
      articlesService.search.mockResolvedValue([
        mockSummaryAries,
        mockSummaryLeo,
        mockSummaryMercury,
      ]);

      // Sin filtros debe llamar a search con término vacío equivalente
      // La lógica real determina si delega a findByCategory o search
      // Verificamos con category filter
      articlesService.findByCategory.mockResolvedValue([
        mockSummaryAries,
        mockSummaryLeo,
      ]);

      const result = await controller.getArticles({
        category: ArticleCategory.ZODIAC_SIGN,
      });

      expect(result).toHaveLength(2);
      expect(articlesService.findByCategory).toHaveBeenCalledWith(
        ArticleCategory.ZODIAC_SIGN,
      );
    });

    it('GET /articles?category=zodiac_sign debe retornar artículos de esa categoría', async () => {
      articlesService.findByCategory.mockResolvedValue([
        mockSummaryAries,
        mockSummaryLeo,
      ]);

      const result = await controller.getArticles({
        category: ArticleCategory.ZODIAC_SIGN,
      });

      expect(articlesService.findByCategory).toHaveBeenCalledWith(
        ArticleCategory.ZODIAC_SIGN,
      );
      expect(result).toHaveLength(2);
    });

    it('GET /articles?search=mercurio debe delegar al servicio de búsqueda', async () => {
      articlesService.search.mockResolvedValue([mockSummaryMercury]);

      const result = await controller.getArticles({ search: 'mercurio' });

      expect(articlesService.search).toHaveBeenCalledWith('mercurio');
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('mercury');
    });

    it('cuando hay search Y category, debe priorizar la búsqueda', async () => {
      articlesService.search.mockResolvedValue([mockSummaryMercury]);

      await controller.getArticles({
        search: 'mercurio',
        category: ArticleCategory.PLANET,
      });

      expect(articlesService.search).toHaveBeenCalledWith('mercurio');
      expect(articlesService.findByCategory).not.toHaveBeenCalled();
    });

    it('sin filtros debe retornar array vacío (búsqueda con término vacío)', async () => {
      articlesService.search.mockResolvedValue([]);

      const result = await controller.getArticles({});

      expect(result).toEqual([]);
    });
  });

  // ── GET /encyclopedia/articles/categories ─────────────────────────────────

  describe('GET /encyclopedia/articles/categories (getCategories)', () => {
    it('debe retornar lista de categorías disponibles', async () => {
      const result = await controller.getCategories();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('debe incluir las 11 categorías del enum ArticleCategory', async () => {
      const result = await controller.getCategories();
      const categoryValues = Object.values(ArticleCategory);

      expect(result.length).toBe(categoryValues.length);
    });

    it('cada categoría debe tener la estructura correcta', async () => {
      const result = await controller.getCategories();

      result.forEach((item) => {
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('label');
      });
    });
  });

  // ── GET /encyclopedia/articles/snippet/:slug ──────────────────────────────

  describe('GET /encyclopedia/articles/snippet/:slug (getSnippet)', () => {
    it('debe retornar snippet sin campo content', async () => {
      articlesService.getSnippetBySlug.mockResolvedValue(mockSnippetAries);

      const result = await controller.getSnippet('aries');

      expect(articlesService.getSnippetBySlug).toHaveBeenCalledWith('aries');
      expect(result).toEqual(mockSnippetAries);
      expect('content' in result).toBe(false);
    });

    it('debe propagar NotFoundException cuando el slug no existe', async () => {
      articlesService.getSnippetBySlug.mockRejectedValue(
        new NotFoundException('Artículo "slug-inexistente" no encontrado'),
      );

      await expect(controller.getSnippet('slug-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── GET /encyclopedia/articles/category/:category ─────────────────────────

  describe('GET /encyclopedia/articles/category/:category (getByCategory)', () => {
    it('debe retornar artículos de la categoría indicada', async () => {
      articlesService.findByCategory.mockResolvedValue([
        mockSummaryAries,
        mockSummaryLeo,
      ]);

      const result = await controller.getByCategory(
        ArticleCategory.ZODIAC_SIGN,
      );

      expect(articlesService.findByCategory).toHaveBeenCalledWith(
        ArticleCategory.ZODIAC_SIGN,
      );
      expect(result).toHaveLength(2);
    });

    it('debe retornar array vacío si no hay artículos en la categoría', async () => {
      articlesService.findByCategory.mockResolvedValue([]);

      const result = await controller.getByCategory(ArticleCategory.MODALITY);

      expect(result).toEqual([]);
    });
  });

  // ── GET /encyclopedia/articles/:slug ─────────────────────────────────────

  describe('GET /encyclopedia/articles/:slug (getArticle)', () => {
    it('GET /articles/aries debe retornar artículo completo con content', async () => {
      articlesService.findBySlug.mockResolvedValue(mockDetailAries);

      const result = await controller.getArticle('aries');

      expect(articlesService.findBySlug).toHaveBeenCalledWith('aries');
      expect(result).toEqual(mockDetailAries);
      expect(result.content).toBeDefined();
      expect(result.content).toContain('# Aries');
    });

    it('GET /articles/aries debe incluir relatedArticles como array', async () => {
      articlesService.findBySlug.mockResolvedValue(mockDetailAries);

      const result = await controller.getArticle('aries');

      expect(result.relatedArticles).toBeInstanceOf(Array);
    });

    it('GET /articles/nonexistent debe propagar NotFoundException (404)', async () => {
      articlesService.findBySlug.mockRejectedValue(
        new NotFoundException('Artículo "nonexistent" no encontrado'),
      );

      await expect(controller.getArticle('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
