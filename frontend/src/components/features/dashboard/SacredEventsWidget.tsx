'use client';

import { CalendarHeart, Moon, Sun, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTodayEvents, useUpcomingEvents } from '@/hooks/api/useSacredCalendar';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { SacredEventType, ImportanceLevel, IMPORTANCE_INFO, type SacredEvent } from '@/types';

const EVENT_ICONS: Record<
  SacredEventType,
  React.ComponentType<{ className?: string }>
> = {
  [SacredEventType.SABBAT]: Sun,
  [SacredEventType.LUNAR_PHASE]: Moon,
  [SacredEventType.PORTAL]: Sparkles,
  [SacredEventType.CULTURAL]: CalendarHeart,
  [SacredEventType.ECLIPSE]: Moon,
};

const calculateDaysUntil = (eventDate: string): number => {
  const now = new Date();
  const event = new Date(eventDate);
  const diffTime = event.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDaysUntilLabel = (days: number): string => {
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  return `En ${days} días`;
};

const getImportanceBadgeText = (importance: ImportanceLevel): string => {
  switch (importance) {
    case ImportanceLevel.HIGH:
      return 'Alta';
    case ImportanceLevel.MEDIUM:
      return 'Media';
    case ImportanceLevel.LOW:
      return 'Baja';
    default:
      return 'Normal';
  }
};

interface EventItemProps {
  event: SacredEvent;
  showDate?: boolean;
}

const EventItem = ({ event, showDate = false }: EventItemProps) => {
  const Icon = EVENT_ICONS[event.eventType];
  const daysUntil = calculateDaysUntil(event.eventDate);
  const importanceInfo = IMPORTANCE_INFO[event.importance];

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-purple-300">
      <div className="flex flex-1 items-start gap-3">
        <div className="mt-0.5">
          <Icon className="h-5 w-5 text-purple-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900">{event.name}</h4>
            <Badge variant="secondary" className={importanceInfo.color}>
              {getImportanceBadgeText(event.importance)}
            </Badge>
          </div>
          {showDate && <p className="mt-1 text-xs text-gray-500">{getDaysUntilLabel(daysUntil)}</p>}
        </div>
      </div>
      <Link
        href={`/rituales?event=${event.eventType}`}
        className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-purple-600 hover:text-purple-700"
      >
        Ver rituales
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
};

export function SacredEventsWidget() {
  const { user } = useAuthStore();
  const isPremium = user?.plan === 'premium';

  const { data: todayEvents, isLoading: todayLoading, error: todayError } = useTodayEvents();

  const {
    data: upcomingEventsData,
    isLoading: upcomingLoading,
    error: upcomingError,
  } = useUpcomingEvents(7);

  const isLoading = todayLoading || upcomingLoading;
  const hasError = todayError || upcomingError;

  // Limitar a máximo 3 eventos próximos
  const upcomingEvents = upcomingEventsData?.slice(0, 3) || [];

  const hasTodayEvents = todayEvents && todayEvents.length > 0;
  const hasUpcomingEvents = upcomingEvents.length > 0;
  const hasAnyEvents = hasTodayEvents || hasUpcomingEvents;

  return (
    <Card className="p-6" data-testid="sacred-events-widget">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarHeart className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Calendario Sagrado</h3>
        </div>
        {isPremium && (
          <Link
            href="/rituales/calendario"
            className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            Ver todo
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-8 text-center">
          <div className="animate-pulse">
            <CalendarHeart className="mx-auto mb-2 h-12 w-12 text-purple-300" />
            <p className="text-sm text-gray-500">Cargando eventos...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600">Error al cargar eventos. Inténtalo de nuevo.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasError && !hasAnyEvents && (
        <div className="py-8 text-center">
          <CalendarHeart className="mx-auto mb-2 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">No hay eventos próximos en el calendario sagrado.</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !hasError && hasAnyEvents && (
        <div className="space-y-4">
          {/* Today Events */}
          {hasTodayEvents && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                  !
                </span>
                Hoy
              </h4>
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <EventItem key={event.id} event={event} showDate={false} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {hasUpcomingEvents && (
            <div>
              {hasTodayEvents && (
                <h4 className="mt-4 mb-3 text-sm font-medium text-gray-700">Próximamente</h4>
              )}
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <EventItem key={event.id} event={event} showDate={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Premium Upsell for Free Users */}
      {!isPremium && !isLoading && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-start gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3">
            <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-medium text-gray-900">
                Desbloquea el calendario completo
              </p>
              <p className="mb-2 text-xs text-gray-600">
                Accede a todos los eventos sagrados del año y planifica tus rituales con
                anticipación.
              </p>
              <Link href="/premium">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Mejorar a Premium
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
