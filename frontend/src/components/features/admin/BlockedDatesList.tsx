/**
 * BlockedDatesList Component
 *
 * Displays a list of blocked dates and exceptions for a tarotista.
 * Allows admin to remove individual exceptions.
 */

'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExceptionType } from '@/types';
import type { TarotistException } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface Props {
  exceptions: TarotistException[];
  onRemove: (exceptionId: number) => void;
}

// ============================================================================
// Helpers
// ============================================================================

function exceptionTypeLabel(type: ExceptionType): string {
  return type === ExceptionType.BLOCKED ? 'Bloqueado' : 'Horario personalizado';
}

// ============================================================================
// Component
// ============================================================================

export function BlockedDatesList({ exceptions, onRemove }: Props) {
  return (
    <div data-testid="blocked-dates-list" className="space-y-2">
      {exceptions.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">Sin fechas bloqueadas</p>
      ) : (
        exceptions.map((exception) => (
          <div
            key={exception.id}
            data-testid={`exception-row-${exception.id}`}
            className="border-border bg-card flex items-center justify-between rounded-lg border px-4 py-3"
          >
            {/* Date */}
            <span className="w-28 font-mono text-sm">{exception.exceptionDate}</span>

            {/* Type badge */}
            <span className="text-muted-foreground w-40 text-xs">
              {exceptionTypeLabel(exception.exceptionType)}
            </span>

            {/* Time range (custom_hours only) */}
            {exception.exceptionType === ExceptionType.CUSTOM_HOURS &&
            exception.startTime &&
            exception.endTime ? (
              <span className="text-muted-foreground flex-1 text-sm">
                {exception.startTime} - {exception.endTime}
              </span>
            ) : (
              <span className="flex-1" />
            )}

            {/* Reason */}
            {exception.reason ? (
              <span className="text-muted-foreground flex-1 truncate text-sm">
                {exception.reason}
              </span>
            ) : (
              <span className="flex-1" />
            )}

            {/* Delete action */}
            <Button
              variant="ghost"
              size="sm"
              aria-label="Eliminar fecha bloqueada"
              onClick={() => onRemove(exception.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
