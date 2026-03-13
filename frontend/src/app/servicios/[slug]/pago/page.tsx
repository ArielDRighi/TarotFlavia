'use client';

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
  return (
    <div className="bg-bg-main min-h-screen px-4 py-8 md:px-8" data-testid="servicio-pago-page">
      <h1 className="mb-8 font-serif text-3xl">Instrucciones de Pago</h1>
      <p className="sr-only">Slug: {params.slug}</p>
      {/* TODO T-SF-F03: Implementar ServicePaymentInstructions */}
    </div>
  );
}
