// 5. Components
import { BrandIcon, type BrandIconSize } from '@/components/ui/brand-icon';
// 6. Utils & types
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { ZodiacSign } from '@/types/horoscope.types';

/** Glifo Unicode (♈…♓) → signo, para los consumidores que siguen pasando `symbol`. */
const SIGN_BY_SYMBOL = new Map<string, ZodiacSign>(
  Object.values(ZODIAC_SIGNS_INFO).map((info) => [info.symbol, info.sign])
);

/**
 * Tamaño del icono según la clase de texto con la que los consumidores
 * dimensionaban el glifo. Si hay varias (responsive), gana la mayor.
 */
const SIZE_BY_TEXT_CLASS: ReadonlyArray<[RegExp, BrandIconSize]> = [
  [/\btext-(?:xs|sm|base|lg|xl)\b/, 'sm'],
  [/\btext-(?:2|3)xl\b/, 'md'],
  [/\btext-(?:4|5)xl\b/, 'lg'],
  [/\btext-(?:[6-9])xl\b/, 'xl'],
];

const SIZE_ORDER: readonly BrandIconSize[] = ['sm', 'md', 'lg', 'xl'];

function sizeFromClassName(className?: string): BrandIconSize {
  if (!className) return 'md';
  const found = SIZE_BY_TEXT_CLASS.filter(([re]) => re.test(className)).map(([, size]) => size);
  if (found.length === 0) return 'md';
  return found.reduce((max, size) =>
    SIZE_ORDER.indexOf(size) > SIZE_ORDER.indexOf(max) ? size : max
  );
}

/**
 * ZodiacSymbol Component Props
 */
export interface ZodiacSymbolProps {
  /** Signo. Preferido a `symbol`. */
  sign?: ZodiacSign;
  /** Glifo Unicode del signo (ej. "♈"), por compatibilidad con los consumidores existentes. */
  symbol?: string;
  /** Etiqueta accesible (nombre del signo en español). Obligatoria por a11y: el `role="img"` necesita un nombre accesible. */
  label: string;
  /** Tamaño; si se omite se deriva de la clase `text-*` de `className` (default `md`). */
  size?: BrandIconSize;
  /** Clases CSS adicionales (layout). Las clases `text-*` sólo se usan para derivar el tamaño. */
  className?: string;
}

/**
 * ZodiacSymbol Component
 *
 * Renderiza el icono de marca del signo (`public/images/icons/zodiac/<signo>.webp`,
 * T-UI-12) en lugar del glifo Unicode: el glifo dependía de la fuente del
 * sistema y en varios navegadores salía como emoji multicolor.
 *
 * Conserva la firma anterior (`symbol` + `label` + `className`) para que los
 * consumidores no cambien; `sign` es la forma preferida para código nuevo.
 *
 * @example
 * ```tsx
 * <ZodiacSymbol sign={signInfo.sign} label={signInfo.nameEs} size="lg" />
 * <ZodiacSymbol symbol={signInfo.symbol} label={signInfo.nameEs} className="text-4xl" />
 * ```
 */
export function ZodiacSymbol({ sign, symbol, label, size, className }: ZodiacSymbolProps) {
  const resolved = sign ?? (symbol ? SIGN_BY_SYMBOL.get(symbol) : undefined);
  if (!resolved) return null;

  return (
    <BrandIcon
      family="zodiac"
      name={resolved}
      label={label}
      size={size ?? sizeFromClassName(className)}
      className={className}
    />
  );
}
