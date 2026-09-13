// 5. Components
import { BrandIcon, type BrandIconFrame, type BrandIconSize } from '@/components/ui/brand-icon';
// 6. Utils & types
import type { BrandIconName } from '@/lib/constants/brand-icons';

/**
 * ZodiacSymbol Component Props
 */
export interface ZodiacSymbolProps {
  /** Slug del signo (`ZodiacSign` del horóscopo o de la carta natal: mismos valores). */
  sign: BrandIconName<'zodiac'>;
  /** Etiqueta accesible (nombre del signo en español). Obligatoria por a11y: el `role="img"` necesita un nombre accesible. */
  label: string;
  /** Tamaño (default `md`). */
  size?: BrandIconSize;
  /** Oculto a lectores de pantalla (cuando el nombre del signo ya está al lado). */
  decorative?: boolean;
  /** `medallion`: disco violeta cósmico detrás del icono (ver `BrandIcon`). */
  frame?: BrandIconFrame;
  /** Clases CSS adicionales (layout). */
  className?: string;
}

/**
 * ZodiacSymbol Component
 *
 * Renderiza el icono de marca del signo (`public/images/icons/zodiac/<signo>.webp`,
 * T-UI-12) en lugar del glifo Unicode: el glifo dependía de la fuente del
 * sistema y en varios navegadores salía como emoji multicolor.
 *
 * @example
 * ```tsx
 * <ZodiacSymbol sign={signInfo.sign} label={signInfo.nameEs} size="lg" frame="medallion" />
 * ```
 */
export function ZodiacSymbol({
  sign,
  label,
  size = 'md',
  decorative,
  frame,
  className,
}: ZodiacSymbolProps) {
  return (
    <BrandIcon
      family="zodiac"
      name={sign}
      label={label}
      size={size}
      frame={frame}
      decorative={decorative}
      className={className}
    />
  );
}
