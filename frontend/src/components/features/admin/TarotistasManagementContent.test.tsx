/**
 * Tests para TarotistasManagementContent
 *
 * TDD - T-BUG-007-B (ex T-BUG-010-C): Tarotistas — Acciones reales
 * Valida que las acciones view-profile, edit-config, view-metrics
 * NO muestren toast.info('próximamente') sino naveguen/abran modales reales.
 *
 * Estrategia: mockeamos TarotistasTable para capturar el prop `onAction`
 * y llamarlo directamente, evitando la complejidad del DropdownMenu de Radix
 * en jsdom (que no renderiza portales sin setup adicional).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { TarotistasManagementContent } from './TarotistasManagementContent';
import type { AdminTarotistasResponse, AdminTarotista } from '@/types/admin-tarotistas.types';

// ---- Mocks ----

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

// Mock TarotistasTable: captura onAction y expone un botón por acción
let capturedOnAction: ((action: string, tarotista: AdminTarotista) => void) | null = null;

vi.mock('./TarotistasTable', () => ({
  TarotistasTable: ({
    tarotistas,
    onAction,
  }: {
    tarotistas: AdminTarotista[];
    onAction: (action: string, tarotista: AdminTarotista) => void;
  }) => {
    capturedOnAction = onAction;
    return createElement(
      'div',
      { 'data-testid': 'tarotistas-table' },
      tarotistas.map((t) =>
        createElement(
          'div',
          { key: t.id },
          createElement(
            'button',
            {
              'data-testid': `action-view-profile-${t.id}`,
              onClick: () => onAction('view-profile', t),
            },
            'Ver perfil'
          ),
          createElement(
            'button',
            {
              'data-testid': `action-edit-config-${t.id}`,
              onClick: () => onAction('edit-config', t),
            },
            'Editar config'
          ),
          createElement(
            'button',
            {
              'data-testid': `action-view-metrics-${t.id}`,
              onClick: () => onAction('view-metrics', t),
            },
            'Ver métricas'
          )
        )
      )
    );
  },
}));

import { useAdminTarotistas, useTarotistaApplications } from '@/hooks/api/useAdminTarotistas';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ---- Fixtures ----

const mockTarotista: AdminTarotista = {
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

// ---- Tests ----

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
    capturedOnAction = null;

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

  // T-ADM-003 (Opción B): view-profile NO debe navegar a ruta inexistente
  it('acción view-profile NO debe navegar (dead-link deshabilitado — ADM-003)', async () => {
    render(<TarotistasManagementContent />, { wrapper });

    const btn = screen.getByTestId(`action-view-profile-${mockTarotista.id}`);
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    // Con Opción B el router.push no se llama para view-profile
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalledWith(`/admin/tarotistas/${mockTarotista.id}`);
    });
  });

  // T-ADM-003 (Opción B): edit-config NO debe navegar a configuracion/ inexistente
  it('acción edit-config NO debe navegar a /admin/tarotistas/[id]/configuracion (ADM-003)', async () => {
    render(<TarotistasManagementContent />, { wrapper });

    const btn = screen.getByTestId(`action-edit-config-${mockTarotista.id}`);
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    // El modal se abre pero "Ir a Configuración" no navega a la ruta inexistente
    await waitFor(() => {
      expect(screen.getByTestId('tarotista-config-modal')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalledWith(
      `/admin/tarotistas/${mockTarotista.id}/configuracion`
    );
  });

  it('acción view-metrics debe abrir modal y NO mostrar toast.info con "próximamente"', async () => {
    render(<TarotistasManagementContent />, { wrapper });

    const btn = screen.getByTestId(`action-view-metrics-${mockTarotista.id}`);
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('tarotista-metrics-modal')).toBeInTheDocument();
    });
    expect(toast.info).not.toHaveBeenCalledWith(expect.stringContaining('próximamente'));
  });

  it('modal de métricas debe mostrar datos del tarotista seleccionado', async () => {
    render(<TarotistasManagementContent />, { wrapper });

    fireEvent.click(screen.getByTestId(`action-view-metrics-${mockTarotista.id}`));

    await waitFor(() => {
      expect(screen.getByTestId('tarotista-metrics-modal')).toBeInTheDocument();
    });
    expect(screen.getByText('150')).toBeInTheDocument(); // totalLecturas
    expect(screen.getByText('$7500.00')).toBeInTheDocument(); // totalIngresos
  });
});
