'use client';

import { cn } from '@/lib/utils';
import type { PendulumMovement } from '@/types/pendulum.types';

interface PendulumProps {
  movement: PendulumMovement | 'idle' | 'searching';
  isGlowing?: boolean;
  className?: string;
}

export function Pendulum({ movement, isGlowing = false, className }: PendulumProps) {
  const getAnimationClass = () => {
    switch (movement) {
      case 'idle':
        return 'animate-pendulum-idle';
      case 'searching':
        return 'animate-pendulum-search';
      case 'vertical':
        return 'animate-pendulum-vertical';
      case 'horizontal':
        return 'animate-pendulum-horizontal';
      case 'circular':
        return 'animate-pendulum-circular';
      default:
        return 'animate-pendulum-idle';
    }
  };

  return (
    <div
      className={cn('relative flex h-[250px] w-full justify-center', className)}
      data-testid="pendulum"
    >
      {/* Soporte */}
      <div className="absolute top-0 h-3 w-16 rounded-b-lg bg-gradient-to-b from-zinc-600 to-zinc-700 shadow-md" />

      {/* Cadena + Péndulo */}
      <div
        className={cn('absolute top-3 origin-top', getAnimationClass())}
        data-testid="pendulum-animated"
      >
        {/* Cadena */}
        <div className="mx-auto h-32 w-0.5 bg-gradient-to-b from-zinc-400 to-zinc-500" />

        {/* Cristal de cuarzo */}
        <div
          className={cn(
            'mx-auto -mt-1 h-12 w-8',
            'bg-gradient-to-b from-white/90 via-purple-100/80 to-purple-200/70',
            'rounded-b-full shadow-lg',
            'border border-white/50',
            isGlowing && 'animate-pulse shadow-xl shadow-purple-400/50'
          )}
          style={{
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 30%, 50% 100%, 0% 30%)',
          }}
          data-testid="pendulum-crystal"
        />
      </div>
    </div>
  );
}
