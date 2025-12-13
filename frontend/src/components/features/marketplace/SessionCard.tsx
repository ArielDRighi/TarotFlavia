'use client';

import { CheckCircle2 } from 'lucide-react';
import { format, parseISO, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils/text';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Session, SessionDetail, SessionStatus } from '@/types/session.types';

/**
 * SessionCard Component Props
 */
export interface SessionCardProps {
  /** Session data (can be basic Session or SessionDetail with tarotista) */
  session: Session | SessionDetail;
  /** Callback when cancel button is clicked */
  onCancel?: (id: number) => void;
  /** Callback when join button is clicked */
  onJoin?: (meetLink: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Status badge configuration
 */
const STATUS_CONFIG: Record<
  SessionStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    borderColor: string;
  }
> = {
  pending: {
    label: 'Pendiente',
    variant: 'secondary',
    borderColor: 'border-l-yellow-500',
  },
  confirmed: {
    label: 'Confirmada',
    variant: 'default',
    borderColor: 'border-l-primary',
  },
  completed: {
    label: 'Completada',
    variant: 'outline',
    borderColor: 'border-l-accent-success',
  },
  cancelled_by_user: {
    label: 'Cancelada',
    variant: 'destructive',
    borderColor: 'border-l-destructive',
  },
  cancelled_by_tarotist: {
    label: 'Cancelada',
    variant: 'destructive',
    borderColor: 'border-l-destructive',
  },
};

/**
 * Check if session is within 24 hours
 */
function isSessionWithin24Hours(sessionDate: string, sessionTime: string): boolean {
  const sessionDateTime = parseISO(`${sessionDate}T${sessionTime}`);
  const now = new Date();
  const hoursUntilSession = differenceInHours(sessionDateTime, now);
  return hoursUntilSession >= 0 && hoursUntilSession <= 24;
}

/**
 * SessionCard Component
 *
 * Displays a session reservation card with tarotista info, date/time, status, and actions.
 *
 * Features:
 * - Horizontal card layout with three sections (left, center, right)
 * - Left section: Tarotista avatar and name
 * - Center section: Session date/time, duration, status badge
 * - Right section: Conditional action buttons
 * - Status-based colored left border
 * - Responsive layout
 *
 * Action buttons:
 * - "Unirse" (green): Shown for confirmed sessions within 24h
 * - "Cancelar" (red outline): Shown for pending/confirmed sessions, disabled within 24h
 * - Green check icon: Shown for completed sessions
 *
 * @example
 * ```tsx
 * <SessionCard
 *   session={session}
 *   onCancel={(id) => cancelSession(id)}
 *   onJoin={(link) => window.open(link, '_blank')}
 * />
 * ```
 */
export function SessionCard({ session, onCancel, onJoin, className }: SessionCardProps) {
  const statusConfig = STATUS_CONFIG[session.status];
  const isWithin24Hours = isSessionWithin24Hours(session.sessionDate, session.sessionTime);

  // Check if session has tarotista info (SessionDetail type)
  const sessionDetail = session as SessionDetail;
  const tarotista = sessionDetail.tarotista;

  // Format date: "Lunes 2 de Diciembre - 15:00"
  const sessionDateTime = parseISO(`${session.sessionDate}T${session.sessionTime}`);
  const formattedDate = format(sessionDateTime, "EEEE d 'de' MMMM", { locale: es });
  const formattedTime = session.sessionTime;

  // Determine which buttons to show
  const canShowCancelButton =
    (session.status === 'pending' || session.status === 'confirmed') && onCancel !== undefined;
  const canJoin = session.status === 'confirmed' && isWithin24Hours && onJoin !== undefined;
  const isCompleted = session.status === 'completed';
  const isCancelDisabled = isWithin24Hours;

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel(session.id);
    }
  };

  const handleJoinClick = () => {
    if (onJoin) {
      onJoin(session.googleMeetLink);
    }
  };

  return (
    <Card
      data-testid="session-card"
      className={cn(
        'flex flex-row items-stretch',
        'bg-card',
        'border-l-4',
        statusConfig.borderColor,
        'shadow-sm',
        'transition-all duration-200',
        'hover:shadow-md',
        className
      )}
    >
      {/* Left Section - Tarotista Avatar and Name */}
      {tarotista && (
        <div className="flex flex-col items-center justify-center gap-2 border-r p-4">
          <Avatar className="h-12 w-12" data-testid="tarotista-avatar">
            {tarotista.foto ? <AvatarImage src={tarotista.foto} alt={tarotista.nombre} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getInitials(tarotista.nombre)}
            </AvatarFallback>
          </Avatar>
          <span className="line-clamp-2 max-w-[100px] text-center text-sm font-medium">
            {tarotista.nombre}
          </span>
        </div>
      )}

      {/* Center Section - Session Details */}
      <CardContent className="flex flex-1 flex-col justify-center gap-2 p-4">
        {/* Date and Time */}
        <p className="text-primary text-sm font-semibold capitalize">
          {formattedDate} - {formattedTime}
        </p>

        {/* Duration */}
        <p className="text-muted-foreground text-sm">{session.durationMinutes} minutos</p>

        {/* Status Badge */}
        <div>
          <Badge variant={statusConfig.variant} className="text-xs">
            {statusConfig.label}
          </Badge>
        </div>
      </CardContent>

      {/* Right Section - Actions */}
      <div className="flex items-center justify-center gap-2 border-l p-4">
        {/* Join Button (confirmed + within 24h) */}
        {canJoin && (
          <Button
            onClick={handleJoinClick}
            variant="default"
            size="sm"
            className="bg-accent-success hover:bg-accent-success/90"
          >
            Unirse
          </Button>
        )}

        {/* Cancel Button (pending or confirmed, disabled within 24h) */}
        {canShowCancelButton && (
          <Button
            onClick={handleCancelClick}
            variant="outline"
            size="sm"
            disabled={isCancelDisabled}
            className={cn(
              'border-destructive text-destructive hover:bg-destructive/10',
              isCancelDisabled && 'cursor-not-allowed opacity-50'
            )}
          >
            Cancelar
          </Button>
        )}

        {/* Completed Icon */}
        {isCompleted && (
          <CheckCircle2
            data-testid="completed-icon"
            className="text-accent-success h-6 w-6"
            aria-label="Sesión completada"
          />
        )}
      </div>
    </Card>
  );
}
