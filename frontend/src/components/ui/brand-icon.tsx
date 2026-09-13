import Image from 'next/image';

import { cn } from '@/lib/utils';
import {
  getBrandIcon,
  type BrandIconFamily,
  type BrandIconName,
} from '@/lib/constants/brand-icons';

/**
 * Tamaños en píxeles CSS. Equivalencias con los emojis que reemplazan:
 * `text-xl` → `sm`, `text-2xl`/`text-3xl` → `md`, `text-4xl`/`text-5xl` → `lg`,
 * `text-6xl` → `xl`, encabezado de ficha → `2xl`. El asset es 512×512, así que `next/image` sirve 1x y 2x nítidos.
 */
export const BRAND_ICON_SIZES = {
  sm: 20,
  md: 32,
  lg: 48,
  xl: 72,
  /** Encabezado de ficha (signo, animal): el sujeto tiene detalle y a 72 px se pierde. */
  '2xl': 112,
} as const;

export type BrandIconSize = keyof typeof BRAND_ICON_SIZES;

/**
 * Diámetro del medallón por tamaño. El icono ocupa ~78 % del disco: un line-art
 * ornamental de trazo fino no lee sobre blanco a estos tamaños (feedback de
 * Ariel, 12-sep); sobre violeta cósmico con el dorado avivado sí.
 */
export const BRAND_ICON_MEDALLION_SIZES = {
  sm: 28,
  md: 44,
  lg: 64,
  xl: 96,
  '2xl': 144,
} as const;

/** Lado del icono dentro del medallón. */
const MEDALLION_ICON_RATIO = 0.78;

export type BrandIconFrame = 'none' | 'medallion';

const SIZE_ORDER: readonly BrandIconSize[] = ['sm', 'md', 'lg', 'xl', '2xl'];

/** Clase `text-*` con la que los consumidores dimensionaban el glifo → tamaño del icono. */
const SIZE_BY_TEXT_CLASS: ReadonlyArray<[RegExp, BrandIconSize]> = [
  [/\btext-(?:xs|sm|base|lg|xl)\b/, 'sm'],
  [/\btext-(?:2|3)xl\b/, 'md'],
  [/\btext-(?:4|5)xl\b/, 'lg'],
  [/\btext-[6-9]xl\b/, 'xl'],
];

/**
 * Deriva el tamaño de la clase de texto (`text-4xl` → `lg`) para los wrappers
 * que reemplazan un glifo de fuente por un `<BrandIcon>` sin cambiar la firma
 * (`ZodiacSymbol`, `ChineseAnimalSymbol`). Si hay varias (responsive), gana
 * la mayor; sin ninguna, `md`.
 */
export function brandIconSizeFromClassName(className?: string): BrandIconSize {
  if (!className) return 'md';
  const found = SIZE_BY_TEXT_CLASS.filter(([re]) => re.test(className)).map(([, size]) => size);
  if (found.length === 0) return 'md';
  return found.reduce((max, size) =>
    SIZE_ORDER.indexOf(size) > SIZE_ORDER.indexOf(max) ? size : max
  );
}

export interface BrandIconProps<F extends BrandIconFamily = BrandIconFamily> {
  /** Familia del registro (`zodiac`, `chinese`, `elements`, `hubs`…). */
  family: F;
  /** Slug dentro de la familia (`aries`, `dragon`, `full_moon`…). */
  name: BrandIconName<F>;
  /** Tamaño (default `md`). */
  size?: BrandIconSize;
  /**
   * Oculta el icono a lectores de pantalla. Usar cuando el texto de al lado ya
   * nombra lo mismo (p. ej. el icono de Aries junto al título "Aries").
   */
  decorative?: boolean;
  /** Etiqueta accesible propia; por defecto el `alt` del registro. */
  label?: string;
  /** Solo para iconos above-the-fold (LCP); por defecto es lazy. */
  priority?: boolean;
  /**
   * `medallion`: disco violeta cósmico con borde dorado detrás del icono, y el
   * dorado avivado. Es el tratamiento por defecto para grillas, encabezados y
   * tarjetas; `none` para iconos chicos en línea con texto.
   */
  frame?: BrandIconFrame;
  /** Clases CSS adicionales. */
  className?: string;
  'data-testid'?: string;
}

/**
 * Icono de marca (T-UI-12).
 *
 * Renderiza un asset de `public/images/icons/<familia>/<slug>.webp` (line-art
 * dorado con alfa) en lugar de un emoji del sistema, así los signos, animales,
 * elementos, etc. se ven idénticos en todos los SO/navegadores y siguen la
 * línea de diseño del sitio.
 *
 * Es un Server Component compatible (sin hooks), se puede usar en páginas SSR.
 *
 * @example
 * ```tsx
 * <BrandIcon family="zodiac" name="aries" size="lg" />
 * <BrandIcon family="chinese" name="dragon" decorative />
 * <BrandIcon family="areas" name="love" label="Amor y relaciones" size="sm" />
 * ```
 */
export function BrandIcon<F extends BrandIconFamily>({
  family,
  name,
  size = 'md',
  decorative = false,
  label,
  priority = false,
  frame = 'none',
  className,
  'data-testid': testId,
}: BrandIconProps<F>) {
  const { src, alt } = getBrandIcon(family, name);
  const medallion = frame === 'medallion';
  const px = medallion
    ? Math.round(BRAND_ICON_MEDALLION_SIZES[size] * MEDALLION_ICON_RATIO)
    : BRAND_ICON_SIZES[size];

  const image = (
    <Image
      src={src}
      alt={decorative ? '' : (label ?? alt)}
      width={px}
      height={px}
      priority={priority}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      draggable={false}
      className={cn(
        'inline-block shrink-0 select-none',
        medallion ? 'brightness-[1.35] saturate-[1.1]' : className
      )}
      data-testid={medallion ? undefined : testId}
    />
  );

  if (!medallion) return image;

  const diameter = BRAND_ICON_MEDALLION_SIZES[size];
  return (
    <span
      className={cn(
        'brand-icon-medallion inline-flex shrink-0 items-center justify-center rounded-full',
        className
      )}
      style={{ width: diameter, height: diameter }}
      aria-hidden={decorative || undefined}
      data-testid={testId}
    >
      {image}
    </span>
  );
}
