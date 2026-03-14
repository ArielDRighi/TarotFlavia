/**
 * ServiceBookingPage Component
 *
 * Authenticated page for booking a holistic service session after payment approval.
 * Validates purchase ownership and payment status before rendering BookingCalendar.
 * Shows a pending notice if payment not yet approved.
 * After successful booking, shows a confirmation view with WhatsApp link.
 */
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { BookingCalendar } from '@/components/features/marketplace/BookingCalendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePurchaseDetail } from '@/hooks/api/useHolisticServices';
import { useBookSession } from '@/hooks/api/useSessions';
import { ROUTES } from '@/lib/constants/routes';
import type { HolisticSessionType, SessionType } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const FLAVIA_TAROTISTA_ID = 1;

// Map holistic session types to session booking types
const SESSION_TYPE_MAP: Record<HolisticSessionType, SessionType> = {
  family_tree: 'FAMILY_TREE',
  energy_cleaning: 'ENERGY_CLEANING',
  hebrew_pendulum: 'HEBREW_PENDULUM',
};

// ============================================================================
// Types
// ============================================================================

interface ServiceBookingPageProps {
  purchaseId: number;
}

interface BookingInfo {
  date: string;
  time: string;
  duration: number;
}

// ============================================================================
// Component
// ============================================================================

export function ServiceBookingPage({ purchaseId }: ServiceBookingPageProps) {
  const { data: purchase, isLoading, isError } = usePurchaseDetail(purchaseId);
  const { mutateAsync: bookSession } = useBookSession();

  const [confirmedBooking, setConfirmedBooking] = useState<BookingInfo | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBook = useCallback(
    async (date: string, time: string, duration: number) => {
      if (!purchase?.holisticService) return;

      setBookingError(null);

      const sessionType =
        SESSION_TYPE_MAP[purchase.holisticService.slug as HolisticSessionType] ?? 'CONSULTATION';

      try {
        await bookSession({
          tarotistaId: FLAVIA_TAROTISTA_ID,
          sessionDate: date,
          sessionTime: time,
          durationMinutes: duration,
          sessionType: sessionType as SessionType,
        });

        setConfirmedBooking({ date, time, duration });
      } catch {
        setBookingError(
          'No fue posible reservar el turno. Es posible que el horario ya no esté disponible. Por favor, seleccioná otro.'
        );
      }
    },
    [purchase, bookSession]
  );

  // ---- Loading state ----
  if (isLoading) {
    return (
      <div
        data-testid="service-booking-skeleton"
        className="bg-bg-main min-h-screen px-4 py-8 md:px-8"
      >
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (isError || !purchase) {
    return (
      <div
        data-testid="service-booking-error"
        className="bg-bg-main flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center"
      >
        <h1 className="mb-4 font-serif text-3xl font-semibold">Compra no encontrada</h1>
        <p className="text-text-secondary mb-6">
          No pudimos encontrar tu compra. Por favor revisá Mis Servicios.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.MIS_SERVICIOS}>Mis Servicios</Link>
        </Button>
      </div>
    );
  }

  const serviceName = purchase.holisticService?.name ?? 'Servicio';
  const durationMinutes = purchase.holisticService?.durationMinutes ?? 60;

  // ---- Confirmation view (after successful booking) ----
  if (confirmedBooking) {
    return (
      <div
        data-testid="booking-confirmation"
        className="bg-bg-main flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center"
      >
        <div className="mx-auto max-w-md space-y-6">
          <h1 className="font-serif text-3xl font-semibold">¡Turno reservado!</h1>

          <div className="space-y-3 rounded-xl border p-6 text-left">
            <p>
              <span className="text-text-secondary text-sm">Servicio:</span>{' '}
              <span className="font-medium">{serviceName}</span>
            </p>
            <p>
              <span className="text-text-secondary text-sm">Fecha:</span>{' '}
              <span className="font-medium">{confirmedBooking.date}</span>
            </p>
            <p>
              <span className="text-text-secondary text-sm">Hora:</span>{' '}
              <span className="font-medium">{confirmedBooking.time}</span>
            </p>
            <p>
              <span className="text-text-secondary text-sm">Duración:</span>{' '}
              <span className="font-medium">{confirmedBooking.duration} min</span>
            </p>
          </div>

          {purchase.whatsappNumber && (
            <a
              href={`https://wa.me/${purchase.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              data-testid="whatsapp-link"
            >
              Contactar por WhatsApp
            </a>
          )}

          <Button asChild variant="outline" className="w-full">
            <Link href={ROUTES.MIS_SERVICIOS}>Ir a Mis Servicios</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ---- Already booked ----
  if (purchase.sessionId !== null) {
    return (
      <div
        data-testid="already-booked-message"
        className="bg-bg-main flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center"
      >
        <h1 className="mb-4 font-serif text-3xl font-semibold">Ya tenés un turno reservado</h1>
        <p className="text-text-secondary mb-6">
          Ya reservaste tu turno para este servicio. Revisá Mis Servicios para ver los detalles.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.MIS_SERVICIOS}>Mis Servicios</Link>
        </Button>
      </div>
    );
  }

  // ---- Payment pending ----
  if (purchase.paymentStatus !== 'paid') {
    return (
      <div data-testid="service-booking-page" className="bg-bg-main min-h-screen px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 font-serif text-3xl font-semibold">Reservar Sesión</h1>
          <div
            data-testid="payment-pending-notice"
            className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800"
            role="status"
          >
            <p className="text-base leading-relaxed">
              Tu pago aún está siendo verificado. Te notificaremos cuando puedas reservar tu turno.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Happy path: show booking calendar ----
  return (
    <div data-testid="service-booking-page" className="bg-bg-main min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-serif text-3xl font-semibold">Reservar Sesión</h1>
        <p className="text-text-secondary">
          Seleccioná la fecha y hora para tu sesión de{' '}
          <span className="text-text-primary font-medium">{serviceName}</span>.
        </p>

        {bookingError && (
          <div
            data-testid="booking-error-message"
            className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800"
            role="alert"
          >
            <p className="text-sm leading-relaxed">{bookingError}</p>
          </div>
        )}

        <BookingCalendar
          tarotistaId={FLAVIA_TAROTISTA_ID}
          onBook={(date, time) => handleBook(date, time, durationMinutes)}
          readOnly={false}
        />
      </div>
    </div>
  );
}
