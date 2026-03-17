'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { ServicePaymentPage } from '@/components/features/holistic-services';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Pago de Servicio Holístico - Payment Instructions Page
 *
 * Protected page showing payment instructions after a purchase is created.
 * Reads pre-selected date and time slot from query params (?date=YYYY-MM-DD&time=HH:MM)
 * and forwards them to ServicePaymentPage.
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

  return <ServicePaymentPage slug={slug} selectedDate={selectedDate} selectedTime={selectedTime} />;
}
