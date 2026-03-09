import { ArticleCategory } from '../enums/article.enums';

/**
 * Interfaz de datos para el seed de artículos de la Enciclopedia Mística.
 * Centralizada aquí para que todos los archivos de datos la importen
 * desde un único punto, siguiendo el mismo patrón que CardSeedData
 * en cards-seed.data.ts.
 */
export interface ArticleSeedData {
  slug: string;
  nameEs: string;
  nameEn: string | null;
  category: ArticleCategory;
  /** Máx ~400 caracteres. Texto para el widget "Ver más" en páginas de módulos */
  snippet: string;
  /** Markdown completo para la página de detalle */
  content: string;
  metadata: Record<string, unknown> | null;
  /** IDs de cartas de tarot relacionadas (referencia a EncyclopediaTarotCard).
   *  Los IDs corresponden a la posición 1-based de la carta en ALL_TAROT_CARDS
   *  (arcano 0 = ID 1, arcano I = ID 2, ..., arcano XXI = ID 22).
   */
  relatedTarotCards: number[] | null;
  /** Slugs de artículos relacionados (referencia a EncyclopediaArticle.slug) */
  relatedArticles?: string[] | null;
  sortOrder: number;
}
