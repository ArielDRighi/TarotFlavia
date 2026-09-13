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
 * hero → `xl`. El asset es 512×512, así que `next/image` sirve 1x y 2x nítidos.
 */
export const BRAND_ICON_SIZES = {
  sm: 20,
  md: 32,
  lg: 48,
  xl: 72,
} as const;

export type BrandIconSize = keyof typeof BRAND_ICON_SIZES;

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
  className,
  'data-testid': testId,
}: BrandIconProps<F>) {
  const { src, alt } = getBrandIcon(family, name);
  const px = BRAND_ICON_SIZES[size];

  return (
    <Image
      src={src}
      alt={decorative ? '' : (label ?? alt)}
      width={px}
      height={px}
      priority={priority}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      draggable={false}
      className={cn('inline-block shrink-0 select-none', className)}
      data-testid={testId}
    />
  );
}
