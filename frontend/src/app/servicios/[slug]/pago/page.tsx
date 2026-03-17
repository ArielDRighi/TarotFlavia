'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { ServicePaymentPage } from '@/components/features/holistic-services';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

/** Validates a YYYY-MM-DD date string. */
function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Validates a HH:MM time string. */
function isValidTime(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

/**
 * Pago de Servicio Holístico - Payment Instructions Page
 *
 * Protected page showing payment instructions after a purchase is created.
 * Reads pre-selected date and time slot from query params (?date=YYYY-MM-DD&time=HH:MM)
 * and forwards them to ServicePaymentPage.
 * Redirects to service detail if params are missing or malformed.
 * Business logic delegated to ServicePaymentPage component.
 */
export default function ServicioPagoPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const { isLoading: isAuthLoading } = useRequireAuth();

  const selectedDate = searchParams.get('date') ?? '';
  const selectedTime = searchParams.get('time') ?? '';

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

  // Guard: date and time params are required and must be well-formed
  if (!isValidDate(selectedDate) || !isValidTime(selectedTime)) {
    return (
      <div
        data-testid="invalid-slot-params"
        className="bg-bg-main flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center"
      >
        <h1 className="mb-4 font-serif text-3xl font-semibold">Selección de horario inválida</h1>
        <p className="text-text-secondary mb-6">
          No se recibió una fecha y horario válidos. Por favor, seleccioná un turno desde la página
          del servicio.
        </p>
        <Button asChild variant="outline">
          <Link href={`${ROUTES.SERVICIOS}/${slug}`}>Volver al servicio</Link>
        </Button>
      </div>
    );
  }

  return <ServicePaymentPage slug={slug} selectedDate={selectedDate} selectedTime={selectedTime} />;
}
