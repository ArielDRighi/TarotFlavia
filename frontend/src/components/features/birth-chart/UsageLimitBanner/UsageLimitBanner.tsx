'use client';

import Link from 'next/link';
import { Sparkles, Crown, AlertTriangle, Check, Clock, ArrowRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import type { UsageStatus } from '@/types/birth-chart-api.types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UsageLimitBannerProps {
  usage: UsageStatus;
  onDismiss?: () => void;
  showDismiss?: boolean;
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

export function UsageLimitBanner({
  usage,
  onDismiss,
  showDismiss = false,
  variant = 'full',
  className,
}: UsageLimitBannerProps) {
  const percentage = Math.round((usage.used / usage.limit) * 100);
  const isLow = usage.remaining <= 1;
  const isExhausted = !usage.canGenerate;

  // Texto de reset
  const resetText = usage.resetsAt
    ? formatDistanceToNow(new Date(usage.resetsAt), {
        addSuffix: true,
        locale: es,
      })
    : null;

  // Variante inline (muy compacta, para header)
  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1 text-sm',
                isExhausted && 'bg-destructive/10 text-destructive',
                isLow && !isExhausted && 'bg-amber-500/10 text-amber-600',
                !isLow && !isExhausted && 'bg-muted',
                className
              )}
            >
              <Sparkles className="h-3 w-3" />
              <span>
                {usage.remaining}/{usage.limit}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isExhausted ? 'Sin cartas disponibles' : `${usage.remaining} cartas restantes`}</p>
            {resetText && <p className="text-muted-foreground text-xs">Se reinicia {resetText}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Variante compact (para sidebar o cards pequeñas)
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'rounded-lg border p-3',
          isExhausted && 'bg-destructive/5 border-destructive/30',
          isLow && !isExhausted && 'border-amber-500/30 bg-amber-500/5',
          !isLow && !isExhausted && 'bg-muted/50 border-border',
          className
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Uso de cartas</span>
          <Badge variant={isExhausted ? 'destructive' : 'secondary'}>
            {usage.used}/{usage.limit}
          </Badge>
        </div>
        <Progress
          value={percentage}
          className={cn(
            'h-1.5',
            isExhausted && '[&>div]:bg-destructive',
            isLow && !isExhausted && '[&>div]:bg-amber-500'
          )}
        />
        {resetText && (
          <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            Reinicio {resetText}
          </p>
        )}
      </div>
    );
  }

  // Variante full (banner completo)
  return (
    <div
      className={cn(
        'relative rounded-lg border p-4',
        isExhausted && 'bg-destructive/5 border-destructive/30',
        isLow && !isExhausted && 'border-amber-500/30 bg-amber-500/5',
        !isLow && !isExhausted && 'bg-primary/5 border-primary/30',
        className
      )}
    >
      {/* Botón cerrar */}
      {showDismiss && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground absolute top-2 right-2"
          aria-label="Cerrar banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Ícono */}
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
            isExhausted && 'bg-destructive/10',
            isLow && !isExhausted && 'bg-amber-500/10',
            !isLow && !isExhausted && 'bg-primary/10'
          )}
        >
          {isExhausted ? (
            <AlertTriangle className="text-destructive h-6 w-6" />
          ) : isLow ? (
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          ) : (
            <Sparkles className="text-primary h-6 w-6" />
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="font-semibold">
              {isExhausted
                ? 'Límite alcanzado'
                : isLow
                  ? '¡Última carta disponible!'
                  : 'Uso de cartas astrales'}
            </h4>
            <Badge variant="outline" className="capitalize">
              {usage.plan}
            </Badge>
          </div>

          <div className="mb-2 flex items-center gap-4">
            <Progress
              value={percentage}
              className={cn(
                'h-2 flex-1',
                isExhausted && '[&>div]:bg-destructive',
                isLow && !isExhausted && '[&>div]:bg-amber-500'
              )}
            />
            <span className="font-mono text-sm">
              {usage.used}/{usage.limit}
            </span>
          </div>

          <p className="text-muted-foreground text-sm">
            {isExhausted ? (
              <>
                Has utilizado todas tus cartas este período.
                {resetText && ` Se reinicia ${resetText}.`}
              </>
            ) : isLow ? (
              <>
                Te queda solo {usage.remaining} carta.
                {usage.plan === 'free' && ' Actualiza a Premium para obtener más.'}
              </>
            ) : (
              <>
                Te quedan {usage.remaining} cartas de {usage.limit}.
                {resetText && ` El límite se reinicia ${resetText}.`}
              </>
            )}
          </p>
        </div>

        {/* CTA */}
        {(isExhausted || isLow) && usage.plan !== 'premium' && (
          <Button
            asChild
            className={cn(
              'flex-shrink-0',
              'bg-gradient-to-r from-amber-500 to-orange-500',
              'hover:from-amber-600 hover:to-orange-600'
            )}
          >
            <Link href="/premium">
              <Crown className="mr-2 h-4 w-4" />
              Obtener más
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}

        {!isExhausted && !isLow && (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="h-5 w-5" />
            <span className="text-sm font-medium">Disponible</span>
          </div>
        )}
      </div>
    </div>
  );
}
