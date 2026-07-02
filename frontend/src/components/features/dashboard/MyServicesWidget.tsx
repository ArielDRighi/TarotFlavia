'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { HandHeart, ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RevealWidget } from './RevealWidget';
import { WidgetCard } from './WidgetCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useMyPurchases } from '@/hooks/api/useHolisticServices';
import { ROUTES } from '@/lib/constants/routes';
import { cn, formatDateShort } from '@/lib/utils';
import { deriveDisplayStatus } from '@/lib/utils/holistic-services';
import type { ServicePurchase } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Confirmado', className: 'bg-green-100 text-green-800' },
  completed: { label: 'Completado', className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', className: 'bg-rose-100 text-rose-800' },
  expired: { label: 'Vencido', className: 'bg-red-50 text-red-700' },
};

const MAX_VISIBLE_PURCHASES = 3;

// ============================================================================
// Sub-components
// ============================================================================

interface PurchaseItemProps {
  purchase: ServicePurchase;
}

function PurchaseItem({ purchase }: PurchaseItemProps) {
  const serviceName = purchase.holisticService?.name ?? 'Servicio';
  const displayStatus = deriveDisplayStatus(purchase);
  const config = STATUS_CONFIG[displayStatus] ?? STATUS_CONFIG['pending'];
  const hasAppointment = Boolean(purchase.selectedDate && purchase.selectedTime);

  return (
    <div
      data-testid={`widget-purchase-${purchase.id}`}
      className="bg-card flex items-center justify-between gap-3 rounded-lg border p-3"
    >
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">{serviceName}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              config.className
            )}
          >
            {config.label}
          </span>
          {hasAppointment && (
            <>
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <CalendarDays className="h-3 w-3" />
                {formatDateShort(purchase.selectedDate as string)}
              </span>
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {purchase.selectedTime}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface MyServicesWidgetProps {
  /**
   * Posición en el grid del dashboard; define el retardo del reveal escalonado
   * (T-DASH-006). Por defecto `0` para uso aislado.
   */
  index?: number;
}

/**
 * MyServicesWidget Component
 *
 * Dashboard widget showing the user's recent holistic service purchases.
 * Displays up to 3 purchases with status badges and a link to see all.
 * Hidden when the user has no purchases.
 *
 * Se auto-oculta (`return null`) cuando no hay compras. Por eso envuelve su propia
 * salida no-nula en `RevealWidget` (en lugar de que lo haga el padre): así el `null`
 * sigue liberando la celda del grid sin dejar una celda "fantasma" vacía (T-DASH-001).
 */
export function MyServicesWidget({ index = 0 }: MyServicesWidgetProps) {
  const { data: purchases, isLoading, isError, refetch } = useMyPurchases();

  let content: ReactNode;

  if (isLoading) {
    content = (
      <Card className="p-6" data-testid="my-services-widget-loading">
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="mb-2 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
    );
  } else if (isError) {
    content = (
      <Card data-testid="my-services-widget-error">
        <ErrorDisplay
          message="No se pudieron cargar tus servicios."
          onRetry={() => void refetch()}
        />
      </Card>
    );
  } else if (!purchases || purchases.length === 0) {
    return null;
  } else {
    const visiblePurchases = purchases.slice(0, MAX_VISIBLE_PURCHASES);
    const remainingCount = purchases.length - MAX_VISIBLE_PURCHASES;

    content = (
      <WidgetCard
        title="Mis Servicios"
        titleAs="h3"
        icon={<HandHeart className="h-5 w-5" />}
        data-testid="my-services-widget"
      >
        {/* Purchase list */}
        <div className="space-y-2">
          {visiblePurchases.map((purchase) => (
            <PurchaseItem key={purchase.id} purchase={purchase} />
          ))}
        </div>

        {/* Footer link */}
        <Link
          href={ROUTES.MIS_SERVICIOS}
          className="text-primary hover:text-primary/80 mt-4 flex items-center justify-center gap-1 text-sm font-medium"
          data-testid="widget-view-all-link"
        >
          {remainingCount > 0 ? `Ver todos (${purchases.length})` : 'Ver todos mis servicios'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </WidgetCard>
    );
  }

  return <RevealWidget index={index}>{content}</RevealWidget>;
}
