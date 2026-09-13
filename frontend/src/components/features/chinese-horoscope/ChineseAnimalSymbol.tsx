// 5. Components
import { BrandIcon, type BrandIconFrame, type BrandIconSize } from '@/components/ui/brand-icon';
// 6. Utils & types
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

/**
 * ChineseAnimalSymbol Component Props
 */
export interface ChineseAnimalSymbolProps {
  /** Animal del zodiaco chino */
  animal: ChineseZodiacAnimal;
  /** Etiqueta accesible (nombre del animal en español). Obligatoria por a11y. */
  label: string;
  /** Tamaño (default `md`). */
  size?: BrandIconSize;
  /** `medallion`: disco violeta cósmico detrás del icono (ver `BrandIcon`). */
  frame?: BrandIconFrame;
  /** Oculto a lectores de pantalla (cuando el nombre del animal ya está al lado). */
  decorative?: boolean;
  /** Clases CSS adicionales (layout). */
  className?: string;
}

/**
 * ChineseAnimalSymbol Component
 *
 * Renderiza el animal del Horóscopo Chino como icono de marca
 * (`public/images/icons/chinese/<animal>.webp`, T-UI-12): line-art dorado con
 * el mismo trazo que las ilustraciones del sitio. Reemplaza los 12 SVG
 * dibujados a mano en código, que no tenían relación con la línea visual.
 *
 * @example
 * ```tsx
 * <ChineseAnimalSymbol animal={ChineseZodiacAnimal.DRAGON} label="Dragón" size="lg" />
 * ```
 */
export function ChineseAnimalSymbol({
  animal,
  label,
  size = 'md',
  frame,
  decorative,
  className,
}: ChineseAnimalSymbolProps) {
  return (
    <BrandIcon
      family="chinese"
      name={animal}
      label={label}
      size={size}
      frame={frame}
      decorative={decorative}
      className={className}
    />
  );
}
