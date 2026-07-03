/**
 * Utilidades de contraste WCAG 2.1 (T-DASH-007 / hallazgo DASH-007).
 *
 * Implementa la fórmula oficial de luminancia relativa y ratio de contraste
 * para verificar de forma ejecutable que el texto del home rediseñado cumple AA
 * sobre la banda oscura y en los chips dorados (que deben usar texto noche, no
 * blanco). No manipula el DOM: son funciones puras reutilizables en tests y, si
 * hiciera falta, en tiempo de ejecución.
 *
 * Referencia: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

/** Umbrales de ratio de contraste WCAG 2.1 nivel AA. */
const AA_NORMAL_TEXT = 4.5;
const AA_LARGE_TEXT = 3;

export interface WcagAaOptions {
  /**
   * Texto grande (≥ 18.66px bold, o ≥ 24px regular). Relaja el umbral AA a 3:1.
   * Por defecto `false` (texto normal, 4.5:1).
   */
  largeText?: boolean;
}

/**
 * Normaliza un color hex (`#rrggbb`, `rrggbb`, `#rgb` o `rgb`) a sus tres canales
 * enteros [0, 255].
 */
function hexToRgb(hex: string): [number, number, number] {
  let normalized = hex.trim().replace(/^#/, '');

  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Color hex inválido: "${hex}"`);
  }

  const int = parseInt(normalized, 16);
  return [(int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff];
}

/**
 * Luminancia relativa de un color según WCAG 2.1.
 */
function relativeLuminance(hex: string): number {
  const channels = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  const [r, g, b] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Ratio de contraste entre dos colores (1:1 … 21:1). El orden de los argumentos
 * es indiferente.
 *
 * @example
 * getContrastRatio('#000000', '#ffffff'); // 21
 * getContrastRatio('#d69e2e', '#1a0a2e'); // ≈ 7.8 (chip dorado + texto noche)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Indica si un ratio de contraste cumple WCAG 2.1 nivel AA.
 *
 * @param ratio Ratio de contraste (p. ej. de `getContrastRatio`).
 * @param options `largeText: true` para aplicar el umbral relajado de 3:1.
 */
export function meetsWcagAA(ratio: number, options: WcagAaOptions = {}): boolean {
  const threshold = options.largeText ? AA_LARGE_TEXT : AA_NORMAL_TEXT;
  return ratio >= threshold;
}
