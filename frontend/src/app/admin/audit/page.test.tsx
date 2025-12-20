/**
 * Tests for AuditLogsPage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import AuditLogsPage from './page';
import * as useAuditLogsHook from '@/hooks/api/useAuditLogs';
import type { AuditLogsResponse } from '@/types/admin-audit.types';

vi.mock('@/hooks/api/useAuditLogs');

type MockUseAuditLogsReturn = Partial<ReturnType<typeof useAuditLogsHook.useAuditLogs>>;

describe('AuditLogsPage', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should render page title and description', () => {
    vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as MockUseAuditLogsReturn as ReturnType<typeof useAuditLogsHook.useAuditLogs>);

    render(<AuditLogsPage />, { wrapper });

    expect(screen.getByText('Registro de Auditoría')).toBeInTheDocument();
    expect(screen.getByText('Historial de todas las acciones administrativas')).toBeInTheDocument();
  });

  it('should show loading skeleton while fetching', () => {
    vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as MockUseAuditLogsReturn as ReturnType<typeof useAuditLogsHook.useAuditLogs>);

    render(<AuditLogsPage />, { wrapper });

    // Verificar que se muestran skeletons
    const skeletons = screen.getAllByTestId(/skeleton/i);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render audit logs table with data', async () => {
    const mockData: AuditLogsResponse = {
      logs: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: 1,
          user: { id: 1, email: 'admin@example.com', name: 'Admin User' },
          targetUserId: null,
          targetUser: null,
          action: 'user_banned',
          entityType: 'User',
          entityId: '123',
          oldValue: null,
          newValue: { status: 'banned' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: '2025-12-14T10:00:00Z',
        },
      ],
      meta: {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 1,
        totalPages: 1,
      },
    };

    vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as MockUseAuditLogsReturn as ReturnType<typeof useAuditLogsHook.useAuditLogs>);

    render(<AuditLogsPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    expect(screen.getByText('user_banned')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('should show empty state when no logs', async () => {
    const mockData: AuditLogsResponse = {
      logs: [],
      meta: {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0,
        totalPages: 0,
      },
    };

    vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as MockUseAuditLogsReturn as ReturnType<typeof useAuditLogsHook.useAuditLogs>);

    render(<AuditLogsPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/no se encontraron/i)).toBeInTheDocument();
    });
  });

  it('should render filter controls', () => {
    vi.mocked(useAuditLogsHook.useAuditLogs).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as MockUseAuditLogsReturn as ReturnType<typeof useAuditLogsHook.useAuditLogs>);

    render(<AuditLogsPage />, { wrapper });

    // Verificar que existen controles de filtro
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByText('Limpiar Filtros')).toBeInTheDocument();
  });

  it('should handle filter changes', async () => {
    const mockUseAuditLogs = vi.fn().mockReturnValue({
      data: {
        logs: [],
        meta: { currentPage: 1, itemsPerPage: 20, totalItems: 0, totalPages: 0 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    vi.mocked(useAuditLogsHook.useAuditLogs).mockImplementation(mockUseAuditLogs);

    render(<AuditLogsPage />, { wrapper });

    // Click en limpiar filtros
    const clearButton = screen.getByText('Limpiar Filtros');
    fireEvent.click(clearButton);

    // Verificar que se resetean los filtros
    await waitFor(() => {
      expect(mockUseAuditLogs).toHaveBeenCalled();
    });
  });
});
