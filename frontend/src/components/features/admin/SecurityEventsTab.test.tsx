/**
 * Tests for SecurityEventsTab component
 *
 * Verifica que el componente consume el contrato estándar de paginación:
 * { data: [...], meta: { page, limit, totalItems, totalPages } }
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { SecurityEventsTab } from './SecurityEventsTab';
import * as useAdminSecurity from '@/hooks/api/useAdminSecurity';
import type { SecurityEventsResponse } from '@/types/admin-security.types';

vi.mock('@/hooks/api/useAdminSecurity');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

const mockEvent = {
  id: 'abc-123',
  eventType: 'failed_login' as const,
  severity: 'medium' as const,
  userId: 1,
  ipAddress: '192.168.1.1',
  details: 'Login failed',
  createdAt: '2026-01-01T10:00:00Z',
};

/** Helper para construir un mock tipado de UseQueryResult sin repetir boilerplate */
function mockQueryResult(
  overrides: Partial<UseQueryResult<SecurityEventsResponse, Error>>
): UseQueryResult<SecurityEventsResponse, Error> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    isPending: false,
    isFetching: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isLoadingError: false,
    isRefetchError: false,
    isPlaceholderData: false,
    isStale: false,
    isRefetching: false,
    isInitialLoading: false,
    status: 'pending',
    fetchStatus: 'idle',
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    dataUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    refetch: vi.fn(),
    promise: Promise.resolve({} as SecurityEventsResponse),
    ...overrides,
  } as UseQueryResult<SecurityEventsResponse, Error>;
}

describe('SecurityEventsTab', () => {
  it('should render loading state', () => {
    vi.mocked(useAdminSecurity.useSecurityEvents).mockReturnValue(
      mockQueryResult({ data: undefined, isLoading: true, isError: false })
    );

    render(<SecurityEventsTab />, { wrapper: createWrapper() });

    // Skeletons visible
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.mocked(useAdminSecurity.useSecurityEvents).mockReturnValue(
      mockQueryResult({ data: undefined, isLoading: false, isError: true })
    );

    render(<SecurityEventsTab />, { wrapper: createWrapper() });

    expect(screen.getByText('Error al cargar eventos de seguridad')).toBeInTheDocument();
  });

  it('should render events from data.data (standard contract)', () => {
    vi.mocked(useAdminSecurity.useSecurityEvents).mockReturnValue(
      mockQueryResult({
        data: {
          data: [mockEvent],
          meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
        },
        isLoading: false,
        isError: false,
      })
    );

    render(<SecurityEventsTab />, { wrapper: createWrapper() });

    expect(screen.getByText('failed login')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('should render empty state when data.data is empty', () => {
    vi.mocked(useAdminSecurity.useSecurityEvents).mockReturnValue(
      mockQueryResult({
        data: {
          data: [],
          meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
        },
        isLoading: false,
        isError: false,
      })
    );

    render(<SecurityEventsTab />, { wrapper: createWrapper() });

    expect(screen.getByText('Sin eventos')).toBeInTheDocument();
  });

  it('should show pagination when totalPages > 1', () => {
    const mockEvents = Array.from({ length: 10 }, (_, i) => ({
      ...mockEvent,
      id: `event-${i}`,
    }));

    vi.mocked(useAdminSecurity.useSecurityEvents).mockReturnValue(
      mockQueryResult({
        data: {
          data: mockEvents,
          meta: { page: 1, limit: 10, totalItems: 25, totalPages: 3 },
        },
        isLoading: false,
        isError: false,
      })
    );

    render(<SecurityEventsTab />, { wrapper: createWrapper() });

    // Pagination buttons should be visible (Anterior/Siguiente)
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
  });

  it('should NOT render pagination buttons when totalPages <= 1', () => {
    vi.mocked(useAdminSecurity.useSecurityEvents).mockReturnValue(
      mockQueryResult({
        data: {
          data: [mockEvent],
          meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
        },
        isLoading: false,
        isError: false,
      })
    );

    render(<SecurityEventsTab />, { wrapper: createWrapper() });

    expect(screen.queryByRole('button', { name: /anterior/i })).not.toBeInTheDocument();
  });

  it('should clear filters when Limpiar Filtros is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(useAdminSecurity.useSecurityEvents).mockReturnValue(
      mockQueryResult({
        data: {
          data: [],
          meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
        },
        isLoading: false,
        isError: false,
      })
    );

    render(<SecurityEventsTab />, { wrapper: createWrapper() });

    const clearButton = screen.getByRole('button', { name: /limpiar filtros/i });
    await user.click(clearButton);

    // After clearing, hook should be called with default filters
    expect(useAdminSecurity.useSecurityEvents).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 })
    );
  });

  it('should display severity badge with correct style', () => {
    vi.mocked(useAdminSecurity.useSecurityEvents).mockReturnValue(
      mockQueryResult({
        data: {
          data: [{ ...mockEvent, severity: 'critical' as const }],
          meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
        },
        isLoading: false,
        isError: false,
      })
    );

    render(<SecurityEventsTab />, { wrapper: createWrapper() });

    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });
});
