/**
 * Tests for useSacredCalendar hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useUpcomingEvents,
  useTodayEvents,
  useMonthEvents,
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
    eventDate: '2026-01-17',
    eventTime: '18:00',
    importance: ImportanceLevel.HIGH,
    energyDescription: 'Energía de nuevos comienzos',
    suggestedRitualCategories: [RitualCategory.LUNAR],
    suggestedRitualIds: null,
    lunarPhase: 'new_moon',
    sabbat: null,
    hemisphere: 'south',
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
    expect(sacredCalendarApi.getUpcomingEvents).toHaveBeenCalledWith(undefined);
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
      eventDate: '2026-01-17',
      eventTime: '12:00',
      importance: ImportanceLevel.HIGH,
      energyDescription: 'Energía especial',
      suggestedRitualCategories: [RitualCategory.LUNAR, RitualCategory.MEDITATION],
      suggestedRitualIds: null,
      lunarPhase: 'new_moon',
      sabbat: null,
      hemisphere: 'south',
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

describe('useMonthEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvent: SacredEvent = {
    id: 2,
    name: 'Imbolc',
    slug: 'imbolc-2026',
    description: 'Sabbat de purificación',
    eventType: SacredEventType.SABBAT,
    eventDate: '2026-02-02',
    eventTime: '00:00',
    importance: ImportanceLevel.HIGH,
    energyDescription: 'Energía de limpieza',
    suggestedRitualCategories: [RitualCategory.CLEANSING],
    suggestedRitualIds: null,
    lunarPhase: null,
    sabbat: 'imbolc',
    hemisphere: 'south',
  };

  it('should fetch events for a specific month', async () => {
    const mockData = [mockEvent];
    vi.mocked(sacredCalendarApi.getMonthEvents).mockResolvedValue(mockData);

    const { result } = renderHook(() => useMonthEvents(2026, 2), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(sacredCalendarApi.getMonthEvents).toHaveBeenCalledWith(2026, 2);
  });

  it('should not fetch when year or month are invalid', () => {
    vi.mocked(sacredCalendarApi.getMonthEvents).mockResolvedValue([]);

    const { result } = renderHook(() => useMonthEvents(0, 0), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('pending');
    expect(sacredCalendarApi.getMonthEvents).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Error al obtener eventos del mes');
    vi.mocked(sacredCalendarApi.getMonthEvents).mockRejectedValue(error);

    const { result } = renderHook(() => useMonthEvents(2026, 2), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('sacredCalendarKeys', () => {
  it('should generate correct query keys', () => {
    expect(sacredCalendarKeys.all).toEqual(['sacred-calendar']);
    expect(sacredCalendarKeys.upcoming(30)).toEqual(['sacred-calendar', 'upcoming', 30]);
    expect(sacredCalendarKeys.today()).toEqual(['sacred-calendar', 'today']);
    expect(sacredCalendarKeys.month(2026, 2)).toEqual(['sacred-calendar', 'month', 2026, 2]);
  });
});
