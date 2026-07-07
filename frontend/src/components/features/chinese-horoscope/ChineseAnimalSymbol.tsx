'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

/**
 * ChineseAnimalSymbol Component
 *
 * Renderiza el animal del Horóscopo Chino como un **icono de línea
 * monocromático** que hereda el color del texto (`currentColor`), para tomar
 * el lila/primary del sitio igual que `ZodiacSymbol` hace con los glifos
 * zodiacales occidentales.
 *
 * A diferencia del zodiaco occidental (♈–♓, símbolos Unicode con variante de
 * presentación de texto U+FE0E), los 12 animales chinos solo existen como
 * emoji pictográficos multicolor sin variante monocromática. Por eso el canon
 * decidido usa arte SVG de trazo propio en lugar del truco de U+FE0E.
 *
 * Técnica:
 * - `stroke="currentColor"` + `fill="none"`: monocromático y coloreable.
 * - `width/height="1em"`: escala con `font-size`, por lo que las utilidades
 *   `text-4xl`, `text-6xl`, etc. controlan su tamaño (misma API que `ZodiacSymbol`).
 * - `role="img"` + `aria-label`: nombre accesible obligatorio.
 */

/** Relleno sólido para detalles puntuales (ojos, hocico) manteniendo el trazo. */
const SOLID = { fill: 'currentColor', stroke: 'none' } as const;

/**
 * Set de 12 iconos de línea de marca (Rata…Cerdo), en viewBox 24×24.
 * Cada glifo prioriza el rasgo más reconocible del animal (orejas, cuernos,
 * hocico, cresta…) para leerse incluso a tamaño pequeño (badges).
 */
