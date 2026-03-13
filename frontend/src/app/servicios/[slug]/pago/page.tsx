'use client';

import { Loader2 } from 'lucide-react';

import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Pago de Servicio Holístico - Payment Instructions Page
 *
 * Protected page showing payment instructions after a purchase is created.
 * Business logic will be delegated to ServicePaymentInstructions component (future task).
 */
interface Props {
  params: { slug: string };
}

export default function ServicioPagoPage({ params }: Props) {
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
    <div className="bg-bg-main min-h-screen px-4 py-8 md:px-8" data-testid="servicio-pago-page">
      <h1 className="mb-8 font-serif text-3xl">Instrucciones de Pago</h1>
      <p className="sr-only">Slug: {params.slug}</p>
      {/* TODO T-SF-F03: Implementar ServicePaymentInstructions */}
    </div>
  );
}
