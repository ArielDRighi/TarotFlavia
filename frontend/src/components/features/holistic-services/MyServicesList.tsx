/**
 * MyServicesList Component
 *
 * Authenticated page listing the user's holistic service purchases.
 * Shows purchase cards with complete appointment information:
 * - Nombre del servicio, duración, precio en ARS
 * - Estado visual: Pendiente (amber), Confirmado (green), Completado (grey), Cancelado (red)
 * - Turno confirmado: fecha, hora, link WhatsApp
 * - Pendiente de pago: link para reintentar el pago en MP
 * - Estado vacío: mensaje + link al catálogo
 */
'use client';

import Link from 'next/link';
import { CalendarDays, Clock, MessageCircle, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMyPurchases } from '@/hooks/api/useHolisticServices';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { parseDateString } from '@/lib/utils/date';
import { deriveDisplayStatus } from '@/lib/utils/holistic-services';
import type { DisplayStatus } from '@/lib/utils/holistic-services';
import type { ServicePurchase } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  completed: 'Completado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-gray-100 text-gray-600 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  refunded: 'bg-rose-100 text-rose-800 border-rose-300',
};

// ============================================================================
// Helpers
// ============================================================================

function formatArs(amount: number): string {
  return amount.toLocaleString('es-AR');
}

function formatAppointmentDate(dateStr: string): string {
  return parseDateString(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ============================================================================
// Sub-components
// ============================================================================

interface StatusBadgeProps {
  displayStatus: DisplayStatus;
  purchaseId: number;
}

function StatusBadge({ displayStatus, purchaseId }: StatusBadgeProps) {
  const label = STATUS_LABEL[displayStatus] ?? displayStatus;
  const colorClass = STATUS_COLOR[displayStatus] ?? 'bg-gray-100 text-gray-600 border-gray-300';

  return (
    <span
      data-testid={`purchase-status-badge-${purchaseId}`}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorClass
      )}
    >
      {label}
    </span>
  );
}

interface PurchaseCardProps {
  purchase: ServicePurchase;
}

function PurchaseCard({ purchase }: PurchaseCardProps) {
  const serviceName = purchase.holisticService?.name ?? 'Servicio';
  const durationMinutes = purchase.holisticService?.durationMinutes ?? null;
  const displayStatus = deriveDisplayStatus(purchase);
  const hasAppointment = Boolean(purchase.selectedDate && purchase.selectedTime);
  const showWhatsApp =
    (displayStatus === 'confirmed' || displayStatus === 'completed') && purchase.whatsappNumber;
  const showRetryPayment = displayStatus === 'pending' && purchase.initPoint;

  return (
    <div
      data-testid={`purchase-card-${purchase.id}`}
      className="space-y-3 rounded-xl border bg-white p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-medium">{serviceName}</h3>
        <StatusBadge displayStatus={displayStatus} purchaseId={purchase.id} />
      </div>

      {/* Service details */}
      <div className="text-text-secondary flex flex-wrap gap-4 text-sm">
        <span>
          ${formatArs(purchase.amountArs)} <span className="text-xs">ARS</span>
        </span>
        {durationMinutes !== null && (
          <span
            data-testid={`purchase-duration-${purchase.id}`}
            className="flex items-center gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            {durationMinutes} min
          </span>
        )}
      </div>

      {/* Appointment info (confirmed / completed) */}
      {hasAppointment && (
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex flex-wrap gap-4">
            <span
              data-testid={`purchase-appointment-date-${purchase.id}`}
              className="flex items-center gap-1.5 font-medium"
            >
              <CalendarDays className="h-4 w-4 text-purple-600" />
              {formatAppointmentDate(purchase.selectedDate as string)}
            </span>
            <span
              data-testid={`purchase-appointment-time-${purchase.id}`}
              className="flex items-center gap-1.5 font-medium"
            >
              <Clock className="h-4 w-4 text-purple-600" />
              {purchase.selectedTime}
            </span>
          </div>
        </div>
      )}

      {/* WhatsApp link (confirmed / completed) */}
      {showWhatsApp && (
        <a
          href={`https://wa.me/${(purchase.whatsappNumber as string).replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
          data-testid={`whatsapp-link-${purchase.id}`}
        >
          <MessageCircle className="h-4 w-4" />
          Contactar por WhatsApp
        </a>
      )}

      {/* Retry payment (pending) */}
      {showRetryPayment && (
        <a
          href={purchase.initPoint as string}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-amber-400 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100"
          data-testid={`retry-payment-link-${purchase.id}`}
        >
          <CreditCard className="h-4 w-4" />
          Completar pago en Mercado Pago
        </a>
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
