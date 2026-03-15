'use client';

import { use } from 'react';
import { Loader2 } from 'lucide-react';

import { ServicePaymentPage } from '@/components/features/holistic-services';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Pago de Servicio Holístico - Payment Instructions Page
 *
 * Protected page showing payment instructions after a purchase is created.
 * Business logic delegated to ServicePaymentPage component.
 */
interface Props {
  params: Promise<{ slug: string }>;
}

export default function ServicioPagoPage({ params }: Props) {
  const { slug } = use(params);
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

  return <ServicePaymentPage slug={slug} />;
}
