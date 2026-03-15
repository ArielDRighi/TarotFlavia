/**
 * WeeklyScheduleGrid Component
 *
 * Displays a 7-day weekly schedule grid for admin management of tarotista availability.
 * Shows configured time ranges and allows adding/removing availability slots per day.
 */

'use client';

import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayOfWeek, DAY_LABELS } from '@/types';
import type { TarotistAvailability } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface Props {
  availability: TarotistAvailability[];
  onAdd: (day: DayOfWeek) => void;
  onRemove: (availabilityId: number) => void;
}

// ============================================================================
// Constants
// ============================================================================

const DAYS_ORDER: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

// ============================================================================
// Component
// ============================================================================

export function WeeklyScheduleGrid({ availability, onAdd, onRemove }: Props) {
  // Build a lookup map: dayOfWeek → availability slot
  const availabilityMap = new Map<DayOfWeek, TarotistAvailability>();
  for (const slot of availability) {
    availabilityMap.set(slot.dayOfWeek, slot);
  }

  return (
    <div data-testid="weekly-schedule-grid" className="space-y-2">
      {DAYS_ORDER.map((day) => {
        const slot = availabilityMap.get(day);

        return (
          <div
            key={day}
            data-testid={`day-row-${day}`}
            className="border-border bg-card flex items-center justify-between rounded-lg border px-4 py-3"
          >
            {/* Day label */}
            <span className="w-28 text-sm font-medium">{DAY_LABELS[day]}</span>

            {/* Time range or empty state */}
            {slot ? (
              <span className="text-muted-foreground flex-1 text-sm">
                {slot.startTime} - {slot.endTime}
              </span>
            ) : (
              <span className="text-muted-foreground/50 flex-1 text-sm italic">
                Sin disponibilidad
              </span>
            )}

            {/* Action button */}
            {slot ? (
              <Button
                variant="ghost"
                size="sm"
                aria-label="Eliminar disponibilidad"
                onClick={() => onRemove(slot.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                aria-label="Agregar disponibilidad"
                onClick={() => onAdd(day)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
