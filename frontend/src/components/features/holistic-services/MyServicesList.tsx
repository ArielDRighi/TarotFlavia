/**
 * MyServicesList Component
 *
 * Authenticated page listing the user's holistic service purchases.
 * Shows purchase cards with status badges, price, and action buttons.
 * - pending: amber badge
 * - paid (no session): green badge + "Reservar Turno" button
 * - paid (with session): green badge + WhatsApp link
 * - cancelled: red badge
 * Empty state: message + link to catalog.
 */
'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMyPurchases } from '@/hooks/api/useHolisticServices';
import { useSessionDetail } from '@/hooks/api/useSessions';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { ServicePurchase, PurchaseStatus } from '@/types';

// ============================================================================
// Helpers
// ============================================================================

function formatArs(amount: number): string {
  return amount.toLocaleString('es-AR');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ============================================================================
// Sub-components
// ============================================================================

interface StatusBadgeProps {
  status: PurchaseStatus;
  purchaseId: number;
}

function StatusBadge({ status, purchaseId }: StatusBadgeProps) {
  const label: Record<PurchaseStatus, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };

  const colorClass: Record<PurchaseStatus, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    paid: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    refunded: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <span
      data-testid={`purchase-status-badge-${purchaseId}`}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorClass[status]
      )}
    >
      {label[status]}
    </span>
  );
}

interface PurchaseCardProps {
  purchase: ServicePurchase;
}

interface SessionInfoProps {
  sessionId: number;
  whatsappNumber?: string;
  purchaseId: number;
}

function SessionInfo({ sessionId, whatsappNumber, purchaseId }: SessionInfoProps) {
  const { data: session } = useSessionDetail(sessionId);

  return (
    <div data-testid={`session-info-${purchaseId}`} className="space-y-1">
      {session && (
        <div className="text-text-secondary flex flex-wrap gap-4 text-sm">
          <span data-testid={`session-date-${purchaseId}`}>
            Fecha:{' '}
            {new Date(session.sessionDate + 'T' + session.sessionTime).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
          <span data-testid={`session-time-${purchaseId}`}>Hora: {session.sessionTime}</span>
        </div>
      )}

      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
          data-testid={`whatsapp-link-${purchaseId}`}
        >
          Contactar por WhatsApp
        </a>
      )}
    </div>
  );
}

function PurchaseCard({ purchase }: PurchaseCardProps) {
  const serviceName = purchase.holisticService?.name ?? 'Servicio';
  const isPaid = purchase.paymentStatus === 'paid';
  const hasSession = purchase.sessionId !== null;

  return (
    <div
      data-testid={`purchase-card-${purchase.id}`}
      className="space-y-3 rounded-xl border bg-white p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-medium">{serviceName}</h3>
        <StatusBadge status={purchase.paymentStatus} purchaseId={purchase.id} />
      </div>

      {/* Details */}
      <div className="text-text-secondary flex flex-wrap gap-4 text-sm">
        <span>
          ${formatArs(purchase.amountArs)} <span className="text-xs">ARS</span>
        </span>
        <span>Compra: {formatDate(purchase.createdAt)}</span>
      </div>

      {/* Actions */}
      {isPaid && !hasSession && (
        <Button asChild size="sm" className="mt-1">
          <Link href={ROUTES.SERVICIO_RESERVAR(purchase.id)}>Reservar Turno</Link>
        </Button>
      )}

      {isPaid && hasSession && (
        <SessionInfo
          sessionId={purchase.sessionId as number}
          whatsappNumber={purchase.whatsappNumber}
          purchaseId={purchase.id}
        />
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MyServicesList() {
  const { data: purchases, isLoading } = useMyPurchases();

  // ---- Skeleton ----
  if (isLoading) {
    return (
      <div className="bg-bg-main min-h-screen px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="mb-6 h-10 w-48" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              data-testid="purchase-card-skeleton"
              className="space-y-3 rounded-xl border p-5"
            >
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Empty state ----
  if (!purchases || purchases.length === 0) {
    return (
      <div
        data-testid="my-services-empty"
        className="bg-bg-main flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center"
      >
        <h2 className="mb-3 font-serif text-2xl font-semibold">No tenés servicios contratados</h2>
        <p className="text-text-secondary mb-6 text-base">
          Explorá nuestro catálogo de servicios holísticos.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.SERVICIOS}>Ver servicios</Link>
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="my-services-list" className="bg-bg-main min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="mb-6 font-serif text-3xl font-semibold">Mis Servicios</h1>

        {purchases.map((purchase) => (
          <PurchaseCard key={purchase.id} purchase={purchase} />
        ))}
      </div>
    </div>
  );
}
