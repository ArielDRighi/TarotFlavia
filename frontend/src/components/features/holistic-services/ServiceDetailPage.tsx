/**
 * ServiceDetailPage Component
 *
 * Public detail page for a single holistic service.
 * Shows name, long description, price, duration, a read-only BookingCalendar,
 * availability disclaimer, and a "Contratar servicio" CTA.
 * Handles loading skeleton, 404 not-found state, and generic error state on the client.
 */
'use client';

import Link from 'next/link';
import { BookingCalendar } from '@/components/features/marketplace/BookingCalendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHolisticServiceDetail } from '@/hooks/api/useHolisticServices';
import { ROUTES } from '@/lib/constants/routes';

interface ServiceDetailPageProps {
  slug: string;
}

// Flavia's tarotistaId — single tarotista MVP
const FLAVIA_TAROTISTA_ID = 1;

function formatArs(amount: number): string {
  return amount.toLocaleString('es-AR');
}

export function ServiceDetailPage({ slug }: ServiceDetailPageProps) {
  const { data: service, isLoading, isError, error } = useHolisticServiceDetail(slug);

  // Handle 404 — render client-side not-found state
  if (isError) {
    const isNotFound = error instanceof Error && error.message === 'Servicio no encontrado';
    if (isNotFound) {
      return (
        <div
          data-testid="service-detail-not-found"
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
      <div
        data-testid="service-detail-error"
        className="bg-bg-main flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center"
      >
        <h1 className="mb-4 font-serif text-3xl font-semibold">Error al cargar el servicio</h1>
        <p className="text-text-secondary mb-6">
          Ocurrió un error inesperado. Por favor, intentá de nuevo más tarde.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.SERVICIOS}>Volver al catálogo</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        data-testid="service-detail-skeleton"
        className="bg-bg-main min-h-screen px-4 py-8 md:px-8"
      >
        <Skeleton className="mb-4 h-10 w-3/4" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-2/3" />
        <Skeleton className="mb-8 h-4 w-1/2" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div data-testid="service-detail-page" className="bg-bg-main min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="mb-2 font-serif text-4xl font-semibold">{service.name}</h1>
          <p className="text-text-secondary text-lg">{service.shortDescription}</p>
        </div>

        {/* Price & Duration */}
        <div className="flex flex-wrap items-center gap-6 text-base">
          <div>
            <span className="text-text-secondary text-sm">Precio</span>
            <p className="font-serif text-xl font-bold">
              {formatArs(service.priceArs)}{' '}
              <span className="text-text-secondary text-sm font-normal">ARS</span>
            </p>
          </div>
          <div>
            <span className="text-text-secondary text-sm">Duración</span>
            <p className="font-serif text-xl font-bold">
              {service.durationMinutes}{' '}
              <span className="text-text-secondary text-sm font-normal">min</span>
            </p>
          </div>
          <div>
            <span className="text-text-secondary text-sm">Modalidad</span>
            <p className="font-serif text-xl font-bold">WhatsApp</p>
          </div>
        </div>

        {/* Long Description */}
        <div className="prose prose-sm max-w-none">
          <p className="text-text-primary leading-relaxed">{service.longDescription}</p>
        </div>

        {/* Booking Calendar (read-only preview) */}
        <div>
          <h2 className="mb-4 font-serif text-2xl font-medium">Disponibilidad</h2>
          <BookingCalendar tarotistaId={FLAVIA_TAROTISTA_ID} onBook={() => {}} readOnly={true} />
          <p className="text-text-secondary mt-3 text-xs">
            Las fechas disponibles son al momento de la consulta. Una vez realizado el pago, la
            fecha que observaste libre podría ya estar ocupada.
          </p>
        </div>

        {/* CTA */}
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={ROUTES.SERVICIO_PAGO(service.slug)}>Contratar servicio</Link>
        </Button>
      </div>
    </div>
  );
}
