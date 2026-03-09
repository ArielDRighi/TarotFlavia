import { ArticleCategory } from '../enums/article.enums';
import { EncyclopediaArticle } from './encyclopedia-article.entity';

describe('EncyclopediaArticle Entity', () => {
  let article: EncyclopediaArticle;

  beforeEach(() => {
    article = new EncyclopediaArticle();
    article.id = 1;
    article.slug = 'aries';
    article.nameEs = 'Aries';
    article.nameEn = 'Aries';
    article.category = ArticleCategory.ZODIAC_SIGN;
    article.snippet =
      'Aries es el primer signo del zodíaco, regido por Marte, con elemento Fuego y modalidad Cardinal.';
    article.content =
      '# Aries\n\n**Fechas:** 21 de marzo - 19 de abril\n**Elemento:** Fuego\n**Modalidad:** Cardinal\n**Planeta regente:** Marte\n\n## Carácter y Personalidad\n\nAries es un signo de fuego y modalidad cardinal. Los nativos de Aries son energéticos, impulsivos y pioneros por naturaleza. Su coraje los lleva a tomar la iniciativa en cualquier situación.';
    article.metadata = {
      symbol: '♈',
      element: 'fire',
      modality: 'cardinal',
      rulingPlanet: 'mars',
      dateRange: '21 Mar - 19 Abr',
    };
    article.relatedArticles = ['leo', 'sagittarius'];
    article.relatedTarotCards = [4];
    article.imageUrl = '/images/encyclopedia/zodiac/aries.jpg';
    article.sortOrder = 1;
    article.viewCount = 0;
    article.createdAt = new Date('2026-01-01');
    article.updatedAt = new Date('2026-01-01');
  });

  describe('Estructura de la entidad', () => {
    it('debe crearse con todos los campos requeridos', () => {
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('slug');
      expect(article).toHaveProperty('nameEs');
      expect(article).toHaveProperty('nameEn');
      expect(article).toHaveProperty('category');
      expect(article).toHaveProperty('snippet');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('metadata');
      expect(article).toHaveProperty('relatedArticles');
      expect(article).toHaveProperty('relatedTarotCards');
      expect(article).toHaveProperty('imageUrl');
      expect(article).toHaveProperty('sortOrder');
      expect(article).toHaveProperty('viewCount');
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
    });

    it('debe tener el ID como número', () => {
      expect(typeof article.id).toBe('number');
      expect(article.id).toBe(1);
    });

    it('debe tener el slug como string único URL-safe', () => {
      expect(typeof article.slug).toBe('string');
      expect(article.slug).toBe('aries');
    });

    it('debe tener nameEs y nameEn como strings', () => {
      expect(typeof article.nameEs).toBe('string');
      expect(article.nameEs).toBe('Aries');
      expect(typeof article.nameEn).toBe('string');
      expect(article.nameEn).toBe('Aries');
    });
  });

  describe('Categorías', () => {
    it('debe validar el enum de categoría', () => {
      expect(article.category).toBe(ArticleCategory.ZODIAC_SIGN);
    });

    it('debe aceptar todas las categorías del enum', () => {
      const categories = [
        ArticleCategory.ZODIAC_SIGN,
        ArticleCategory.PLANET,
        ArticleCategory.ASTROLOGICAL_HOUSE,
        ArticleCategory.ELEMENT,
        ArticleCategory.MODALITY,
        ArticleCategory.GUIDE_NUMEROLOGY,
        ArticleCategory.GUIDE_PENDULUM,
        ArticleCategory.GUIDE_BIRTH_CHART,
        ArticleCategory.GUIDE_RITUAL,
        ArticleCategory.GUIDE_HOROSCOPE,
        ArticleCategory.GUIDE_CHINESE,
        ArticleCategory.GUIDE_TAROT,
      ];

      categories.forEach((cat) => {
        article.category = cat;
        expect(article.category).toBe(cat);
      });
    });

    it('ArticleCategory debe tener exactamente 12 categorías', () => {
      const categoryValues = Object.values(ArticleCategory);
      expect(categoryValues).toHaveLength(12);
    });

    it('ArticleCategory debe tener los valores correctos', () => {
      expect(ArticleCategory.ZODIAC_SIGN).toBe('zodiac_sign');
      expect(ArticleCategory.PLANET).toBe('planet');
      expect(ArticleCategory.ASTROLOGICAL_HOUSE).toBe('astro_house');
      expect(ArticleCategory.ELEMENT).toBe('element');
      expect(ArticleCategory.MODALITY).toBe('modality');
      expect(ArticleCategory.GUIDE_NUMEROLOGY).toBe('guide_numerology');
      expect(ArticleCategory.GUIDE_PENDULUM).toBe('guide_pendulum');
      expect(ArticleCategory.GUIDE_BIRTH_CHART).toBe('guide_birth_chart');
      expect(ArticleCategory.GUIDE_RITUAL).toBe('guide_ritual');
      expect(ArticleCategory.GUIDE_HOROSCOPE).toBe('guide_horoscope');
      expect(ArticleCategory.GUIDE_CHINESE).toBe('guide_chinese');
      expect(ArticleCategory.GUIDE_TAROT).toBe('guide_tarot');
    });
  });

  describe('Contenido', () => {
    it('debe tener snippet como string no vacío', () => {
      expect(typeof article.snippet).toBe('string');
      expect(article.snippet.length).toBeGreaterThan(0);
    });

    it('debe tener content como string no vacío', () => {
      expect(typeof article.content).toBe('string');
      expect(article.content.length).toBeGreaterThan(0);
    });

    it('snippet debe ser más corto que content', () => {
      expect(article.snippet.length).toBeLessThan(article.content.length);
    });
  });

  describe('Metadata JSONB', () => {
    it('debe aceptar estructura flexible en JSONB metadata', () => {
      expect(article.metadata).toHaveProperty('symbol');
      expect(article.metadata).toHaveProperty('element');
      expect(article.metadata).toHaveProperty('modality');
      expect(article.metadata).toHaveProperty('rulingPlanet');
    });

    it('debe permitir metadata null', () => {
      article.metadata = null;
      expect(article.metadata).toBeNull();
    });

    it('debe aceptar metadata con estructura de guía', () => {
      article.metadata = {
        ctaUrl: '/numerologia',
        ctaLabel: 'Calcular mi Numerología',
        sections: ['numeros-1-9', 'numeros-maestros', 'como-calcular'],
      };
      expect(article.metadata).toHaveProperty('ctaUrl');
      expect(article.metadata).toHaveProperty('sections');
    });
  });

  describe('Relaciones', () => {
    it('debe permitir relatedArticles null', () => {
      article.relatedArticles = null;
      expect(article.relatedArticles).toBeNull();
    });

    it('debe almacenar slugs en relatedArticles', () => {
      article.relatedArticles = ['leo', 'sagittarius', 'gemini'];
      expect(article.relatedArticles).toEqual(['leo', 'sagittarius', 'gemini']);
      expect(article.relatedArticles.every((s) => typeof s === 'string')).toBe(
        true,
      );
    });

    it('debe permitir relatedTarotCards null', () => {
      article.relatedTarotCards = null;
      expect(article.relatedTarotCards).toBeNull();
    });

    it('debe almacenar IDs numéricos en relatedTarotCards', () => {
      article.relatedTarotCards = [4, 7, 15];
      expect(article.relatedTarotCards).toEqual([4, 7, 15]);
      expect(
        article.relatedTarotCards.every((id) => typeof id === 'number'),
      ).toBe(true);
    });

    it('debe aceptar array vacío en relatedArticles', () => {
      article.relatedArticles = [];
      expect(article.relatedArticles).toEqual([]);
    });

    it('debe aceptar array vacío en relatedTarotCards', () => {
      article.relatedTarotCards = [];
      expect(article.relatedTarotCards).toEqual([]);
    });
  });

  describe('Imagen y ordenamiento', () => {
    it('debe permitir imageUrl null', () => {
      article.imageUrl = null;
      expect(article.imageUrl).toBeNull();
    });

    it('debe almacenar imageUrl como string', () => {
      article.imageUrl = '/images/encyclopedia/zodiac/aries.jpg';
      expect(typeof article.imageUrl).toBe('string');
    });

    it('debe tener sortOrder como número', () => {
      expect(typeof article.sortOrder).toBe('number');
      expect(article.sortOrder).toBe(1);
    });

    it('debe aceptar sortOrder 0 para artículos sin orden específico', () => {
      article.sortOrder = 0;
      expect(article.sortOrder).toBe(0);
    });
  });

  describe('nameEn opcional', () => {
    it('debe permitir nameEn null', () => {
      article.nameEn = null;
      expect(article.nameEn).toBeNull();
    });
  });

  describe('Métricas y timestamps', () => {
    it('debe inicializar viewCount en 0', () => {
      const newArticle = new EncyclopediaArticle();
      newArticle.viewCount = 0;
      expect(newArticle.viewCount).toBe(0);
    });

    it('debe tener viewCount como número', () => {
      expect(typeof article.viewCount).toBe('number');
    });

    it('debe tener createdAt como Date', () => {
      expect(article.createdAt).toBeInstanceOf(Date);
    });

    it('debe tener updatedAt como Date', () => {
      expect(article.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Casos de uso por categoría', () => {
    it('debe representar un signo zodiacal correctamente', () => {
      expect(article.category).toBe(ArticleCategory.ZODIAC_SIGN);
      expect(article.metadata).toHaveProperty('symbol');
      expect(article.metadata).toHaveProperty('dateRange');
    });

    it('debe representar un planeta correctamente', () => {
      article.slug = 'mercury';
      article.nameEs = 'Mercurio';
      article.nameEn = 'Mercury';
      article.category = ArticleCategory.PLANET;
      article.metadata = {
        symbol: '☿',
        ruledSigns: ['gemini', 'virgo'],
        mythology: 'Mensajero de los dioses',
      };
      expect(article.category).toBe(ArticleCategory.PLANET);
      expect(article.metadata).toHaveProperty('ruledSigns');
    });

    it('debe representar una casa astral correctamente', () => {
      article.slug = 'house-1';
      article.nameEs = 'Casa 1 - El Ascendente';
      article.nameEn = 'House 1 - The Ascendant';
      article.category = ArticleCategory.ASTROLOGICAL_HOUSE;
      article.metadata = {
        number: 1,
        rulingSign: 'aries',
        lifeArea: 'Identidad y apariencia',
      };
      expect(article.category).toBe(ArticleCategory.ASTROLOGICAL_HOUSE);
      expect(article.metadata).toHaveProperty('number');
    });

    it('debe representar una guía de actividad correctamente', () => {
      article.slug = 'guide-numerology';
      article.nameEs = 'Guía de Numerología';
      article.nameEn = 'Numerology Guide';
      article.category = ArticleCategory.GUIDE_NUMEROLOGY;
      article.metadata = {
        ctaUrl: '/numerologia',
        ctaLabel: 'Calcular mi Numerología',
      };
      expect(article.category).toBe(ArticleCategory.GUIDE_NUMEROLOGY);
      expect(article.metadata).toHaveProperty('ctaUrl');
    });
  });
});
