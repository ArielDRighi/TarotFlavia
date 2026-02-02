/**
 * Tests for useSacredCalendar hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useUpcomingEvents,
  useTodayEvents,
  useEventsByDateRange,
  useSacredEvent,
  sacredCalendarKeys,
} from './useSacredCalendar';
import * as sacredCalendarApi from '@/lib/api/sacred-calendar-api';
import { SacredEventType, ImportanceLevel, type SacredEvent } from '@/types/sacred-calendar.types';
import { RitualCategory } from '@/types/ritual.types';
import React from 'react';

// Mock the API
vi.mock('@/lib/api/sacred-calendar-api');

// Helper to create QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useUpcomingEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvent: SacredEvent = {
    id: 1,
    name: 'Luna Nueva en Capricornio',
    slug: 'luna-nueva-capricornio-2026',
    description: 'Primera luna nueva del año',
    eventType: SacredEventType.LUNAR_PHASE,
    eventDate: '2026-01-17T18:00:00Z',
    importance: ImportanceLevel.HIGH,
    energyDescription: 'Energía de nuevos comienzos',
    suggestedRitualCategories: [RitualCategory.LUNAR],
    lunarPhase: 'new_moon',
  };

  it('should fetch upcoming events with default days', async () => {
    const mockData = [mockEvent];
    vi.mocked(sacredCalendarApi.getUpcomingEvents).mockResolvedValue(mockData);

    const { result } = renderHook(() => useUpcomingEvents(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(sacredCalendarApi.getUpcomingEvents).toHaveBeenCalledWith(7);
  });

  it('should fetch upcoming events with custom days', async () => {
    const mockData = [mockEvent];
    vi.mocked(sacredCalendarApi.getUpcomingEvents).mockResolvedValue(mockData);

    const { result } = renderHook(() => useUpcomingEvents(14), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(sacredCalendarApi.getUpcomingEvents).toHaveBeenCalledWith(14);
  });

  it('should handle errors', async () => {
    const error = new Error('Error al obtener eventos');
    vi.mocked(sacredCalendarApi.getUpcomingEvents).mockRejectedValue(error);

    const { result } = renderHook(() => useUpcomingEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('useTodayEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch today events', async () => {
    const mockEvent: SacredEvent = {
      id: 1,
      name: 'Luna Nueva',
      slug: 'luna-nueva-2026',
      description: 'Evento de hoy',
      eventType: SacredEventType.LUNAR_PHASE,
      eventDate: new Date().toISOString(),
      importance: ImportanceLevel.HIGH,
      energyDescription: 'Energía especial',
      suggestedRitualCategories: [RitualCategory.LUNAR, RitualCategory.MEDITATION],
      lunarPhase: 'new_moon',
    };

    const mockData = [mockEvent];
    vi.mocked(sacredCalendarApi.getTodayEvents).mockResolvedValue(mockData);

    const { result } = renderHook(() => useTodayEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(sacredCalendarApi.getTodayEvents).toHaveBeenCalled();
  });

  it('should return empty array when no events today', async () => {
    vi.mocked(sacredCalendarApi.getTodayEvents).mockResolvedValue([]);

    const { result } = renderHook(() => useTodayEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('should handle errors', async () => {
    const error = new Error('Error al obtener eventos de hoy');
    vi.mocked(sacredCalendarApi.getTodayEvents).mockRejectedValue(error);

    const { result } = renderHook(() => useTodayEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('useEventsByDateRange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const startDate = '2026-01-01T00:00:00Z';
  const endDate = '2026-01-31T23:59:59Z';

  const mockEvent: SacredEvent = {
    id: 2,
    name: 'Imbolc',
    slug: 'imbolc-2026',
    description: 'Sabbat de purificación',
    eventType: SacredEventType.SABBAT,
    eventDate: '2026-02-02T00:00:00Z',
    importance: ImportanceLevel.HIGH,
    energyDescription: 'Energía de limpieza',
    suggestedRitualCategories: [RitualCategory.CLEANSING],
    lunarPhase: null,
  };

  it('should fetch events by date range', async () => {
    const mockData = [mockEvent];
    vi.mocked(sacredCalendarApi.getEventsByDateRange).mockResolvedValue(mockData);

    const { result } = renderHook(() => useEventsByDateRange(startDate, endDate), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(sacredCalendarApi.getEventsByDateRange).toHaveBeenCalledWith(
      startDate,
      endDate,
      undefined
    );
  });

  it('should fetch events with filters', async () => {
    const mockData = [mockEvent];
    vi.mocked(sacredCalendarApi.getEventsByDateRange).mockResolvedValue(mockData);

    const filters = {
      eventType: SacredEventType.SABBAT,
      importance: ImportanceLevel.HIGH,
    };

    const { result } = renderHook(() => useEventsByDateRange(startDate, endDate, filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(sacredCalendarApi.getEventsByDateRange).toHaveBeenCalledWith(
      startDate,
      endDate,
      filters
    );
  });

  it('should not fetch when dates are not provided', () => {
    vi.mocked(sacredCalendarApi.getEventsByDateRange).mockResolvedValue([]);

    const { result } = renderHook(() => useEventsByDateRange('', ''), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('pending');
    expect(sacredCalendarApi.getEventsByDateRange).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Error al obtener eventos por rango');
    vi.mocked(sacredCalendarApi.getEventsByDateRange).mockRejectedValue(error);

    const { result } = renderHook(() => useEventsByDateRange(startDate, endDate), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('useSacredEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvent: SacredEvent = {
    id: 1,
    name: 'Luna Nueva',
    slug: 'luna-nueva-2026',
    description: 'Evento detallado',
    eventType: SacredEventType.LUNAR_PHASE,
    eventDate: '2026-01-17T18:00:00Z',
    importance: ImportanceLevel.HIGH,
    energyDescription: 'Energía detallada',
    suggestedRitualCategories: [RitualCategory.LUNAR, RitualCategory.MEDITATION],
    lunarPhase: 'new_moon',
  };

  it('should fetch event by ID', async () => {
    vi.mocked(sacredCalendarApi.getEventById).mockResolvedValue(mockEvent);

    const { result } = renderHook(() => useSacredEvent(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockEvent);
    expect(sacredCalendarApi.getEventById).toHaveBeenCalledWith(1);
  });

  it('should not fetch when ID is invalid', () => {
    vi.mocked(sacredCalendarApi.getEventById).mockResolvedValue(mockEvent);

    const { result } = renderHook(() => useSacredEvent(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('pending');
    expect(sacredCalendarApi.getEventById).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Evento no encontrado');
    vi.mocked(sacredCalendarApi.getEventById).mockRejectedValue(error);

    const { result } = renderHook(() => useSacredEvent(999), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('sacredCalendarKeys', () => {
  it('should generate correct query keys', () => {
    expect(sacredCalendarKeys.all).toEqual(['sacred-calendar']);
    expect(sacredCalendarKeys.upcoming(7)).toEqual(['sacred-calendar', 'upcoming', 7]);
    expect(sacredCalendarKeys.today()).toEqual(['sacred-calendar', 'today']);
    expect(sacredCalendarKeys.byDateRange('2026-01-01T00:00:00Z', '2026-01-31T23:59:59Z')).toEqual([
      'sacred-calendar',
      'range',
      '2026-01-01T00:00:00Z',
      '2026-01-31T23:59:59Z',
      undefined,
    ]);
    expect(sacredCalendarKeys.detail(1)).toEqual(['sacred-calendar', 'detail', 1]);
  });
});
