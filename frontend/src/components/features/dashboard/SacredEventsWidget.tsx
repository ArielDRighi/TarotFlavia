'use client';

import { CalendarHeart, Moon, Sun, Sparkles, ChevronRight } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { WidgetEmptyState } from './WidgetEmptyState';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { ROUTES } from '@/lib/constants/routes';
import { PremiumUpsellCard } from '@/components/ui/premium-upsell-card';
import { useTodayEvents, useUpcomingEvents } from '@/hooks/api/useSacredCalendar';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { SacredEventType, ImportanceLevel, IMPORTANCE_INFO, type SacredEvent } from '@/types';
import { parseDateString } from '@/lib/utils/date';
import { CTA_PREMIUM } from '@/lib/constants/cta-copy';
import { differenceInCalendarDays } from 'date-fns';

const EVENT_ICONS: Record<SacredEventType, React.ComponentType<{ className?: string }>> = {
  [SacredEventType.SABBAT]: Sun,
  [SacredEventType.LUNAR_PHASE]: Moon,
  [SacredEventType.PORTAL]: Sparkles,
  [SacredEventType.CULTURAL]: CalendarHeart,
  [SacredEventType.ECLIPSE]: Moon,
};

const calculateDaysUntil = (eventDate: string): number => {
  const now = new Date();
  const event = parseDateString(eventDate);
  return differenceInCalendarDays(event, now);
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
    <div className="border-border bg-card hover:border-primary/40 flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors">
      <div className="flex flex-1 items-start gap-3">
        <div className="mt-0.5">
          <Icon className="text-secondary h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-foreground text-sm font-medium">{event.name}</h4>
            <Badge variant="secondary" className={importanceInfo.color}>
              {getImportanceBadgeText(event.importance)}
            </Badge>
          </div>
          {showDate && (
            <p className="text-muted-foreground mt-1 text-xs">{getDaysUntilLabel(daysUntil)}</p>
          )}
        </div>
      </div>
      <Link
        href={`/rituales?event=${event.eventType}`}
        className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-medium whitespace-nowrap"
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

  const {
    data: todayEvents,
    isLoading: todayLoading,
    error: todayError,
    refetch: refetchToday,
  } = useTodayEvents();

  const {
    data: upcomingEventsData,
    isLoading: upcomingLoading,
    error: upcomingError,
    refetch: refetchUpcoming,
  } = useUpcomingEvents(30);

  const isLoading = todayLoading || upcomingLoading;
  const hasError = todayError || upcomingError;

  // Backend already limits to 3 events for free users, so no need to manually slice
  const upcomingEvents = upcomingEventsData || [];

  const hasTodayEvents = todayEvents && todayEvents.length > 0;
  const hasUpcomingEvents = upcomingEvents.length > 0;
  const hasAnyEvents = hasTodayEvents || hasUpcomingEvents;

  return (
    <WidgetCard
      title="Calendario Sagrado"
      titleAs="h3"
      icon={<CalendarHeart className="h-5 w-5" />}
      data-testid="sacred-events-widget"
      action={
        isPremium && (
          <Link
            href="/rituales"
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
          >
            Ver todo
            <ChevronRight className="h-4 w-4" />
          </Link>
        )
      }
    >
      {/* Loading State */}
      {isLoading && (
        <div className="py-8">
          <Spinner size="md" text="Cargando eventos..." />
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <ErrorDisplay
          message="Error al cargar eventos"
          onRetry={() => {
            void refetchToday();
            void refetchUpcoming();
          }}
          className="py-4"
        />
      )}

      {/* Empty State */}
      {!isLoading && !hasError && !hasAnyEvents && (
        <WidgetEmptyState
          illustration={{
            src: '/images/dashboard/empty-calendar.webp',
            alt: 'Rueda del año y fases lunares sobre un fondo violeta etéreo',
          }}
          title="Sin eventos próximos"
          message="No hay eventos próximos en el calendario sagrado."
          cta={{ label: 'Explorar rituales', href: ROUTES.RITUALES }}
          className="py-4"
        />
      )}

      {/* Content */}
      {!isLoading && !hasError && hasAnyEvents && (
        <div className="space-y-4">
          {/* Today Events */}
          {hasTodayEvents && (
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                <span className="bg-primary/10 text-primary inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
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
                <h4 className="text-foreground mt-4 mb-3 text-sm font-medium">Próximos eventos</h4>
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
        <div className="border-border mt-4 border-t pt-4">
          <PremiumUpsellCard
            title="Desbloquea el calendario completo"
            description="Accede a todos los eventos sagrados del año y planifica tus rituales con anticipación."
            href="/premium"
            ctaLabel={CTA_PREMIUM.UPSELL_SOFT}
          />
        </div>
      )}
    </WidgetCard>
  );
}
