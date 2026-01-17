'use client';

import * as React from 'react';

import { ZodiacSignCard } from './ZodiacSignCard';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { cn } from '@/lib/utils';
import type { ZodiacSign } from '@/types/horoscope.types';

/**
 * ZodiacSignSelector Component Props
 */
export interface ZodiacSignSelectorProps {
  /** Currently selected zodiac sign */
  selectedSign?: ZodiacSign | null;
  /** User's zodiac sign (to highlight) */
  userSign?: ZodiacSign | null;
  /** Callback when a sign is selected */
  onSelect: (sign: ZodiacSign) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ZodiacSignSelector Component
 *
 * Grid selector displaying all 12 zodiac signs.
 * Used on horoscope pages to allow users to browse different signs.
 *
 * Features:
 * - Displays all 12 zodiac signs in a responsive grid
 * - Highlights selected sign with ring
 * - Highlights user's sign with accent border
 * - Responsive layout (3 cols mobile, 4 cols tablet, 6 cols desktop)
 * - Passes click events to parent component
 *
 * @example
 * ```tsx
 * <ZodiacSignSelector
 *   selectedSign={selectedSign}
 *   userSign={userSign}
 *   onSelect={(sign) => router.push(`/horoscopo/${sign}`)}
 * />
 * ```
 */
export function ZodiacSignSelector({
  selectedSign,
  userSign,
  onSelect,
  className,
}: ZodiacSignSelectorProps) {
  const signs = React.useMemo(() => Object.values(ZODIAC_SIGNS_INFO), []);

  return (
    <div
      data-testid="zodiac-selector"
      className={cn('grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6', className)}
    >
      {signs.map((signInfo) => (
        <ZodiacSignCard
          key={signInfo.sign}
          signInfo={signInfo}
          isSelected={selectedSign === signInfo.sign}
          isUserSign={userSign === signInfo.sign}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
