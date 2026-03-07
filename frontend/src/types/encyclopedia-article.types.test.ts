/**
 * Tests for Encyclopedia Article Types
 */

import { describe, it, expect } from 'vitest';
import {
  ArticleCategory,
  ARTICLE_CATEGORY_LABELS,
  type ArticleSnippet,
  type ArticleSummary,
  type ArticleDetail,
  type GlobalSearchResult,
} from './encyclopedia-article.types';
import { ArcanaType } from './encyclopedia.types';

describe('encyclopedia article types', () => {
  describe('ArticleCategory enum', () => {
    it('should have all 11 article categories', () => {
      const categories = Object.values(ArticleCategory);
      expect(categories).toHaveLength(11);
    });

    it('should have correct category values', () => {
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
    });
  });

  describe('ArticleSnippet interface', () => {
    it('should accept valid article snippet', () => {
      const snippet: ArticleSnippet = {
        id: 1,
        slug: 'aries',
        nameEs: 'Aries',
        category: ArticleCategory.ZODIAC_SIGN,
        snippet: 'El primer signo del zodiaco, regido por Marte.',
      };

      expect(snippet.id).toBe(1);
      expect(snippet.slug).toBe('aries');
      expect(snippet.category).toBe(ArticleCategory.ZODIAC_SIGN);
    });

    it('should have numeric id (not string)', () => {
      const snippet: ArticleSnippet = {
        id: 42,
        slug: 'mercurio',
        nameEs: 'Mercurio',
        category: ArticleCategory.PLANET,
        snippet: 'El planeta de la comunicación.',
      };

      expect(typeof snippet.id).toBe('number');
    });
  });

  describe('ArticleSummary interface', () => {
    it('should extend ArticleSnippet with imageUrl and sortOrder', () => {
      const summary: ArticleSummary = {
        id: 1,
        slug: 'aries',
        nameEs: 'Aries',
        category: ArticleCategory.ZODIAC_SIGN,
        snippet: 'El primer signo del zodiaco.',
        imageUrl: '/images/zodiac/aries.jpg',
        sortOrder: 1,
      };

      expect(summary.imageUrl).toBe('/images/zodiac/aries.jpg');
      expect(summary.sortOrder).toBe(1);
    });

    it('should accept null imageUrl', () => {
      const summary: ArticleSummary = {
        id: 2,
        slug: 'mercurio',
        nameEs: 'Mercurio',
        category: ArticleCategory.PLANET,
        snippet: 'El planeta de la comunicación.',
        imageUrl: null,
        sortOrder: 1,
      };

      expect(summary.imageUrl).toBeNull();
    });
  });

  describe('ArticleDetail interface', () => {
    it('should extend ArticleSummary with full detail fields', () => {
      const relatedArticle: ArticleSummary = {
        id: 2,
        slug: 'mercurio',
        nameEs: 'Mercurio',
        category: ArticleCategory.PLANET,
        snippet: 'El planeta de la comunicación.',
        imageUrl: null,
        sortOrder: 1,
      };

      const detail: ArticleDetail = {
        id: 1,
        slug: 'aries',
        nameEs: 'Aries',
        category: ArticleCategory.ZODIAC_SIGN,
        snippet: 'El primer signo del zodiaco.',
        imageUrl: '/images/zodiac/aries.jpg',
        sortOrder: 1,
        nameEn: 'Aries',
        content: '## Aries\n\nContenido completo del artículo...',
        metadata: { symbol: '♈', color: '#FF4500' },
        relatedArticles: [relatedArticle],
        relatedTarotCards: [1, 2, 3],
      };

      expect(detail.nameEn).toBe('Aries');
      expect(detail.content).toContain('## Aries');
      expect(detail.metadata).toEqual({ symbol: '♈', color: '#FF4500' });
      expect(detail.relatedArticles).toHaveLength(1);
      expect(detail.relatedTarotCards).toHaveLength(3);
    });

    it('should accept null for optional fields', () => {
      const detail: ArticleDetail = {
        id: 10,
        slug: 'guia-numerologia',
        nameEs: 'Guía de Numerología',
        category: ArticleCategory.GUIDE_NUMEROLOGY,
        snippet: 'Aprende los fundamentos de la numerología.',
        imageUrl: null,
        sortOrder: 1,
        nameEn: null,
        content: '## Numerología\n\nContenido...',
        metadata: null,
        relatedArticles: [],
        relatedTarotCards: null,
      };

      expect(detail.nameEn).toBeNull();
      expect(detail.metadata).toBeNull();
      expect(detail.relatedTarotCards).toBeNull();
      expect(detail.relatedArticles).toHaveLength(0);
    });
  });

  describe('GlobalSearchResult interface', () => {
    it('should accept valid global search result', () => {
      const cardSummary = {
        id: 1,
        slug: 'the-fool',
        nameEs: 'El Loco',
        arcanaType: ArcanaType.MAJOR,
        number: 0,
        suit: null,
        thumbnailUrl: '/images/tarot/major/00-the-fool.jpg',
      };

      const articleSummary: ArticleSummary = {
        id: 1,
        slug: 'aries',
        nameEs: 'Aries',
        category: ArticleCategory.ZODIAC_SIGN,
        snippet: 'El primer signo del zodiaco.',
        imageUrl: null,
        sortOrder: 1,
      };

      const result: GlobalSearchResult = {
        tarotCards: [cardSummary],
        articles: [articleSummary],
        total: 2,
      };

      expect(result.tarotCards).toHaveLength(1);
      expect(result.articles).toHaveLength(1);
      expect(result.total).toBe(2);
    });

    it('should accept empty result with total 0', () => {
      const result: GlobalSearchResult = {
        tarotCards: [],
        articles: [],
        total: 0,
      };

      expect(result.total).toBe(0);
      expect(result.tarotCards).toHaveLength(0);
      expect(result.articles).toHaveLength(0);
    });
  });

  describe('ARTICLE_CATEGORY_LABELS constant', () => {
    it('should have labels for all 11 categories', () => {
      const categories = Object.values(ArticleCategory);
      categories.forEach((category) => {
        expect(ARTICLE_CATEGORY_LABELS[category]).toBeDefined();
      });
    });

    it('should have correct Spanish labels', () => {
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.ZODIAC_SIGN]).toBe('Signos Zodiacales');
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.PLANET]).toBe('Planetas');
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.ASTROLOGICAL_HOUSE]).toBe('Casas Astrales');
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.ELEMENT]).toBe('Elementos');
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.MODALITY]).toBe('Modalidades');
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.GUIDE_NUMEROLOGY]).toBe('Guía de Numerología');
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.GUIDE_PENDULUM]).toBe('Guía del Péndulo');
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.GUIDE_BIRTH_CHART]).toBe(
        'Guía de Carta Astral'
      );
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.GUIDE_RITUAL]).toBe('Guía de Rituales');
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.GUIDE_HOROSCOPE]).toBe('Guía del Horóscopo');
      expect(ARTICLE_CATEGORY_LABELS[ArticleCategory.GUIDE_CHINESE]).toBe(
        'Guía del Horóscopo Chino'
      );
    });
  });
});
