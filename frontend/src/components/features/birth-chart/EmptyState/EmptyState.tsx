'use client';

import Link from 'next/link';
import { Star, Crown, Sparkles, Search, FileX, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateType =
  | 'no-charts'
  | 'no-results'
  | 'premium-required'
  | 'limit-reached'
  | 'not-found';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  className?: string;
}

const EMPTY_STATE_CONFIG: Record<
  EmptyStateType,
  {
    icon: typeof Star;
    defaultTitle: string;
    defaultDescription: string;
    iconColor: string;
  }
> = {
  'no-charts': {
    icon: Star,
    defaultTitle: 'Aún no tienes cartas',
    defaultDescription: 'Genera tu primera carta astral y descubre los secretos de tu cielo natal.',
    iconColor: 'text-primary',
  },
  'no-results': {
    icon: Search,
    defaultTitle: 'Sin resultados',
    defaultDescription: 'No encontramos cartas que coincidan con tu búsqueda.',
    iconColor: 'text-muted-foreground',
  },
  'premium-required': {
    icon: Crown,
    defaultTitle: 'Contenido Premium',
    defaultDescription: 'Esta función está disponible exclusivamente para usuarios Premium.',
    iconColor: 'text-amber-500',
  },
  'limit-reached': {
    icon: Sparkles,
    defaultTitle: 'Límite alcanzado',
    defaultDescription: 'Has utilizado todas tus cartas disponibles este período.',
    iconColor: 'text-orange-500',
  },
  'not-found': {
    icon: FileX,
    defaultTitle: 'No encontrado',
    defaultDescription: 'El recurso que buscas no existe o no tienes acceso.',
    iconColor: 'text-muted-foreground',
  },
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  className,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      data-testid="empty-state-container"
      className={cn('flex flex-col items-center justify-center px-4 py-16 text-center', className)}
    >
      {/* Ícono */}
      <div
        data-testid="empty-state-icon-container"
        className={cn('mb-6 flex h-20 w-20 items-center justify-center rounded-full', 'bg-muted')}
      >
        <Icon className={cn('h-10 w-10', config.iconColor)} />
      </div>

      {/* Título */}
      <h3 className="mb-2 text-xl font-semibold">{title || config.defaultTitle}</h3>

      {/* Descripción */}
      <p className="text-muted-foreground mb-8 max-w-md">
        {description || config.defaultDescription}
      </p>

      {/* Acciones */}
      {(actionHref || onAction || (secondaryActionLabel && secondaryActionHref)) && (
        <div data-testid="empty-state-actions" className="flex flex-col gap-3 sm:flex-row">
          {(actionHref || onAction) && (
            <Button
              onClick={onAction}
              asChild={!!actionHref}
              className={cn(
                type === 'premium-required' &&
                  'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              )}
            >
              {actionHref ? (
                <Link href={actionHref}>
                  {type === 'no-charts' && (
                    <Plus data-testid="empty-state-action-plus-icon" className="mr-2 h-4 w-4" />
                  )}
                  {type === 'premium-required' && (
                    <Crown data-testid="empty-state-action-crown-icon" className="mr-2 h-4 w-4" />
                  )}
                  {actionLabel || 'Comenzar'}
                  <ArrowRight
                    data-testid="empty-state-action-arrow-icon"
                    className="ml-2 h-4 w-4"
                  />
                </Link>
              ) : (
                <>
                  {type === 'no-charts' && (
                    <Plus data-testid="empty-state-action-plus-icon" className="mr-2 h-4 w-4" />
                  )}
                  {type === 'premium-required' && (
                    <Crown data-testid="empty-state-action-crown-icon" className="mr-2 h-4 w-4" />
                  )}
                  {actionLabel || 'Comenzar'}
                  <ArrowRight
                    data-testid="empty-state-action-arrow-icon"
                    className="ml-2 h-4 w-4"
                  />
                </>
              )}
            </Button>
          )}

          {secondaryActionLabel && secondaryActionHref && (
            <Button variant="outline" asChild>
              <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Variante inline más compacta
 */
export function EmptyStateInline({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      data-testid="empty-state-inline-container"
      className="text-muted-foreground flex items-center justify-center gap-4 py-8 text-sm"
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <Button variant="link" size="sm" onClick={onAction} className="h-auto p-0">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
