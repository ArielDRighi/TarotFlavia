'use client';

import { cn } from '@/lib/utils';
import type { PendulumQueryResponse } from '@/types/pendulum.types';
import { PENDULUM_RESPONSE_CONFIG } from '@/types/pendulum.types';
import { Card } from '@/components/ui/card';
import { Moon } from 'lucide-react';

interface PendulumResponseDisplayProps {
  response: PendulumQueryResponse;
  className?: string;
}

export function PendulumResponseDisplay({ response, className }: PendulumResponseDisplayProps) {
  const config = PENDULUM_RESPONSE_CONFIG[response.response];

  return (
    <Card className={cn('space-y-4 p-6 text-center', className)}>
      {/* Respuesta principal */}
      <div className={cn('font-serif text-5xl', config.color)}>{response.responseText}</div>

      {/* Interpretación */}
      <p className="text-muted-foreground text-lg italic">&ldquo;{response.interpretation}&rdquo;</p>

      {/* Fase lunar */}
      <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
        <Moon className="h-4 w-4" />
        <span>{response.lunarPhaseName}</span>
      </div>
    </Card>
  );
}
