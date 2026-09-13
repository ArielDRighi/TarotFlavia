import { CalendarDays, Hash } from 'lucide-react';

import { BrandIcon, type BrandIconSize } from '@/components/ui/brand-icon';
import { NUMEROLOGY_NUMBERS_INFO } from '@/lib/utils/numerology';

const FALLBACK_ICON = { number: Hash, cycle: CalendarDays } as const;

const FALLBACK_CLASS: Record<BrandIconSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
  xl: 'h-14 w-14',
  '2xl': 'h-20 w-20',
};

export interface NumerologyNumberIconProps {
  /** Número numerológico (1–9, 11, 22, 33). Sin arquetipo conocido, cae al icono de lucide. */
  number: number;
  size?: BrandIconSize;
  /** Qué fallback usar: `number` (numeral) o `cycle` (calendario, para año/mes personal). */
  fallback?: keyof typeof FALLBACK_ICON;
  'data-testid'?: string;
}

/**
 * Icono del arquetipo de un número (T-UI-12): asset de `numerology/` en medallón
 * o, si el número no tiene arquetipo en `NUMEROLOGY_NUMBERS_INFO`, un icono de
 * lucide. Decorativo: el número y su nombre van siempre al lado.
 */
export function NumerologyNumberIcon({
  number,
  size = 'md',
  fallback = 'number',
  'data-testid': testId,
}: NumerologyNumberIconProps) {
  const icon = NUMEROLOGY_NUMBERS_INFO[number]?.icon;
  if (icon) {
    return (
      <BrandIcon
        family="numerology"
        name={icon}
        size={size}
        frame="medallion"
        decorative
        data-testid={testId}
      />
    );
  }
  const Fallback = FALLBACK_ICON[fallback];
  return (
    <Fallback
      className={`text-muted-foreground ${FALLBACK_CLASS[size]}`}
      aria-hidden="true"
      data-testid={testId}
    />
  );
}
