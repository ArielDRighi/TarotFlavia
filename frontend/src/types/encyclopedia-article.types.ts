/**
 * Encyclopedia Article Types
 *
 * TypeScript types and interfaces for the Mystic Encyclopedia articles module.
 */

import type { CardSummary } from './encyclopedia.types';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ArticleCategory {
  ZODIAC_SIGN = 'zodiac_sign',
  PLANET = 'planet',
  ASTROLOGICAL_HOUSE = 'astro_house',
  ELEMENT = 'element',
  MODALITY = 'modality',
  GUIDE_NUMEROLOGY = 'guide_numerology',
  GUIDE_PENDULUM = 'guide_pendulum',
  GUIDE_BIRTH_CHART = 'guide_birth_chart',
  GUIDE_RITUAL = 'guide_ritual',
  GUIDE_HOROSCOPE = 'guide_horoscope',
  GUIDE_CHINESE = 'guide_chinese',
  GUIDE_TAROT = 'guide_tarot',
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ArticleSnippet {
  id: number;
  slug: string;
  nameEs: string;
  category: ArticleCategory;
  snippet: string;
}

export interface ArticleSummary extends ArticleSnippet {
  imageUrl: string | null;
  sortOrder: number;
}

export interface ArticleDetail extends ArticleSummary {
  nameEn: string | null;
  content: string; // Markdown completo
  metadata: Record<string, unknown> | null;
  relatedArticles: ArticleSummary[];
  relatedTarotCards: number[] | null;
}

export interface GlobalSearchResult {
  tarotCards: CardSummary[];
  articles: ArticleSummary[];
  total: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Categorías de guía en orden de exhibición. La guía de Tarot va primera
 * (BUG-017). Vive acá y no en `GuiasContent` porque la ruta `/enciclopedia/guias`
 * —un server component— necesita la misma lista para sembrar el listado sin
 * importar el componente cliente (T-SEO-003).
 */
export const GUIDE_CATEGORIES: ArticleCategory[] = [
  ArticleCategory.GUIDE_TAROT,
  ArticleCategory.GUIDE_NUMEROLOGY,
  ArticleCategory.GUIDE_PENDULUM,
  ArticleCategory.GUIDE_BIRTH_CHART,
  ArticleCategory.GUIDE_RITUAL,
  ArticleCategory.GUIDE_HOROSCOPE,
  ArticleCategory.GUIDE_CHINESE,
];

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  [ArticleCategory.ZODIAC_SIGN]: 'Signos Zodiacales',
  [ArticleCategory.PLANET]: 'Planetas',
  [ArticleCategory.ASTROLOGICAL_HOUSE]: 'Casas Astrales',
  [ArticleCategory.ELEMENT]: 'Elementos',
  [ArticleCategory.MODALITY]: 'Modalidades',
  [ArticleCategory.GUIDE_NUMEROLOGY]: 'Guía de Numerología',
  [ArticleCategory.GUIDE_PENDULUM]: 'Guía del Péndulo',
  [ArticleCategory.GUIDE_BIRTH_CHART]: 'Guía de Carta Astral',
  [ArticleCategory.GUIDE_RITUAL]: 'Guía de Rituales',
  [ArticleCategory.GUIDE_HOROSCOPE]: 'Guía del Horóscopo',
  [ArticleCategory.GUIDE_CHINESE]: 'Guía del Horóscopo Chino',
  [ArticleCategory.GUIDE_TAROT]: 'Guía del Tarot',
};
