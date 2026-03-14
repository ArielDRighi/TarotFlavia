/**
 * ServicePaymentPage Component
 *
 * Authenticated page for initiating a Mercado Pago payment for a holistic service.
 * Shows a summary (name, price, duration) and a "Pagar con Mercado Pago" button.
 * After clicking, opens the MP link in a new tab and shows a verification message.
 * Handles loading skeleton, error state, and purchase creation failure.
 */
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHolisticServiceDetail } from '@/hooks/api/useHolisticServices';
import { useCreatePurchase } from '@/hooks/api/useHolisticServiceMutations';
import { ROUTES } from '@/lib/constants/routes';

// ============================================================================
// Types
// ============================================================================

interface ServicePaymentPageProps {
  slug: string;
}

// ============================================================================
// Helpers
// ============================================================================

function formatArs(amount: number): string {
  return amount.toLocaleString('es-AR');
}

// ============================================================================
// Component
// ============================================================================

export function ServicePaymentPage({ slug }: ServicePaymentPageProps) {
  const { data: service, isLoading, isError } = useHolisticServiceDetail(slug);
  const { mutateAsync: createPurchase, isPending } = useCreatePurchase();

  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePay = useCallback(async () => {
    if (!service) return;

    setPurchaseError(null);

    // Open a blank tab immediately (within the user gesture) to avoid popup blockers.
    // The tab stays open while we await the API; we assign the URL after.
    const mpTab = window.open('', '_blank');

    try {
      const purchase = await createPurchase({ holisticServiceId: service.id });

      if (purchase.mercadoPagoUrl && mpTab) {
        mpTab.location.href = purchase.mercadoPagoUrl;
      } else {
        // Close the blank tab if there is no URL to navigate to
        mpTab?.close();
      }

      setPaymentInitiated(true);
    } catch {
      mpTab?.close();
      setPurchaseError(
        'No fue posible iniciar el pago. Es posible que ya hayas contratado este servicio. Por favor, revisá "Mis Servicios" o intentá de nuevo.'
      );
    }
  }, [service, createPurchase]);

  // ---- Loading state ----
  if (isLoading) {
    return (
      <div
        data-testid="service-payment-skeleton"
        className="bg-bg-main min-h-screen px-4 py-8 md:px-8"
      >
        <div className="mx-auto max-w-lg space-y-6">
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-8 h-12 w-48" />
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (isError || !service) {
    return (
      <div
        data-testid="service-payment-error"
        className="bg-bg-main flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center"
      >
        <h1 className="mb-4 font-serif text-3xl font-semibold">Servicio no encontrado</h1>
        <p className="text-text-secondary mb-6">
          El servicio que buscás no existe o fue eliminado.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.SERVICIOS}>Volver al catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="service-payment-page" className="bg-bg-main min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-lg space-y-8">
        {/* Header */}
        <div>
          <h1 className="mb-1 font-serif text-3xl font-semibold">{service.name}</h1>
          <p className="text-text-secondary text-base">{service.shortDescription}</p>
        </div>

        {/* Summary */}
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="font-serif text-xl font-medium">Resumen del servicio</h2>

          <div className="flex flex-wrap gap-6">
            <div>
              <span className="text-text-secondary text-sm">Precio</span>
              <p className="font-serif text-2xl font-bold">
                ${formatArs(service.priceArs)}{' '}
                <span className="text-text-secondary text-sm font-normal">ARS</span>
              </p>
            </div>
            <div>
              <span className="text-text-secondary text-sm">Duración</span>
              <p className="font-serif text-2xl font-bold">
                {service.durationMinutes}{' '}
                <span className="text-text-secondary text-sm font-normal">min</span>
              </p>
            </div>
          </div>
        </div>

        {/* Post-click verification message */}
        {paymentInitiated && (
          <div
            data-testid="payment-pending-message"
            className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800"
            role="status"
          >
            <p className="text-sm leading-relaxed">
              Tu pago está siendo verificado. Una vez confirmado, te habilitaremos la reserva de
              turno y recibirás un email con todos los datos.
            </p>
          </div>
        )}

        {/* Purchase error */}
        {purchaseError && (
          <div
            data-testid="payment-error-message"
            className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800"
            role="alert"
          >
            <p className="text-sm leading-relaxed">{purchaseError}</p>
          </div>
        )}

        {/* CTA */}
        {!paymentInitiated && (
          <Button size="lg" className="w-full sm:w-auto" onClick={handlePay} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Pagar con Mercado Pago'
            )}
          </Button>
        )}

        {paymentInitiated && (
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href={ROUTES.MIS_SERVICIOS}>Ir a Mis Servicios</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
