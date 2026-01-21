'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNumerologyMeanings } from '@/hooks/api/useNumerology';
import { NUMEROLOGY_NUMBERS_INFO } from '@/lib/utils/numerology';
import { cn } from '@/lib/utils';

const GALLERY_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

interface Props {
  onNumberClick?: (number: number) => void;
  className?: string;
}

export function NumberGallery({ onNumberClick, className }: Props) {
  const { data: meanings, isLoading } = useNumerologyMeanings();

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn('grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6', className)}
        data-testid="number-gallery-loading"
      >
        {GALLERY_NUMBERS.map((num) => (
          <Skeleton key={num} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  // Create a map for quick lookup
  const meaningsMap = meanings ? new Map(meanings.map((m) => [m.number, m])) : new Map();

  return (
    <div
      className={cn('grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6', className)}
      data-testid="number-gallery"
    >
      {GALLERY_NUMBERS.map((num) => {
        const meaning = meaningsMap.get(num);
        const info = NUMEROLOGY_NUMBERS_INFO[num];
        const isMaster = [11, 22, 33].includes(num);
        const isInteractive = !!onNumberClick;

        return (
          <Card
            key={num}
            className={cn(
              'transition-all duration-200',
              isInteractive &&
                'cursor-pointer hover:scale-105 hover:border-purple-400 hover:shadow-lg'
            )}
            onClick={() => onNumberClick?.(num)}
            data-testid={`gallery-number-${num}`}
          >
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              {/* Emoji */}
              <div className="text-3xl" data-testid={`gallery-emoji-${num}`}>
                {info?.emoji || '🔢'}
              </div>

              {/* Number */}
              <div className={cn('text-2xl font-bold', info?.color || 'text-gray-700')}>{num}</div>

              {/* Name */}
              {meaning && <div className="text-xs font-medium text-gray-600">{meaning.name}</div>}

              {/* Master Badge */}
              {isMaster && (
                <div className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">
                  Maestro
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