const ANIMAL_GLYPHS: Record<ChineseZodiacAnimal, React.ReactNode> = {
  [ChineseZodiacAnimal.RAT]: (
    <>
      <circle cx="7" cy="7.5" r="2.8" />
      <circle cx="17" cy="7.5" r="2.8" />
      <circle cx="12" cy="13" r="5.5" />
      <circle cx="9.9" cy="12" r="0.7" {...SOLID} />
      <circle cx="14.1" cy="12" r="0.7" {...SOLID} />
      <circle cx="12" cy="14.3" r="0.9" {...SOLID} />
      <path d="M9.5 14.5 L4.5 14 M9.5 15.2 L4.5 16 M14.5 14.5 L19.5 14 M14.5 15.2 L19.5 16" />
    </>
  ),
  [ChineseZodiacAnimal.OX]: (
    <>
      <path d="M7 8 C3.5 6.5 3.5 3 5.5 3 M17 8 C20.5 6.5 20.5 3 18.5 3" />
      <path d="M7 8 C8.5 6.3 15.5 6.3 17 8" />
      <path d="M7 8 C6 15 9 19 12 19 C15 19 18 15 17 8" />
      <ellipse cx="12" cy="15.5" rx="3.2" ry="2.2" />
      <circle cx="9.5" cy="11" r="0.6" {...SOLID} />
      <circle cx="14.5" cy="11" r="0.6" {...SOLID} />
      <circle cx="10.7" cy="15.3" r="0.5" {...SOLID} />
      <circle cx="13.3" cy="15.3" r="0.5" {...SOLID} />
    </>
  ),
  [ChineseZodiacAnimal.TIGER]: (
    <>
      <path d="M6.5 8 C5.5 4 8 4 8.5 6.5 M17.5 8 C18.5 4 16 4 15.5 6.5" />
      <path d="M6 9 C5.5 15 8.5 19 12 19 C15.5 19 18.5 15 18 9 C17.5 6 14.5 6 12 6 C9.5 6 6.5 6 6 9 Z" />
      <path d="M12 6.5 L12 9 M9.5 8 L9 10 M14.5 8 L15 10" />
      <circle cx="9.5" cy="12" r="0.7" {...SOLID} />
      <circle cx="14.5" cy="12" r="0.7" {...SOLID} />
      <path d="M12 13.5 L12 15 M12 15 L10 16 M12 15 L14 16" />
    </>
  ),
  [ChineseZodiacAnimal.RABBIT]: (
    <>
      <path d="M9.5 11 C8 5 8 2.5 9.8 2.5 C11.4 2.5 10.8 7 11 11 M14.5 11 C16 5 16 2.5 14.2 2.5 C12.6 2.5 13.2 7 13 11" />
      <circle cx="12" cy="15.5" r="4.4" />
      <circle cx="12" cy="15.2" r="0.9" {...SOLID} />
      <path d="M12 16 L8.5 17 M12 16 L15.5 17" />
    </>
  ),
  [ChineseZodiacAnimal.DRAGON]: (
    <>
      <path d="M6 11 C6 7.5 9 6 12 6 C15 6 18 7.5 18 11 C18 14.5 15.5 16.5 12 16.5 C8.5 16.5 6 14.5 6 11 Z" />
      <path d="M8 6.5 C6 3.5 4.5 3 4 4 C3.7 4.8 4.8 6 6.8 6.8 M16 6.5 C18 3.5 19.5 3 20 4 C20.3 4.8 19.2 6 17.2 6.8" />
      <circle cx="9.5" cy="10.5" r="1.1" {...SOLID} />
      <circle cx="14.5" cy="10.5" r="1.1" {...SOLID} />
      <path d="M10.5 13.5 C11 14.5 13 14.5 13.5 13.5" />
      <path d="M6 12 L3 12.3 M18 12 L21 12.3" />
    </>
  ),
  [ChineseZodiacAnimal.SNAKE]: (
    <>
      <path d="M17.5 6.5 C13 5.5 11 9 13.5 11 C16 13 13 16.5 9 15.5 C5.5 14.6 5 18.5 8.5 19.5" />
      <path d="M17.5 6.5 C19.5 6 20.5 4 19.5 3" />
      <path d="M19.3 3.3 L21 2.4 M19.3 3.3 L21 4.2" />
      <circle cx="17.8" cy="5.4" r="0.6" {...SOLID} />
    </>
  ),
  [ChineseZodiacAnimal.HORSE]: (
    <>
      <path d="M8 20 C7.5 14 8 12 8 12 C6.2 12 5 10 6 8 C7 6 9 5 12 5 C15 5.2 17 6.5 18 9.5 C19 12.5 18.5 16.5 17 20" />
      <path d="M14.5 5.2 L15.5 2 L17 5.5" />
      <path d="M8 12 C7 10 8 7.5 10.5 6.5" />
      <circle cx="14.5" cy="9.5" r="0.8" {...SOLID} />
    </>
  ),
  [ChineseZodiacAnimal.GOAT]: (
    <>
      <path d="M9 7 C7 4 5.5 3 4.5 4.2 C4 5 4.8 6.5 6.5 7.5 M15 7 C17 4 18.5 3 19.5 4.2 C20 5 19.2 6.5 17.5 7.5" />
      <path d="M8 7.5 C7 13 9 18 12 18 C15 18 17 13 16 7.5 C16 6.2 14 6 12 6 C10 6 8 6.2 8 7.5" />
      <circle cx="10.3" cy="11" r="0.6" {...SOLID} />
      <circle cx="13.7" cy="11" r="0.6" {...SOLID} />
      <path d="M11 18 L11 21 M13 18 L13 21 M12 18 L12 21.5" />
    </>
  ),
  [ChineseZodiacAnimal.MONKEY]: (
    <>
      <circle cx="4.8" cy="12" r="2.4" />
      <circle cx="19.2" cy="12" r="2.4" />
      <circle cx="12" cy="12" r="6.5" />
      <path d="M8.5 11 C8.5 7.5 15.5 7.5 15.5 11 C15.5 16.5 8.5 16.5 8.5 11 Z" />
      <circle cx="10.3" cy="11" r="0.7" {...SOLID} />
      <circle cx="13.7" cy="11" r="0.7" {...SOLID} />
    </>
  ),
  [ChineseZodiacAnimal.ROOSTER]: (
    <>
      <path d="M8 6 C8 4.3 9 4.3 9 6 C9 4.3 10 4.3 10 6 C10 4.3 11 4.3 11 6.3" />
      <circle cx="10" cy="9" r="3" />
      <path d="M12.8 8.3 L16 7.5 L12.8 10 Z" {...SOLID} />
      <path d="M11 11.3 C11 12.8 10 13.3 9.3 12.6" />
      <path d="M9 11.5 C6 12.5 5 16 7.5 18.5 C11 21 16 18.5 16.5 14 C13.5 15 11.2 14 10.7 11.2" />
      <path d="M16.5 14 C19 12 20 8 18 6.5 C17.5 9 16.5 10.5 15 11.5" />
      <circle cx="9.5" cy="8.7" r="0.7" {...SOLID} />
    </>
  ),
  [ChineseZodiacAnimal.DOG]: (
    <>
      <path d="M7.5 7 C4.5 8 4.5 13 6.5 14.5 M16.5 7 C19.5 8 19.5 13 17.5 14.5" />
      <path d="M7.5 7 C7.5 5 16.5 5 16.5 7 C17.5 10 16.5 13.5 13.5 15.5 L13.5 17 C13.5 18 10.5 18 10.5 17 L10.5 15.5 C7.5 13.5 6.5 10 7.5 7" />
      <circle cx="12" cy="16" r="1" {...SOLID} />
      <circle cx="10" cy="11" r="0.7" {...SOLID} />
      <circle cx="14" cy="11" r="0.7" {...SOLID} />
    </>
  ),
  [ChineseZodiacAnimal.PIG]: (
    <>
      <path d="M7.5 8 L6.5 4 L10.5 6.2 M16.5 8 L17.5 4 L13.5 6.2" />
      <circle cx="12" cy="13" r="6" />
      <ellipse cx="12" cy="14.5" rx="3.2" ry="2.3" />
      <path d="M11 14.2 L11 15.4 M13 14.2 L13 15.4" />
      <circle cx="9.3" cy="11" r="0.7" {...SOLID} />
      <circle cx="14.7" cy="11" r="0.7" {...SOLID} />
    </>
  ),
};

/**
 * ChineseAnimalSymbol Component Props
 */
export interface ChineseAnimalSymbolProps {
  /** Animal del zodiaco chino a representar */
  animal: ChineseZodiacAnimal;
  /** Etiqueta accesible (nombre del animal en español). Obligatoria por a11y. */
  label: string;
  /** Clases CSS adicionales (ej. tamaño del texto `text-4xl`) */
  className?: string;
}

/**
 * ChineseAnimalSymbol Component
 *
 * @example
 * ```tsx
 * <ChineseAnimalSymbol animal={ChineseZodiacAnimal.DRAGON} label="Dragón" className="text-4xl" />
 * ```
 */
export function ChineseAnimalSymbol({ animal, label, className }: ChineseAnimalSymbolProps) {
  return (
    <svg
      className={cn('inline-block align-middle', className, 'text-primary')}
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ANIMAL_GLYPHS[animal]}
    </svg>
  );
}
