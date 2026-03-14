'use client';

import { Loader2 } from 'lucide-react';

import { ServiceBookingPage } from '@/components/features/holistic-services';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Reserva de Sesión tras Compra Aprobada - Booking Page
 *
 * Protected page for scheduling the holistic session after payment approval.
 * Business logic delegated to ServiceBookingPage component.
 */
interface Props {
  params: { purchaseId: string };
}

export default function ReservarServicioPage({ params }: Props) {
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

  return <ServiceBookingPage purchaseId={Number(params.purchaseId)} />;
}
