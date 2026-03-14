/**
 * BookingCalendar Component
 *
 * Interactive calendar for selecting date, time, and duration for tarotista sessions.
 */
'use client';

import { useState, useMemo } from 'react';
import { useAvailableSlots } from '@/hooks/api/useAvailableSlots';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

interface BookingCalendarProps {
  tarotistaId: number;
  onBook: (date: string, time: string, duration: number) => void;
  readOnly?: boolean;
}

// Durations available with prices (mock prices for now)
const DURATIONS = [
  { value: 30, label: '30 min', price: 25 },
  { value: 60, label: '60 min', price: 45 },
  { value: 90, label: '90 min', price: 65 },
] as const;

export function BookingCalendar({ tarotistaId, onBook, readOnly = false }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // Default 60min

  // Generate next 30 days
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = addDays(today, i);
      return {
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEE d', { locale: es }),
      };
    });
  }, []);

  // Fetch available slots for selected date
  const { data: slots, isLoading, isError } = useAvailableSlots(tarotistaId, selectedDate);

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Handle duration selection
  const handleDurationChange = (duration: string) => {
    setSelectedDuration(Number(duration));
  };

  // Handle booking confirmation
  const handleConfirm = () => {
    if (selectedDate && selectedTime && selectedDuration) {
      onBook(selectedDate, selectedTime, selectedDuration);
    }
  };

  // Check if all fields are selected
  const isReadyToBook = Boolean(selectedDate && selectedTime && selectedDuration);

  // Get current duration price
  const currentPrice = DURATIONS.find((d) => d.value === selectedDuration)?.price || 0;

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div>
        <h3 className="mb-3 font-serif text-lg font-medium">Selecciona una fecha</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => (
            <Button
              key={date.value}
              variant={selectedDate === date.value ? 'default' : 'outline'}
              className={cn(
                'min-w-[80px] whitespace-nowrap',
                selectedDate === date.value && 'bg-secondary hover:bg-secondary/90 text-white'
              )}
              onClick={() => handleDateSelect(date.value)}
            >
              {date.label}
            </Button>
          ))}
        </div>
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
              {slots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  className={cn(
                    'w-full',
                    selectedTime === slot.time && 'bg-primary hover:bg-primary/90 text-white',
                    (!slot.available || readOnly) && 'cursor-not-allowed opacity-50'
                  )}
                  onClick={() => !readOnly && slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available || readOnly}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Duration Selector — hidden in readOnly mode (public detail page uses fixed duration) */}
      {!readOnly && (
        <div>
          <h3 className="mb-3 font-serif text-lg font-medium">Duración</h3>
          <RadioGroup
            value={String(selectedDuration)}
            onValueChange={handleDurationChange}
            aria-label="Duración de la sesión"
          >
            <div className="space-y-2">
              {DURATIONS.map((duration) => (
                <div key={duration.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={String(duration.value)}
                    id={`duration-${duration.value}`}
                  />
                  <Label htmlFor={`duration-${duration.value}`} className="cursor-pointer">
                    {duration.label} - ${duration.price} USD
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

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
                  ? format(new Date(selectedDate), "EEEE, d 'de' MMMM yyyy", { locale: es })
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
            <div className="border-t pt-2">
              <p className="text-sm font-medium text-gray-500">Precio total</p>
              <p className="text-primary font-serif text-2xl font-bold">${currentPrice} USD</p>
            </div>
            <Button className="w-full" size="lg" onClick={handleConfirm}>
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
