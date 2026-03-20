/**
 * BookingCalendar Component
 *
 * Interactive calendar for selecting date, time, and duration for tarotista sessions.
 * T-SF-M01: Rediseño a cuadrícula mensual con navegación por mes.
 */
'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAvailableSlots } from '@/hooks/api/useAvailableSlots';
import { useHolisticServiceAvailability } from '@/hooks/api/useHolisticServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isBefore,
  startOfDay,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import { formatDateFullWithYear } from '@/lib/utils/date';

interface BookingCalendarProps {
  tarotistaId: number;
  onBook: (date: string, time: string, duration: number) => void;
  readOnly?: boolean;
  serviceSlug?: string;
  /** When provided, locks the duration to this value and hides the selector. */
  serviceDurationMinutes?: number;
}

// Day of week headers — starts on Monday (ISO week)
const DAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Returns the ISO day-of-week index (0=Monday, 6=Sunday) for a given Date.
 * date-fns getDay() returns 0=Sunday; we convert to Monday-first.
 */
function getISODayIndex(date: Date): number {
  const day = getDay(date); // 0=Sun, 1=Mon, ..., 6=Sat
  return day === 0 ? 6 : day - 1; // 0=Mon, ..., 6=Sun
}

export function BookingCalendar({
  tarotistaId,
  onBook,
  readOnly = false,
  serviceSlug,
  serviceDurationMinutes,
}: BookingCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(serviceDurationMinutes ?? 60);

  // Build the calendar grid for the current month
  const calendarGrid = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });

    // Leading empty cells so the first day lands on the correct column (Mon-based)
    const leadingBlanks = getISODayIndex(firstDay);

    return { days, leadingBlanks };
  }, [currentMonth]);

  // Determine data source: public endpoint when serviceSlug is provided (detail page),
  // authenticated endpoint only when no serviceSlug (legacy booking page).
  const usePublicSlots = !!serviceSlug;

  // Fetch slots via authenticated endpoint (legacy booking page without serviceSlug)
  const {
    data: authenticatedSlots,
    isLoading: isLoadingAuthenticated,
    isError: isErrorAuthenticated,
  } = useAvailableSlots(tarotistaId, !usePublicSlots ? selectedDate : '', selectedDuration);

  // Fetch slots via public endpoint (service detail page with serviceSlug)
  const {
    data: publicAvailability,
    isLoading: isLoadingPublic,
    isError: isErrorPublic,
  } = useHolisticServiceAvailability(serviceSlug ?? '', usePublicSlots ? selectedDate : '');
  const slots = usePublicSlots ? (publicAvailability?.slots ?? undefined) : authenticatedSlots;
  const isLoading = usePublicSlots ? isLoadingPublic : isLoadingAuthenticated;
  const isError = usePublicSlots ? isErrorPublic : isErrorAuthenticated;

  // Navigation
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setSelectedDate('');
    setSelectedTime('');
  };

  // Disable previous month navigation when we're already on the current month
  const isPrevDisabled = isSameDay(currentMonth, startOfMonth(today));

  // Date selection
  const handleDateSelect = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    setSelectedDate(formatted);
    setSelectedTime('');
  };

  // Time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Booking confirmation
  const handleConfirm = () => {
    if (selectedDate && selectedTime && selectedDuration) {
      onBook(selectedDate, selectedTime, selectedDuration);
    }
  };

  const isReadyToBook = Boolean(selectedDate && selectedTime && selectedDuration);

  return (
    <div className="space-y-6">
      {/* Month navigation header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          disabled={isPrevDisabled}
          data-testid="calendar-prev-month"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h3
          className="font-serif text-lg font-medium capitalize"
          data-testid="calendar-month-header"
        >
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          data-testid="calendar-next-month"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-muted-foreground py-1 text-center text-xs font-medium uppercase"
          >
            {day}
          </div>
        ))}

        {/* Leading blank cells */}
        {Array.from({ length: calendarGrid.leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} data-empty="true" aria-hidden="true" />
        ))}

        {/* Day cells */}
        {calendarGrid.days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isPast = isBefore(day, today) && !isToday(day);
          const isTodayDay = isToday(day);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              data-testid={isTodayDay ? 'calendar-day-today' : `calendar-day-${dateStr}`}
              data-past={String(isPast)}
              data-selected={String(isSelected)}
              data-empty="false"
              disabled={isPast}
              onClick={() => !isPast && handleDateSelect(day)}
              aria-label={format(day, "d 'de' MMMM yyyy", { locale: es })}
              aria-current={isTodayDay ? 'date' : undefined}
              className={cn(
                'rounded-md py-2 text-center text-sm transition-colors',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                // Past days
                isPast && 'text-muted-foreground cursor-not-allowed opacity-40',
                // Today ring
                isTodayDay && !isSelected && 'ring-secondary text-secondary font-semibold ring-2',
                // Selected
                isSelected && 'bg-secondary font-semibold text-white',
                // Future days (not selected, not today)
                !isPast && !isSelected && !isTodayDay && 'hover:bg-accent cursor-pointer'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h3 className="mb-3 font-serif text-lg font-medium">Selecciona un horario</h3>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <p className="text-sm text-gray-500">Cargando horarios disponibles...</p>
            </div>
          )}

          {!isLoading && isError && (
            <p className="text-sm text-red-600">Error al cargar horarios disponibles</p>
          )}

          {!isLoading && !isError && slots && slots.length === 0 && (
            <p className="text-sm text-gray-500">No hay horarios disponibles para esta fecha</p>
          )}

          {!isLoading && !isError && slots && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {slots.map((slot) => {
                const isSlotSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    data-selected={String(isSlotSelected)}
                    data-available={String(slot.available)}
                    disabled={!slot.available || readOnly}
                    onClick={() => !readOnly && slot.available && handleTimeSelect(slot.time)}
                    className={cn(
                      'inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                      'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                      // Selected (booking mode only)
                      isSlotSelected && 'bg-primary border-primary text-white',
                      // Available — booking mode (interactive)
                      !isSlotSelected &&
                        slot.available &&
                        !readOnly &&
                        'bg-background hover:bg-accent border-input',
                      // Available — readOnly preview mode (green, non-interactive)
                      slot.available &&
                        readOnly &&
                        'cursor-default border-green-300 bg-green-50 text-green-800',
                      // Occupied — readOnly preview mode (gray)
                      !slot.available &&
                        readOnly &&
                        'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-60',
                      // Occupied — booking mode (disabled)
                      !slot.available &&
                        !readOnly &&
                        'bg-background border-input cursor-not-allowed opacity-50'
                    )}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Duration — hidden in readOnly mode; when serviceDurationMinutes is set the
          duration is locked to the service config and we skip the selector entirely. */}

      {/* Booking Summary */}
      {isReadyToBook && !readOnly && (
        <Card className="border-primary/20 sticky bottom-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha seleccionada</p>
              <p className="font-serif text-base">
                {selectedDate && !isNaN(new Date(selectedDate).getTime())
                  ? formatDateFullWithYear(selectedDate)
                  : 'Fecha inválida'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hora seleccionada</p>
              <p className="font-serif text-base">{selectedTime}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duración</p>
              <p className="font-serif text-base">{selectedDuration} minutos</p>
            </div>
            <Button className="mt-2 w-full" size="lg" onClick={handleConfirm}>
              Confirmar y Reservar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirm Button (when summary not visible) */}
      {!isReadyToBook && !readOnly && (
        <Button className="w-full" size="lg" disabled>
          Confirmar y Reservar
        </Button>
      )}
    </div>
  );
}
