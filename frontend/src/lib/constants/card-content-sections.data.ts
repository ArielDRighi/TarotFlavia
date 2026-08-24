/**
 * Secciones de contenido de una ficha de tarot y su guardarraíl de largo
 * (T-SEO-010).
 *
 * ## Por qué existe
 *
 * T-SEO-008 abrió siete columnas nuevas en la entidad y T-SEO-009 las llenó con
 * ~37.000 palabras, pero el HTML servido seguía mostrando las mismas 166
 * palabras por ficha: nadie las renderizaba. Este archivo es la única
 * declaración de qué secciones existen y con qué encabezado salen a la página.
 *
 * Que la lista viva acá —y no repartida en el JSX— es lo que permite que el
 * guardarraíl de `card-content-sections.data.test.ts` verifique el contrato sin
 * duplicarlo: el render itera esta lista, y el test mide contra ella.
 *
 * ## ⚠️ Al editar
 *
 * - **No usar la palabra "salud"** en los encabezados: es territorio YMYL. Va
 *   "energía y bienestar" (regla transversal de terminología, T-SEO-013).
 * - **No bajar `MIN_CARD_DETAIL_WORDS`** para hacer pasar un test: el piso es el
 *   criterio de aceptación de T-SEO-010 y el que mira el revisor de AdSense.
 * - Agregar una sección acá la hace aparecer en las 78 fichas. El contenido lo
 *   carga el backend; el render degrada solo si el campo no viene.
 */

import { countWords } from '@/lib/utils/text';
import type { CardDetail } from '@/types/encyclopedia.types';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Campos de texto de `CardDetail` que se renderizan como sección propia. */
export type CardTextSectionKey =
  | 'meaningLove'
  | 'meaningWork'
  | 'meaningWellbeing'
  | 'symbolism'
  | 'advice'
  | 'yesNo';

/** Toda sección de la ficha, incluida la de combinaciones. */
export type CardSectionKey = CardTextSectionKey | 'combinations';

export interface CardTextSection {
  /** Campo de `CardDetail` del que sale el cuerpo. */
  key: CardTextSectionKey;
  /** Encabezado visible (`h2`). */
  heading: string;
  /** `data-testid` de la `<section>`. */
  testId: string;
}

// ─── Secciones ────────────────────────────────────────────────────────────────

/**
 * Las seis secciones de texto, en el orden en que se leen en la ficha.
 *
 * El orden importa: amor, trabajo y bienestar son las tres preguntas con las que
 * la gente llega a una carta, y simbolismo, consejo y sí/no cierran.
 */
export const CARD_TEXT_SECTIONS: readonly CardTextSection[] = [
  { key: 'meaningLove', heading: 'En el amor', testId: 'card-section-love' },
  { key: 'meaningWork', heading: 'En el trabajo', testId: 'card-section-work' },
  {
    key: 'meaningWellbeing',
    heading: 'En la energía y el bienestar',
    testId: 'card-section-wellbeing',
  },
  { key: 'symbolism', heading: 'El simbolismo de la carta', testId: 'card-section-symbolism' },
  { key: 'advice', heading: 'El consejo de la carta', testId: 'card-section-advice' },
  { key: 'yesNo', heading: '¿Sí o no?', testId: 'card-section-yes-no' },
] as const;

/**
 * La séptima sección. Va aparte porque su cuerpo no es texto sino enlaces
 * internos a otras fichas: son los cross-links que el crawler recorre.
 */
export const CARD_COMBINATIONS_SECTION = {
  heading: 'Combinaciones frecuentes',
  testId: 'card-section-combinations',
} as const;

// ─── Guardarraíl ──────────────────────────────────────────────────────────────

/**
 * Mínimo de palabras propias por ficha.
 *
 * Es el criterio de aceptación de T-SEO-010. El corpus que cargó T-SEO-009 tiene
 * margen de sobra (mínimo 579, promedio 676), así que una ficha que se acerque a
 * este número es señal de que algo dejó de renderizarse, no de que el texto sea
 * corto.
 */
export const MIN_CARD_DETAIL_WORDS = 500;

/**
 * Palabras propias que aporta una ficha.
 *
 * Cuenta el cuerpo —descripción, ambos significados, las seis secciones de texto
 * y las lecturas de las combinaciones— y deja fuera encabezados, palabras clave y
 * metadatos: se renderizan, pero medirlos infla el número sin aportar texto de
 * lectura. Es la misma cuenta conservadora que hace `getAboutPageWordCount`.
 */
export function getCardDetailWordCount(card: CardDetail): number {
  return countWords([
    card.description ?? '',
    card.meaningUpright,
    card.meaningReversed,
    ...CARD_TEXT_SECTIONS.map((section) => card[section.key] ?? ''),
    ...(card.combinations ?? []).map((combination) => combination.reading),
  ]);
}

/**
 * Secciones que la ficha todavía no tiene cargadas.
 *
 * El criterio es el mismo que usa el render para decidir si dibuja la sección:
 * una clave ausente, un string en blanco o una lista vacía cuentan como
 * faltantes. Así el guardarraíl no puede aprobar una ficha que la página no
 * muestra.
 *
 * @returns Las claves faltantes, en el orden de lectura de la ficha.
 */
export function getMissingCardSections(card: CardDetail): CardSectionKey[] {
  const missing: CardSectionKey[] = CARD_TEXT_SECTIONS.filter(
    (section) => !hasSectionText(card[section.key])
  ).map((section) => section.key);

  if (!card.combinations?.length) {
    missing.push('combinations');
  }

  return missing;
}

/** `true` si el campo trae texto real (no ausente ni en blanco). */
export function hasSectionText(text: string | undefined): text is string {
  return typeof text === 'string' && text.trim().length > 0;
}
