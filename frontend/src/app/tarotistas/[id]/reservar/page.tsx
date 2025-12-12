/**
 * Página de Reservar Sesión con Tarotista
 *
 * Permite al usuario reservar una sesión con un tarotista específico,
 * seleccionando fecha, hora y duración.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useTarotistaDetail } from '@/hooks/api/useTarotistas';
import { useBookSession } from '@/hooks/api/useSessions';
import { BookingCalendar } from '@/components/features/marketplace/BookingCalendar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Calendar, Clock, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { BookSessionDto, Session } from '@/types/session.types';

// Helper function to format date for Google Calendar
function formatDateForCalendar(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

// Generate Google Calendar URL
function createGoogleCalendarUrl(session: Session, tarotistaName: string): string {
  const startDate = new Date(`${session.sessionDate}T${session.sessionTime}`);
  const endDate = new Date(startDate.getTime() + session.durationMinutes * 60000);

  const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
  googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
  googleCalendarUrl.searchParams.set('text', `Sesión de Tarot con ${tarotistaName}`);
  googleCalendarUrl.searchParams.set(
    'dates',
    `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`
  );
  googleCalendarUrl.searchParams.set(
    'details',
    `Sesión reservada con ${tarotistaName}. Link: ${session.googleMeetLink || 'Por confirmar'}`
  );

  return googleCalendarUrl.toString();
}

interface ReservarPageProps {
  params: {
    id: string;
  };
}

export default function ReservarPage({ params }: ReservarPageProps) {
  const { isLoading: isAuthLoading } = useRequireAuth();
  const tarotistaId = Number(params.id);
  const router = useRouter();

  const { data: tarotista, isLoading: isTarotistaLoading, error } = useTarotistaDetail(tarotistaId);
  const { mutate: bookSession, isPending: isBooking } = useBookSession();

  const [confirmationData, setConfirmationData] = useState<Session | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Loading state
  if (isAuthLoading || isTarotistaLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-4 h-6 w-64" />
        <Skeleton className="mb-8 h-24 w-full" />
        <Skeleton className="h-96 w-full" />
        <p className="mt-4 text-center text-sm text-gray-500">Cargando...</p>
      </div>
    );
  }

  // Error state
  if (error || !tarotista) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Error al cargar el tarotista</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/explorar')}>
              Volver a explorar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle booking
  const handleBook = (date: string, time: string, duration: number) => {
    const bookingData: BookSessionDto = {
      tarotistaId,
      sessionDate: date,
      sessionTime: time,
      durationMinutes: duration,
      sessionType: 'TAROT_READING',
    };

    bookSession(bookingData, {
      onSuccess: (data) => {
        setConfirmationData(data);
        setShowConfirmationModal(true);
        toast.success('¡Sesión reservada exitosamente!');
      },
      onError: (error) => {
        toast.error(`Error al reservar: ${error.message}`);
      },
    });
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowConfirmationModal(false);
    router.push('/sesiones');
  };

  // Add to calendar
  const handleAddToCalendar = () => {
    if (!confirmationData) return;

    const googleCalendarUrl = createGoogleCalendarUrl(confirmationData, tarotista.nombrePublico);
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/explorar">Explorar</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/tarotistas/${tarotistaId}`}>
              {tarotista.nombrePublico}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Reservar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Tarotista Info Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={tarotista.fotoPerfil} alt={tarotista.nombrePublico} />
              <AvatarFallback>{tarotista.nombrePublico[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-serif text-2xl font-semibold">{tarotista.nombrePublico}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="fill-secondary text-secondary h-4 w-4" />
                <span className="font-medium">{tarotista.ratingPromedio?.toFixed(1) || 'N/A'}</span>
                <span>({tarotista.totalReviews} reseñas)</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Booking Calendar */}
      <Card>
        <CardHeader>
          <h2 className="font-serif text-xl font-semibold">Selecciona fecha y hora</h2>
        </CardHeader>
        <CardContent>
          <BookingCalendar tarotistaId={tarotistaId} onBook={handleBook} />
        </CardContent>
      </Card>

      {/* Loading overlay */}
      {isBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-8">
            <p className="text-center">Procesando reserva...</p>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-2xl">
              <span className="text-4xl">🎉</span> ¡Sesión reservada!
            </DialogTitle>
            <DialogDescription>
              Tu sesión ha sido confirmada. Recibirás un correo con todos los detalles.
            </DialogDescription>
          </DialogHeader>

          {confirmationData && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-medium">Fecha y hora</p>
                  <p className="text-sm text-gray-600">
                    {new Date(confirmationData.sessionDate).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' a las '}
                    {confirmationData.sessionTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-medium">Duración</p>
                  <p className="text-sm text-gray-600">
                    {confirmationData.durationMinutes} minutos
                  </p>
                </div>
              </div>

              {confirmationData.googleMeetLink && (
                <div className="flex items-start gap-3">
                  <LinkIcon className="text-primary mt-0.5 h-5 w-5" />
                  <div>
                    <p className="font-medium">Link de Google Meet</p>
                    <a
                      href={confirmationData.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      {confirmationData.googleMeetLink}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleAddToCalendar}>
              Agregar a calendario
            </Button>
            <Button onClick={handleCloseModal}>Ver mis sesiones</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
