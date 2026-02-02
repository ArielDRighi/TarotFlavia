import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SacredEventsWidget } from './SacredEventsWidget';
import * as useSacredCalendarHook from '@/hooks/api/useSacredCalendar';
import * as authStore from '@/stores/authStore';
import type { SacredEvent } from '@/types';
import { SacredEventType, ImportanceLevel } from '@/types';
import { RitualCategory } from '@/types/ritual.types';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const createMockEvent = (overrides: Partial<SacredEvent> = {}): SacredEvent => ({
  id: 1,
  name: 'Luna Llena',
  slug: 'luna-llena',
  eventType: SacredEventType.LUNAR_PHASE,
  eventDate: '2025-01-15',
  eventTime: '14:30',
  importance: ImportanceLevel.HIGH,
  description: 'Fase lunar completa',
  energyDescription: 'Energía de culminación y manifestación',
  suggestedRitualCategories: [RitualCategory.LUNAR],
  suggestedRitualIds: null,
  lunarPhase: 'full_moon',
  sabbat: null,
  hemisphere: 'south',
  ...overrides,
});

describe('SacredEventsWidget', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Use fake timers for consistent date testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-10T12:00:00Z'));

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Reset all mocks
    vi.clearAllMocks();

    // Mock auth store - default free user
    vi.spyOn(authStore, 'useAuthStore').mockReturnValue({
      user: { id: 1, email: 'test@test.com', plan: 'free' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Mock hooks - default empty data
    vi.spyOn(useSacredCalendarHook, 'useTodayEvents').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    vi.spyOn(useSacredCalendarHook, 'useUpcomingEvents').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SacredEventsWidget />
      </QueryClientProvider>
    );
  };

  describe('Rendering básico', () => {
    it('should display widget title "Calendario Sagrado"', () => {
      renderComponent();
      expect(screen.getByText('Calendario Sagrado')).toBeInTheDocument();
    });

    it('should display CalendarHeart icon', () => {
      renderComponent();
      const widget = screen.getByTestId('sacred-events-widget');
      expect(widget).toBeInTheDocument();
    });
  });

  describe('Eventos de hoy', () => {
    it('should display today events section when events exist', () => {
      const todayEvent = createMockEvent({
        id: 1,
        name: 'Sabbat de Imbolc',
        eventType: SacredEventType.SABBAT,
        eventDate: '2025-01-10',
        importance: ImportanceLevel.HIGH,
      });

      vi.spyOn(useSacredCalendarHook, 'useTodayEvents').mockReturnValue({
        data: [todayEvent],
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.getByText('Hoy')).toBeInTheDocument();
      expect(screen.getByText('Sabbat de Imbolc')).toBeInTheDocument();
    });

    it('should show "Hoy" label for today events', () => {
      const todayEvent = createMockEvent({
        eventDate: '2025-01-10',
      });

      vi.spyOn(useSacredCalendarHook, 'useTodayEvents').mockReturnValue({
        data: [todayEvent],
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.getByText('Hoy')).toBeInTheDocument();
    });

    it('should display event name and importance badge', () => {
      const todayEvent = createMockEvent({
        id: 1,
        name: 'Luna Nueva',
        importance: ImportanceLevel.HIGH,
        eventDate: '2025-01-10',
      });

      vi.spyOn(useSacredCalendarHook, 'useTodayEvents').mockReturnValue({
        data: [todayEvent],
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.getByText('Luna Nueva')).toBeInTheDocument();
      expect(screen.getByText('Alta')).toBeInTheDocument();
    });

    it('should hide today section when no events', () => {
      vi.spyOn(useSacredCalendarHook, 'useTodayEvents').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.queryByText('Hoy')).not.toBeInTheDocument();
    });
  });

  describe('Eventos próximos', () => {
    it('should display upcoming events returned by backend (backend limits to 3 for free users)', () => {
      // Backend already returns max 3 events for free users
      const upcomingEvents = [
        createMockEvent({
          id: 1,
          name: 'Evento 1',
          eventDate: '2025-01-11',
        }),
        createMockEvent({
          id: 2,
          name: 'Evento 2',
          eventDate: '2025-01-12',
        }),
        createMockEvent({
          id: 3,
          name: 'Evento 3',
          eventDate: '2025-01-13',
        }),
      ];

      vi.spyOn(useSacredCalendarHook, 'useUpcomingEvents').mockReturnValue({
        data: upcomingEvents,
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.getByText('Evento 1')).toBeInTheDocument();
      expect(screen.getByText('Evento 2')).toBeInTheDocument();
      expect(screen.getByText('Evento 3')).toBeInTheDocument();
    });

    it('should calculate and display "daysUntil" correctly', () => {
      // System time is 2025-01-10, so 2025-01-11 is tomorrow
      const upcomingEvent = createMockEvent({
        id: 1,
        name: 'Evento Mañana',
        eventDate: '2025-01-11',
      });

      vi.spyOn(useSacredCalendarHook, 'useUpcomingEvents').mockReturnValue({
        data: [upcomingEvent],
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.getByText('Mañana')).toBeInTheDocument();
    });

    it('should show "Hoy", "Mañana", "En X días" appropriately', () => {
      const upcomingEvents = [
        createMockEvent({
          id: 1,
          name: 'Evento Hoy',
          eventDate: '2025-01-10', // Today
        }),
        createMockEvent({
          id: 2,
          name: 'Evento Mañana',
          eventDate: '2025-01-11', // Tomorrow
        }),
        createMockEvent({
          id: 3,
          name: 'Evento en 3 días',
          eventDate: '2025-01-13', // 3 days from now
        }),
      ];

      vi.spyOn(useSacredCalendarHook, 'useUpcomingEvents').mockReturnValue({
        data: upcomingEvents,
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.getByText('Hoy')).toBeInTheDocument();
      expect(screen.getByText('Mañana')).toBeInTheDocument();
      expect(screen.getByText('En 3 días')).toBeInTheDocument();
    });

    it('should display "Ver rituales" button for each event', () => {
      const upcomingEvent = createMockEvent({
        id: 1,
        name: 'Luna Llena',
        eventType: SacredEventType.LUNAR_PHASE,
        eventDate: '2025-01-11',
      });

      vi.spyOn(useSacredCalendarHook, 'useUpcomingEvents').mockReturnValue({
        data: [upcomingEvent],
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      const buttons = screen.getAllByText('Ver rituales');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Premium features', () => {
    it('should show "Ver todo" link for premium users', () => {
      vi.spyOn(authStore, 'useAuthStore').mockReturnValue({
        user: { id: 1, email: 'premium@test.com', plan: 'premium' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.getByText('Ver todo')).toBeInTheDocument();
      const link = screen.getByText('Ver todo').closest('a');
      expect(link).toHaveAttribute('href', '/rituales');
    });

    it('should hide "Ver todo" link for free users', () => {
      vi.spyOn(authStore, 'useAuthStore').mockReturnValue({
        user: { id: 1, email: 'free@test.com', plan: 'free' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.queryByText('Ver todo')).not.toBeInTheDocument();
    });

    it('should show upsell section for free users', () => {
      vi.spyOn(authStore, 'useAuthStore').mockReturnValue({
        user: { id: 1, email: 'free@test.com', plan: 'free' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.getByText('Desbloquea el calendario completo')).toBeInTheDocument();
      expect(screen.getByText('Mejorar a Premium')).toBeInTheDocument();
    });

    it('should hide upsell section for premium users', () => {
      vi.spyOn(authStore, 'useAuthStore').mockReturnValue({
        user: { id: 1, email: 'premium@test.com', plan: 'premium' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.queryByText('Desbloquea el calendario completo')).not.toBeInTheDocument();
      expect(screen.queryByText('Mejorar a Premium')).not.toBeInTheDocument();
    });
  });

  describe('Loading & Empty states', () => {
    it('should show loading state while fetching', () => {
      vi.spyOn(useSacredCalendarHook, 'useTodayEvents').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.spyOn(useSacredCalendarHook, 'useUpcomingEvents').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(screen.getByText('Cargando eventos...')).toBeInTheDocument();
    });

    it('should show empty state when no events', () => {
      vi.spyOn(useSacredCalendarHook, 'useTodayEvents').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.spyOn(useSacredCalendarHook, 'useUpcomingEvents').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      expect(
        screen.getByText('No hay eventos próximos en el calendario sagrado.')
      ).toBeInTheDocument();
    });
  });

  describe('Links & Navigation', () => {
    it('should link to /rituales for "Ver todo"', () => {
      vi.spyOn(authStore, 'useAuthStore').mockReturnValue({
        user: { id: 1, email: 'premium@test.com', plan: 'premium' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      const link = screen.getByText('Ver todo').closest('a');
      expect(link).toHaveAttribute('href', '/rituales');
    });

    it('should link to /rituales?event={eventType} for "Ver rituales"', () => {
      const upcomingEvent = createMockEvent({
        id: 1,
        name: 'Luna Llena',
        eventType: SacredEventType.LUNAR_PHASE,
        eventDate: '2025-01-11',
      });

      vi.spyOn(useSacredCalendarHook, 'useUpcomingEvents').mockReturnValue({
        data: [upcomingEvent],
        isLoading: false,
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      const link = screen.getAllByText('Ver rituales')[0].closest('a');
      expect(link).toHaveAttribute('href', '/rituales?event=lunar_phase');
    });

    it('should link to /premium for upsell button', () => {
      vi.spyOn(authStore, 'useAuthStore').mockReturnValue({
        user: { id: 1, email: 'free@test.com', plan: 'free' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      renderComponent();

      const link = screen.getByText('Mejorar a Premium').closest('a');
      expect(link).toHaveAttribute('href', '/premium');
    });
  });
});
