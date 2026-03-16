'use client';

import Link from 'next/link';
import { HandHeart, ArrowRight, CalendarCheck, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyPurchases } from '@/hooks/api/useHolisticServices';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { ServicePurchase, PurchaseStatus } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG: Record<PurchaseStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  paid: { label: 'Pagado', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', className: 'bg-rose-100 text-rose-800' },
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
  const config = STATUS_CONFIG[purchase.paymentStatus];
  const isPaidNoSession = purchase.paymentStatus === 'paid' && purchase.sessionId === null;

  return (
    <div
      data-testid={`widget-purchase-${purchase.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{serviceName}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              config.className
            )}
          >
            {config.label}
          </span>
          {isPaidNoSession && (
            <Link
              href={ROUTES.SERVICIO_RESERVAR(purchase.id)}
              className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800"
              data-testid={`widget-book-${purchase.id}`}
            >
              <CalendarCheck className="h-3 w-3" />
              Reservar turno
            </Link>
          )}
        </div>
      </div>
      <Clock className="h-4 w-4 shrink-0 text-gray-400" />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * MyServicesWidget Component
 *
 * Dashboard widget showing the user's recent holistic service purchases.
 * Displays up to 3 purchases with status badges and a link to see all.
 * Hidden when the user has no purchases.
 */
export function MyServicesWidget() {
  const { data: purchases, isLoading, isError, refetch } = useMyPurchases();

  if (isLoading) {
    return (
      <Card className="p-6" data-testid="my-services-widget-loading">
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="mb-2 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6" data-testid="my-services-widget-error">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>No se pudieron cargar tus servicios.</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-red-600 hover:text-red-800"
            onClick={() => void refetch()}
          >
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  if (!purchases || purchases.length === 0) {
    return null;
  }

  const visiblePurchases = purchases.slice(0, MAX_VISIBLE_PURCHASES);
  const remainingCount = purchases.length - MAX_VISIBLE_PURCHASES;

  return (
    <Card className="p-6" data-testid="my-services-widget">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <HandHeart className="h-5 w-5 text-purple-600" />
        <h3 className="font-serif text-lg font-semibold text-gray-900">Mis Servicios</h3>
      </div>

      {/* Purchase list */}
      <div className="space-y-2">
        {visiblePurchases.map((purchase) => (
          <PurchaseItem key={purchase.id} purchase={purchase} />
        ))}
      </div>

      {/* Footer link */}
      <Link
        href={ROUTES.MIS_SERVICIOS}
        className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800"
        data-testid="widget-view-all-link"
      >
        {remainingCount > 0 ? `Ver todos (${purchases.length})` : 'Ver todos mis servicios'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
