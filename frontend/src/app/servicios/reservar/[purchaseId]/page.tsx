'use client';

import { use } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { ServiceBookingPage } from '@/components/features/holistic-services';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/button';

/**
 * Reserva de Sesión tras Compra Aprobada - Booking Page
 *
 * Protected page for scheduling the holistic session after payment approval.
 * Business logic delegated to ServiceBookingPage component.
 */
interface Props {
  params: Promise<{ purchaseId: string }>;
}

export default function ReservarServicioPage({ params }: Props) {
  const { purchaseId: rawPurchaseId } = use(params);
  const { isLoading: isAuthLoading } = useRequireAuth();

  if (isAuthLoading) {
    return (
      <div
        data-testid="auth-loading"
        className="bg-bg-main flex min-h-screen items-center justify-center"
      >
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const purchaseId = Number(rawPurchaseId);

  if (!Number.isFinite(purchaseId) || purchaseId <= 0) {
    return (
      <div
        data-testid="invalid-purchase-id"
        className="bg-bg-main flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center"
      >
        <h1 className="mb-4 font-serif text-3xl font-semibold">Compra inválida</h1>
        <p className="text-text-secondary mb-6">
          El identificador de compra no es válido. Por favor revisá Mis Servicios.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.MIS_SERVICIOS}>Mis Servicios</Link>
        </Button>
      </div>
    );
  }

  return <ServiceBookingPage purchaseId={purchaseId} />;
}
