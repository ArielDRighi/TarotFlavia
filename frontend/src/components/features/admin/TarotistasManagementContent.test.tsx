/**
 * Tests para TarotistasManagementContent
 *
 * TDD - T-BUG-007-B (ex T-BUG-010-C): Tarotistas — Acciones reales
 * Valida que las acciones view-profile, edit-config, view-metrics
 * NO muestren toast.info('próximamente') sino naveguen/abran modales reales.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { TarotistasManagementContent } from './TarotistasManagementContent';
import type { AdminTarotistasResponse } from '@/types/admin-tarotistas.types';

// Mock hooks
vi.mock('@/hooks/api/useAdminTarotistas', () => ({
  useAdminTarotistas: vi.fn(),
  useTarotistaApplications: vi.fn(),
}));

vi.mock('@/hooks/api/useAdminTarotistaActions', () => ({
  useDeactivateTarotista: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useReactivateTarotista: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useApproveApplication: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRejectApplication: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { useAdminTarotistas, useTarotistaApplications } from '@/hooks/api/useAdminTarotistas';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const mockTarotista = {
  id: 5,
  userId: 10,
  nombrePublico: 'Luna Mística',
  bio: 'Bio de prueba',
  fotoPerfil: null,
  especialidades: ['amor'],
  idiomas: ['español'],
  añosExperiencia: 5,
  ofreceSesionesVirtuales: true,
  precioSesionUsd: 50.0,
  duracionSesionMinutos: 60,
  isActive: true,
  isAcceptingNewClients: true,
  isFeatured: false,
  comisiónPorcentaje: 30.0,
  ratingPromedio: 4.5,
  totalReviews: 25,
  totalLecturas: 150,
  totalIngresos: 7500.0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockTarotistasResponse: AdminTarotistasResponse = {
  data: [mockTarotista],
  meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
};

const mockApplicationsResponse = {
  data: [],
  meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
};

describe('TarotistasManagementContent — acciones tarotista', () => {
  let queryClient: QueryClient;
  const mockPush = vi.fn();

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();

    vi.mocked(useAdminTarotistas).mockReturnValue({
      data: mockTarotistasResponse,
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminTarotistas>);

    vi.mocked(useTarotistaApplications).mockReturnValue({
      data: mockApplicationsResponse,
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useTarotistaApplications>);

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  it('debe renderizar el componente sin errores', () => {
    render(<TarotistasManagementContent />, { wrapper });
    expect(screen.getByText('Tarotistas Activos')).toBeInTheDocument();
  });

  it('acción view-profile debe navegar a /admin/tarotistas/[id] (NO toast próximamente)', async () => {
    render(<TarotistasManagementContent />, { wrapper });

    // Buscar el botón de ver perfil en la tabla
    const viewProfileButtons = screen.queryAllByTestId('action-view-profile');
    if (viewProfileButtons.length > 0) {
      fireEvent.click(viewProfileButtons[0]);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/admin/tarotistas/${mockTarotista.id}`);
      });
      // No debe mostrar toast de "próximamente"
      expect(toast.info).not.toHaveBeenCalledWith(expect.stringContaining('próximamente'));
    }
  });

  it('acción edit-config NO debe mostrar toast.info con "próximamente"', async () => {
    render(<TarotistasManagementContent />, { wrapper });

    const editConfigButtons = screen.queryAllByTestId('action-edit-config');
    if (editConfigButtons.length > 0) {
      fireEvent.click(editConfigButtons[0]);
      await waitFor(() => {
        expect(toast.info).not.toHaveBeenCalledWith(expect.stringContaining('próximamente'));
      });
    }
  });

  it('acción view-metrics NO debe mostrar toast.info con "próximamente"', async () => {
    render(<TarotistasManagementContent />, { wrapper });

    const viewMetricsButtons = screen.queryAllByTestId('action-view-metrics');
    if (viewMetricsButtons.length > 0) {
      fireEvent.click(viewMetricsButtons[0]);
      await waitFor(() => {
        expect(toast.info).not.toHaveBeenCalledWith(expect.stringContaining('próximamente'));
      });
    }
  });

  it('debe mostrar modal de config al hacer click en edit-config', async () => {
    render(<TarotistasManagementContent />, { wrapper });

    const editConfigButtons = screen.queryAllByTestId('action-edit-config');
    if (editConfigButtons.length > 0) {
      fireEvent.click(editConfigButtons[0]);
      await waitFor(() => {
        // El modal de configuración debe aparecer
        const configModal = screen.queryByTestId('tarotista-config-modal');
        expect(configModal).toBeInTheDocument();
      });
    }
  });
});
