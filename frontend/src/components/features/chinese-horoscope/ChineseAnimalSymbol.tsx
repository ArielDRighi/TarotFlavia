// 5. Components
import {
  BrandIcon,
  brandIconSizeFromClassName,
  type BrandIconFrame,
  type BrandIconSize,
} from '@/components/ui/brand-icon';
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
  /** Tamaño; si se omite se deriva de la clase `text-*` de `className` (default `md`). */
  size?: BrandIconSize;
  /** `medallion`: disco violeta cósmico detrás del icono (ver `BrandIcon`). */
  frame?: BrandIconFrame;
  /** Clases CSS adicionales (layout). Las clases `text-*` sólo se usan para derivar el tamaño. */
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
 * Conserva la firma anterior (`animal` + `label` + `className`) para que los
 * consumidores no cambien; `size` es la forma preferida para código nuevo.
 *
 * @example
 * ```tsx
 * <ChineseAnimalSymbol animal={ChineseZodiacAnimal.DRAGON} label="Dragón" size="lg" />
 * <ChineseAnimalSymbol animal={info.animal} label={info.nameEs} className="text-4xl" />
 * ```
 */
export function ChineseAnimalSymbol({
  animal,
  label,
  size,
  frame,
  className,
}: ChineseAnimalSymbolProps) {
  return (
    <BrandIcon
      family="chinese"
      name={animal}
      label={label}
      size={size ?? brandIconSizeFromClassName(className)}
      frame={frame}
      className={className}
    />
  );
}
