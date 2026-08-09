/**
 * ServiceDetailPage Component
 *
 * Public detail page for a single holistic service.
 * Shows name, long description, price, duration, an interactive BookingCalendar
 * where the user selects a date and time slot BEFORE paying.
 * The "Contratar servicio" CTA is enabled only after a slot is selected.
 * Handles loading skeleton, 404 not-found state, and generic error state on the client.
 *
 * T-SF-D02: Rediseño — calendario interactivo pre-pago.
 */
'use client';

import type { HolisticServiceDetail } from '@/types/holistic-service.types';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { BookingCalendar } from '@/components/features/marketplace/BookingCalendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHolisticServiceDetail } from '@/hooks/api/useHolisticServices';
import { ROUTES } from '@/lib/constants/routes';
import { isNotFoundError } from '@/lib/metadata/route-data';

interface ServiceDetailPageProps {
  slug: string;
  /** Servicio resuelto en el servidor; la ruta corta con notFound() si no existe (T-PROD-024). */
  initialService: HolisticServiceDetail;
}

// Flavia's tarotistaId — single tarotista MVP
const FLAVIA_TAROTISTA_ID = 1;

function formatArs(amount: number): string {
  return amount.toLocaleString('es-AR');
}

export function ServiceDetailPage({ slug, initialService }: ServiceDetailPageProps) {
  const { data: service, isLoading, error } = useHolisticServiceDetail(slug, initialService);

  // Selected slot state — user must pick date + time before paying
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleBook = useCallback((date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  }, []);

  const hasSlotSelected = Boolean(selectedDate && selectedTime);

  // Build the payment URL with selected slot as query params
  const paymentHref = hasSlotSelected
    ? `${ROUTES.SERVICIO_PAGO(slug)}?date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
    : ROUTES.SERVICIO_PAGO(slug);

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

  // Sin `isError` como primer guard: con `initialService` sembrado, la única
  // forma de que `isError` sea true es un refetch en background fallido, y ahí
  // hay que conservar el servicio bueno en vez de vaciar la página (y perder el
  // turno que el usuario ya eligió). Mismo criterio que artículo, ritual y carta.
  if (!service) {
    if (isNotFoundError(error)) {
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

        {/* Booking Calendar — interactive slot selection pre-payment */}
        <div>
          <h2 className="mb-4 font-serif text-2xl font-medium">Elegí fecha y horario</h2>
          <BookingCalendar
            tarotistaId={FLAVIA_TAROTISTA_ID}
            onBook={handleBook}
            readOnly={false}
            serviceSlug={slug}
            serviceDurationMinutes={service.durationMinutes}
          />
          {!hasSlotSelected && (
            <p data-testid="slot-required-hint" className="text-text-secondary mt-3 text-xs">
              Seleccioná una fecha y horario para poder contratar el servicio.
            </p>
          )}
          {hasSlotSelected && (
            <p data-testid="slot-selected-hint" className="mt-3 text-xs text-green-600">
              Horario seleccionado: {selectedDate} a las {selectedTime}
            </p>
          )}
        </div>

        {/* CTA — disabled until a slot is selected */}
        <Button
          asChild={hasSlotSelected}
          size="lg"
          className="w-full sm:w-auto"
          disabled={!hasSlotSelected}
          data-testid="contratar-button"
        >
          {hasSlotSelected ? (
            <Link href={paymentHref}>Contratar servicio</Link>
          ) : (
            <span>Contratar servicio</span>
          )}
        </Button>
      </div>
    </div>
  );
}
