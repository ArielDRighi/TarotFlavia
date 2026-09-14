/**
 * Tokens de la banda de marca (T-UI-13).
 *
 * Salieron de `EnciclopediaHubContent` cuando su cabecera se extrajo a
 * `<SectionHero>`: gradiente noche, crema para el texto y las estrellas
 * decorativas. Se mantienen en sincronía con `ArticleHero` y los tokens
 * `--color-bg-hero` / `--color-bg-hero-mid` de `globals.css`.
 */

/** Gradiente noche (Noche Profunda → Índigo Oscuro → Noche Profunda). */
export const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';

/** Crema del título sobre el gradiente. */
export const CREAM = '#f9f7f2';

/** Crema atenuada para la bajada. */
export const CREAM_MUTED = 'rgba(249, 247, 242, 0.72)';

/** Filete dorado que remata la banda por abajo. */
export const GOLD_RULE = 'linear-gradient(90deg, transparent, #d69e2e, transparent)';

export interface DecorativeStar {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
}

/** Posiciones de las estrellas decorativas — puramente visuales. */
export const DECORATIVE_STARS: readonly DecorativeStar[] = [
  { top: '22%', left: '12%', size: 3, delay: '0s', duration: '2.8s' },
  { top: '34%', left: '88%', size: 2, delay: '0.6s', duration: '3.2s' },
  { top: '68%', left: '8%', size: 2, delay: '1s', duration: '2.5s' },
  { top: '28%', left: '64%', size: 2, delay: '1.3s', duration: '3.4s' },
];
