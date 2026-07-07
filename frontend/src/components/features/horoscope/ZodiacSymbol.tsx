'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Unicode text presentation variation selector (U+FE0E).
 *
 * Fuerza que el glifo precedente se renderice como **texto monocromático**
 * en lugar de como emoji multicolor del sistema. Es clave para que los
 * símbolos zodiacales (U+2648–U+2653) tomen el color lila/primary del sitio.
 */
export const TEXT_PRESENTATION_SELECTOR = '\uFE0E';

/**
 * ZodiacSymbol Component Props
 */
export interface ZodiacSymbolProps {
  /** Glifo Unicode del signo (ej. "♈") */
  symbol: string;
  /** Etiqueta accesible (nombre del signo en español). Obligatoria por a11y: el `role="img"` necesita un nombre accesible. */
  label: string;
  /** Clases CSS adicionales (ej. tamaño del texto) */
  className?: string;
}

/**
 * ZodiacSymbol Component
 *
 * Renderiza un símbolo zodiacal forzando su presentación como texto
 * monocromático en el color lila/primary de la página, evitando que el
 * sistema operativo/navegador lo muestre como emoji multicolor.
 *
 * Técnica:
 * - Agrega el selector de variación de texto U+FE0E al glifo.
 * - Aplica la clase utilitaria `zodiac-symbol` (`font-variant-emoji: text`).
 * - Aplica el color `text-primary`.
 *
 * @example
 * ```tsx
 * <ZodiacSymbol symbol={signInfo.symbol} label={signInfo.nameEs} className="text-4xl" />
 * ```
 */
export function ZodiacSymbol({ symbol, label, className }: ZodiacSymbolProps) {
  return (
    <span className={cn('zodiac-symbol', className, 'text-primary')} role="img" aria-label={label}>
      {`${symbol}${TEXT_PRESENTATION_SELECTOR}`}
    </span>
  );
}
