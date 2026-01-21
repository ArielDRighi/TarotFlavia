'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NUMEROLOGY_NUMBERS_INFO } from '@/lib/utils/numerology';
import { cn } from '@/lib/utils';
import type { NumberDetailDto } from '@/types/numerology.types';

type NumberContext = 'lifePath' | 'expression' | 'soulUrge' | 'personality' | 'birthday';

const CONTEXT_LABELS: Record<NumberContext, string> = {
  lifePath: 'Camino de Vida',
  expression: 'Expresión/Destino',
  soulUrge: 'Número del Alma',
  personality: 'Número de Personalidad',
  birthday: 'Número de Cumpleaños',
};

interface Props {
  number: NumberDetailDto;
  context?: NumberContext;
  variant?: 'compact' | 'full';
  onClick?: () => void;
  className?: string;
}

export function NumberCard({ number, context, variant = 'compact', onClick, className }: Props) {
  const info = NUMEROLOGY_NUMBERS_INFO[number.value] || {
    emoji: '🔢',
    color: 'text-gray-500',
    name: 'Número',
  };

  const isInteractive = !!onClick;

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isInteractive && 'cursor-pointer hover:scale-105 hover:shadow-lg',
        className
      )}
      onClick={onClick}
      data-testid={`number-card-${number.value}`}
    >
      <CardContent className="p-4">
        {/* Header: Context Label (opcional) */}
        {context && (
          <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
            {CONTEXT_LABELS[context]}
          </div>
        )}

        {/* Number Display */}
        <div className="mb-2 flex items-center gap-3">
          <div className="text-4xl" data-testid="number-emoji">
            {info.emoji}
          </div>
          <div>
            <div className={cn('text-3xl font-bold', info.color)}>{number.value}</div>
            <div className="text-sm font-semibold text-gray-700">{number.name}</div>
          </div>
        </div>

        {/* Master Number Badge */}
        {number.isMaster && (
          <Badge variant="secondary" className="mb-2">
            ⭐ Número Maestro
          </Badge>
        )}

        {/* Full Variant: Keywords + Description */}
        {variant === 'full' && (
          <>
            {number.keywords && number.keywords.length > 0 && (
              <div className="mb-1 text-sm font-medium text-purple-600">
                {number.keywords.join(', ')}
              </div>
            )}
            {number.description && (
              <p className="text-sm leading-relaxed text-gray-600">{number.description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
