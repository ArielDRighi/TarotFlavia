import { describe, it, expect } from 'vitest';

import { getContrastRatio, meetsWcagAA } from '@/lib/utils/contrast';

/**
 * Contrato de contraste WCAG del circuito premium (T-PREM-008 / hallazgos
 * PREM-001, PREM-008 — verificación de cierre).
 *
 * Análogo a `lib/utils/contrast.test.ts` (T-DASH-007): fija con la fórmula de
 * luminancia WCAG que los pares de color que la banda mística `PremiumHero`, la
 * tabla comparativa de `/premium` y la pantalla de activación controlan de forma
 * directa (hex hardcodeados en esos componentes) cumplen AA. Si alguien regresa
 * el dorado a texto blanco, aclara la banda noche o baja el tono de la crema
 * atenuada, este contrato falla antes de llegar a producción.
 *
 * Colores de marca (sincronizados con `globals.css`, `PremiumHero.tsx` y
 * `PremiumPage.tsx`):
 */
const NIGHT = '#1a0a2e'; // --color-bg-hero — banda noche profunda (extremos del gradiente)
const NIGHT_MID = '#2d1b69'; // --color-bg-hero-mid — punto más claro del gradiente noche
const CREAM = '#f9f7f2'; // texto crema sobre la banda / --background
const GOLD = '#d69e2e'; // --color-secondary — chips dorados
const WHITE = '#ffffff'; // --card
const FOREGROUND = '#2d3748'; // --foreground / --card-foreground — texto de tabla y FAQ

/**
 * Crema atenuada usada en el hero (subtítulo) y en el encabezado "Free" de la
 * tabla: `rgba(249, 247, 242, 0.72)`. El navegador la compone sobre la banda
 * noche, así que verificamos el color RESULTANTE (no el token con alfa), que es
 * lo que realmente ve el usuario.
 */
const CREAM_MUTED_ALPHA = 0.72;

/** Compone un color con alfa sobre un fondo opaco y devuelve el hex resultante. */
function composite(foreground: string, alpha: number, background: string): string {
  const hex = (value: string): [number, number, number] => {
    const n = parseInt(value.replace(/^#/, ''), 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  };
  const [fr, fg, fb] = hex(foreground);
  const [br, bg, bb] = hex(background);
  const mix = (f: number, b: number) => Math.round(f * alpha + b * (1 - alpha));
  return (
    '#' +
    [mix(fr, br), mix(fg, bg), mix(fb, bb)].map((c) => c.toString(16).padStart(2, '0')).join('')
  );
}

describe('Contrato de contraste del circuito premium (T-PREM-008)', () => {
  describe('Banda mística (PremiumHero)', () => {
    it('el título crema sobre la banda noche cumple AA', () => {
      const ratio = getContrastRatio(CREAM, NIGHT);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWcagAA(ratio)).toBe(true);
    });

    it('el subtítulo crema atenuado cumple AA incluso sobre el punto más claro del gradiente', () => {
      // Peor caso: la crema atenuada compuesta sobre el índigo medio del gradiente.
      const composited = composite(CREAM, CREAM_MUTED_ALPHA, NIGHT_MID);
      const ratio = getContrastRatio(composited, NIGHT_MID);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWcagAA(ratio)).toBe(true);
    });

    it('el chip dorado usa texto noche (no blanco) para cumplir AA', () => {
      const ratioNight = getContrastRatio(GOLD, NIGHT);
      expect(ratioNight).toBeGreaterThanOrEqual(4.5);
      expect(meetsWcagAA(ratioNight)).toBe(true);

      // El texto blanco sobre el dorado NO cumpliría: por eso el chip es `text-bg-hero`.
      const ratioWhite = getContrastRatio(GOLD, WHITE);
      expect(ratioWhite).toBeLessThan(4.5);
      expect(meetsWcagAA(ratioWhite)).toBe(false);
    });
  });

  describe('Tabla comparativa (/premium)', () => {
    it('el encabezado "Premium" (crema) sobre la banda noche cumple AA', () => {
      const ratio = getContrastRatio(CREAM, NIGHT);
      expect(meetsWcagAA(ratio)).toBe(true);
    });

    it('el encabezado "Free" (crema atenuada) cumple AA sobre todo el gradiente', () => {
      for (const bg of [NIGHT, NIGHT_MID]) {
        const composited = composite(CREAM, CREAM_MUTED_ALPHA, bg);
        expect(meetsWcagAA(getContrastRatio(composited, bg))).toBe(true);
      }
    });

    it('el texto de las filas (foreground) sobre la superficie blanca cumple AA', () => {
      const ratio = getContrastRatio(FOREGROUND, WHITE);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWcagAA(ratio)).toBe(true);
    });
  });

  describe('FAQ y tarjetas de plan (/premium)', () => {
    it('los títulos de pregunta y de plan (card-foreground) cumplen AA sobre la tarjeta', () => {
      const ratio = getContrastRatio(FOREGROUND, WHITE);
      expect(meetsWcagAA(ratio)).toBe(true);
    });

    it('el chip "Recomendado" dorado usa texto noche para cumplir AA', () => {
      const ratio = getContrastRatio(GOLD, NIGHT);
      expect(meetsWcagAA(ratio)).toBe(true);
    });
  });
});
