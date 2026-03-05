import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ArticlesService } from './articles.service';
import { EncyclopediaArticle } from '../../entities/encyclopedia-article.entity';
import { ArticleCategory } from '../../enums/article.enums';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repository: jest.Mocked<Repository<EncyclopediaArticle>>;

  const mockArticleAries: EncyclopediaArticle = {
    id: 1,
    slug: 'aries',
    nameEs: 'Aries',
    nameEn: 'Aries',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet:
      'Aries es el primer signo del zodíaco, regido por Marte, con elemento Fuego y modalidad Cardinal.',
    content:
      '# Aries\n\n**Fechas:** 21 de marzo - 19 de abril\n**Elemento:** Fuego',
    metadata: {
      symbol: '♈',
      element: 'fire',
      modality: 'cardinal',
      rulingPlanet: 'mars',
      dateRange: '21 Mar - 19 Abr',
    },
    relatedArticles: ['leo', 'sagittarius'],
    relatedTarotCards: [4],
    imageUrl: '/images/encyclopedia/zodiac/aries.jpg',
    sortOrder: 1,
    viewCount: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockArticleMercury: EncyclopediaArticle = {
    id: 10,
    slug: 'mercury',
    nameEs: 'Mercurio',
    nameEn: 'Mercury',
    category: ArticleCategory.PLANET,
    snippet:
      'Mercurio es el mensajero de los dioses, rige Géminis y Virgo, y domina la comunicación y el intelecto.',
    content:
      '# Mercurio\n\n**Rige:** Géminis y Virgo\n**Mitología:** Mensajero de los dioses',
    metadata: {
      symbol: '☿',
      ruledSigns: ['gemini', 'virgo'],
    },
    relatedArticles: ['gemini', 'virgo'],
    relatedTarotCards: [1],
    imageUrl: '/images/encyclopedia/planets/mercury.jpg',
    sortOrder: 3,
    viewCount: 5,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockArticleLeo: EncyclopediaArticle = {
    id: 5,
    slug: 'leo',
    nameEs: 'Leo',
    nameEn: 'Leo',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet: 'Leo es el quinto signo del zodíaco, regido por el Sol.',
    content: '# Leo\n\n**Fechas:** 23 de julio - 22 de agosto',
    metadata: { symbol: '♌', element: 'fire', modality: 'fixed' },
    relatedArticles: null,
    relatedTarotCards: null,
    imageUrl: null,
    sortOrder: 5,
    viewCount: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  // Helper: crea un mock de SelectQueryBuilder para EncyclopediaArticle
  const createQueryBuilderMock = (
    results: EncyclopediaArticle[],
  ): jest.Mocked<SelectQueryBuilder<EncyclopediaArticle>> => {
    return {
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(results[0] ?? null),
      getMany: jest.fn().mockResolvedValue(results),
    } as unknown as jest.Mocked<SelectQueryBuilder<EncyclopediaArticle>>;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(EncyclopediaArticle),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            increment: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    repository = module.get(getRepositoryToken(EncyclopediaArticle));

    jest.clearAllMocks();
  });

  // ============================================================================
  // getSnippetBySlug
  // ============================================================================

  describe('getSnippetBySlug', () => {
    it('debe retornar ArticleSnippetDto sin campo content', async () => {
      const qb = createQueryBuilderMock([mockArticleAries]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.getSnippetBySlug('aries');

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.slug).toBe('aries');
      expect(result.nameEs).toBe('Aries');
      expect(result.category).toBe(ArticleCategory.ZODIAC_SIGN);
      expect(result.snippet).toBeDefined();
      // NO debe incluir 'content'
      expect('content' in result).toBe(false);
    });

    it('debe lanzar NotFoundException si el slug no existe', async () => {
      const qb = createQueryBuilderMock([]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      await expect(
        service.getSnippetBySlug('slug-inexistente'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException con mensaje en español', async () => {
      const qb = createQueryBuilderMock([]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      await expect(
        service.getSnippetBySlug('slug-inexistente'),
      ).rejects.toThrow('Artículo "slug-inexistente" no encontrado');
    });

    it('debe usar select para NO traer el campo content de la BD', async () => {
      const qb = createQueryBuilderMock([mockArticleAries]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      await service.getSnippetBySlug('aries');

      expect(qb.select).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // findBySlug
  // ============================================================================

  describe('findBySlug', () => {
    it('debe retornar ArticleDetailDto con content completo', async () => {
      const qb = createQueryBuilderMock([mockArticleLeo]);
      repository.findOne.mockResolvedValue(mockArticleAries);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.findBySlug('aries');

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.slug).toBe('aries');
      expect(result.content).toBeDefined();
      expect(result.content).toContain('# Aries');
    });

    it('debe resolver relatedArticles de slugs a objetos ArticleSummaryDto', async () => {
      const qb = createQueryBuilderMock([mockArticleLeo]);
      repository.findOne.mockResolvedValue(mockArticleAries);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.findBySlug('aries');

      expect(result.relatedArticles).toBeInstanceOf(Array);
      expect(result.relatedArticles.length).toBeGreaterThan(0);
      expect(result.relatedArticles[0]).toHaveProperty('slug');
      expect(result.relatedArticles[0]).toHaveProperty('nameEs');
      // NO debe incluir content en los artículos relacionados
      expect('content' in result.relatedArticles[0]).toBe(false);
    });

    it('debe retornar relatedArticles como array vacío si no hay relacionados', async () => {
      repository.findOne.mockResolvedValue(mockArticleLeo);

      const result = await service.findBySlug('leo');

      expect(result.relatedArticles).toEqual([]);
    });

    it('debe lanzar NotFoundException para slug inexistente', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('slug-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar NotFoundException con mensaje en español', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('slug-inexistente')).rejects.toThrow(
        'Artículo "slug-inexistente" no encontrado',
      );
    });

    it('debe incluir metadata, relatedTarotCards e imageUrl en el resultado', async () => {
      const qb = createQueryBuilderMock([]);
      repository.findOne.mockResolvedValue(mockArticleAries);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.findBySlug('aries');

      expect(result.metadata).toBeDefined();
      expect(result.relatedTarotCards).toEqual([4]);
      expect(result.imageUrl).toBe('/images/encyclopedia/zodiac/aries.jpg');
    });
  });

  // ============================================================================
  // findByCategory
  // ============================================================================

  describe('findByCategory', () => {
    it('debe retornar artículos de la categoría ordenados por sortOrder', async () => {
      const qb = createQueryBuilderMock([mockArticleAries, mockArticleLeo]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.findByCategory(ArticleCategory.ZODIAC_SIGN);

      expect(result).toHaveLength(2);
      expect(qb.andWhere).toHaveBeenCalledWith('article.category = :category', {
        category: ArticleCategory.ZODIAC_SIGN,
      });
      expect(qb.orderBy).toHaveBeenCalledWith('article.sortOrder', 'ASC');
    });

    it('debe retornar array vacío si no hay artículos en la categoría', async () => {
      const qb = createQueryBuilderMock([]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.findByCategory(ArticleCategory.MODALITY);

      expect(result).toEqual([]);
    });

    it('debe retornar ArticleSummaryDto sin campo content', async () => {
      const qb = createQueryBuilderMock([mockArticleAries]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.findByCategory(ArticleCategory.ZODIAC_SIGN);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('slug');
      expect(result[0]).toHaveProperty('nameEs');
      expect(result[0]).toHaveProperty('snippet');
      expect(result[0]).toHaveProperty('imageUrl');
      expect(result[0]).toHaveProperty('sortOrder');
      expect('content' in result[0]).toBe(false);
    });
  });

  // ============================================================================
  // search
  // ============================================================================

  describe('search', () => {
    it('debe buscar artículos por término (case-insensitive)', async () => {
      const qb = createQueryBuilderMock([mockArticleMercury]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.search('mercurio');

      expect(result).toHaveLength(1);
      expect(qb.andWhere).toHaveBeenCalledWith(
        '(article.nameEs ILIKE :term OR article.snippet ILIKE :term)',
        { term: '%mercurio%' },
      );
    });

    it('debe retornar array vacío para término vacío o menor a 2 caracteres', async () => {
      const result = await service.search('');
      expect(result).toEqual([]);

      const resultShort = await service.search('a');
      expect(resultShort).toEqual([]);
    });

    it('no debe llamar al repositorio si el término es vacío', async () => {
      await service.search('');

      expect(repository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('debe retornar ArticleSummaryDto sin campo content', async () => {
      const qb = createQueryBuilderMock([mockArticleMercury]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.search('mercurio');

      if (result.length > 0) {
        expect('content' in result[0]).toBe(false);
      }
    });
  });

  // ============================================================================
  // findRelated
  // ============================================================================

  describe('findRelated', () => {
    it('debe retornar artículos relacionados por slugs', async () => {
      const qb = createQueryBuilderMock([mockArticleLeo]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.findRelated(['leo', 'sagittarius']);

      expect(result).toHaveLength(1);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });

    it('debe retornar array vacío para array de slugs vacío', async () => {
      const result = await service.findRelated([]);

      expect(result).toEqual([]);
      expect(repository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('debe retornar ArticleSummaryDto sin campo content', async () => {
      const qb = createQueryBuilderMock([mockArticleLeo]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      const result = await service.findRelated(['leo']);

      if (result.length > 0) {
        expect('content' in result[0]).toBe(false);
      }
    });
  });

  // ============================================================================
  // incrementViewCount (fire-and-forget via findBySlug)
  // ============================================================================

  describe('incrementViewCount (integrado en findBySlug)', () => {
    it('debe llamar increment al obtener detalle de un artículo', async () => {
      const qb = createQueryBuilderMock([]);
      repository.findOne.mockResolvedValue(mockArticleAries);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );

      await service.findBySlug('aries');

      expect(repository.increment).toHaveBeenCalledWith(
        { id: 1 },
        'viewCount',
        1,
      );
    });

    it('no debe bloquear la respuesta aunque increment falle', async () => {
      const qb = createQueryBuilderMock([]);
      repository.findOne.mockResolvedValue(mockArticleAries);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaArticle>,
      );
      repository.increment.mockRejectedValue(new Error('DB error'));

      // No debe lanzar error — es fire-and-forget
      await expect(service.findBySlug('aries')).resolves.toBeDefined();
    });
  });
});
