/**
 * MyServicesList Component
 *
 * Authenticated page listing the user's holistic service purchases.
 * Shows purchase cards with complete appointment information:
 * - Nombre del servicio, duración, precio en ARS
 * - Estado visual: Pendiente (amber), Confirmado (green), Completado (grey), Cancelado (red), Vencido (red)
 * - Turno confirmado: fecha, hora, link WhatsApp
 * - Pendiente de pago: link para reintentar el pago en MP
 * - Estado vacío: mensaje + link al catálogo
 * - Filtros: Todos | Vigentes | Vencidos | Pagados (T-BUG-003-C)
 * - Acción "Eliminar" para compras expired/cancelled (T-BUG-003-C)
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, MessageCircle, CreditCard, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMyPurchases, useCancelPurchase } from '@/hooks/api/useHolisticServices';
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
  expired: 'Vencido',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-gray-100 text-gray-600 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  refunded: 'bg-rose-100 text-rose-800 border-rose-300',
  expired: 'bg-red-50 text-red-700 border-red-200',
};

type FilterTab = 'all' | 'active' | 'expired' | 'paid';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Vigentes' },
  { key: 'expired', label: 'Vencidos' },
  { key: 'paid', label: 'Pagados' },
];

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

function filterPurchases(purchases: ServicePurchase[], tab: FilterTab): ServicePurchase[] {
  if (tab === 'all') return purchases;
  return purchases.filter((p) => {
    const status = deriveDisplayStatus(p);
    if (tab === 'active') return status === 'pending';
    if (tab === 'expired') return status === 'expired' || status === 'cancelled';
    if (tab === 'paid') return status === 'confirmed' || status === 'completed';
    return true;
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
  onDelete: (id: number) => void;
}

function PurchaseCard({ purchase, onDelete }: PurchaseCardProps) {
  const serviceName = purchase.holisticService?.name ?? 'Servicio';
  const durationMinutes = purchase.holisticService?.durationMinutes ?? null;
  const displayStatus = deriveDisplayStatus(purchase);
  const hasAppointment = Boolean(purchase.selectedDate && purchase.selectedTime);
  const showWhatsApp =
    (displayStatus === 'confirmed' || displayStatus === 'completed') && purchase.whatsappNumber;
  const showRetryPayment = displayStatus === 'pending' && purchase.initPoint;
  const showDelete = displayStatus === 'expired';

  return (
    <div
      data-testid={`purchase-card-${purchase.id}`}
      className="space-y-3 rounded-xl border bg-white p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-medium">{serviceName}</h3>
        <div className="flex items-center gap-2">
          <StatusBadge displayStatus={displayStatus} purchaseId={purchase.id} />
          {showDelete && (
            <button
              data-testid={`delete-purchase-btn-${purchase.id}`}
              onClick={() => onDelete(purchase.id)}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Eliminar compra"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
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
          className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-500/20"
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
  const { mutate: cancelPurchaseMutation } = useCancelPurchase();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [purchaseToDelete, setPurchaseToDelete] = useState<number | null>(null);

  const handleDeleteRequest = (id: number) => {
    setPurchaseToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (purchaseToDelete !== null) {
      const idToDelete = purchaseToDelete;
      setPurchaseToDelete(null);
      cancelPurchaseMutation(idToDelete, {
        onError: () => {
          toast.error('No se pudo eliminar la compra. Intentá de nuevo más tarde.');
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setPurchaseToDelete(null);
  };

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

  const filteredPurchases = filterPurchases(purchases, activeFilter);

  return (
    <>
      <div data-testid="my-services-list" className="bg-bg-main min-h-screen px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="mb-4 font-serif text-3xl font-semibold">Mis Servicios</h1>

          {/* Filter tabs */}
          <div className="mb-2 flex flex-wrap gap-2">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                aria-pressed={activeFilter === key}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  activeFilter === key
                    ? 'border-purple-600 bg-purple-600 text-white'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-purple-400 hover:text-purple-600'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredPurchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} onDelete={handleDeleteRequest} />
          ))}

          {filteredPurchases.length === 0 && (
            <p className="text-text-secondary py-8 text-center text-sm">
              No hay compras en esta categoría.
            </p>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={purchaseToDelete !== null} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la compra de tu historial. No podrás deshacer esta acción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-delete-btn"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
