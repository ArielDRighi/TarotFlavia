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
 * Que la lista viva acá —y no repartida en el JSX— es lo que permite que los
 * tests verifiquen el contrato sin duplicarlo: el render itera esta lista, y el
 * guardarraíl de `CardDetailView.test.tsx` recorre la misma para comprobar que
 * cada sección llegó al DOM.
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

// ─── Types ────────────────────────────────────────────────────────────────────

/** Campos de texto de `CardDetail` que se renderizan como sección propia. */
export type CardTextSectionKey =
  | 'meaningLove'
  | 'meaningWork'
  | 'meaningWellbeing'
  | 'symbolism'
  | 'advice'
  | 'yesNo';

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
];

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
 * Mínimo de palabras propias que la ficha tiene que **poner en la página**.
 *
 * Es el criterio de aceptación de T-SEO-010, y lo mide el guardarraíl de
 * `CardDetailView.test.tsx` sobre el DOM renderizado, no sobre los datos: el
 * corpus vive en el backend y allá tiene su propio test de largo (T-SEO-009,
 * mínimo 579 palabras, promedio 676). Lo que se verifica acá es lo que aquel no
 * puede ver — que el render saque a la página lo que la API manda.
 */
export const MIN_CARD_DETAIL_WORDS = 500;
