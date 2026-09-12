'use client';

import { cn } from '@/lib/utils';
import type { PendulumMovement } from '@/types/pendulum.types';

const CRYSTAL_CLIP_PATH = 'polygon(20% 0%, 80% 0%, 100% 30%, 50% 100%, 0% 30%)';
// Sombra violeta (accent-foreground #553c9a) para que el cristal despegue del fondo blanco
const CRYSTAL_DROP_SHADOW = 'drop-shadow-[0_6px_6px_rgba(85,60,154,0.45)]';

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

        {/* Engarce metálico entre la cadena y el cristal */}
        <div
          className="mx-auto h-1.5 w-5 rounded-sm bg-gradient-to-b from-zinc-400 to-zinc-600"
          data-testid="pendulum-crystal-cap"
        />

        {/* Cristal de amatista */}
        <div
          className={cn('relative mx-auto w-10', isGlowing && 'animate-pulse')}
          data-testid="pendulum-crystal"
        >
          {/* Halo: hermano del cuerpo, no hijo, para que la sombra proyectada no lo alcance */}
          {isGlowing && (
            <div
              className="absolute -inset-3 rounded-full bg-purple-400/50 blur-md"
              aria-hidden="true"
              data-testid="pendulum-crystal-halo"
            />
          )}

          {/*
            La sombra va en el cuerpo, no en la faceta: un `box-shadow` sobre el
            elemento recortado con clip-path quedaría cortado, mientras que
            `drop-shadow` en el padre sigue la silueta del cristal.
          */}
          <div className={cn('relative', CRYSTAL_DROP_SHADOW)} data-testid="pendulum-crystal-body">
            <div
              className="relative h-14 w-10 bg-gradient-to-b from-violet-400 via-purple-600 to-purple-900"
              style={{ clipPath: CRYSTAL_CLIP_PATH }}
              data-testid="pendulum-crystal-facet"
            >
              {/* Brillo de la cara iluminada */}
              <div className="absolute top-2 left-2.5 h-7 w-1.5 rounded-full bg-white/45" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
