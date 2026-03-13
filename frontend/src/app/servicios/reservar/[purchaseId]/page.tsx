'use client';

import { Loader2 } from 'lucide-react';

import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Reserva de Sesión tras Compra Aprobada - Booking Page
 *
 * Protected page for scheduling the holistic session after payment approval.
 * Business logic will be delegated to ServiceBookingForm component (future task).
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

  return (
    <div className="bg-bg-main min-h-screen px-4 py-8 md:px-8" data-testid="reservar-servicio-page">
      <h1 className="mb-8 font-serif text-3xl">Reservar Sesión</h1>
      <p className="sr-only">Purchase ID: {params.purchaseId}</p>
      {/* TODO T-SF-F04: Implementar ServiceBookingForm */}
    </div>
  );
}
