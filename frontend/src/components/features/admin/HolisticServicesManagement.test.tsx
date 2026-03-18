/**
 * HolisticServicesManagement Component Tests
 * TDD: Tests escritos ANTES de la implementación
 *
 * Verifica el flujo de admin sin botón de aprobación manual.
 * Tab 2 ahora es "Historial de Transacciones" (solo lectura).
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HolisticServicesManagement } from './HolisticServicesManagement';
import type { HolisticServiceAdmin, ServicePurchase } from '@/types';

// Mock de hooks
vi.mock('@/hooks/api/useAdminHolisticServices', () => ({
  useAdminHolisticServices: vi.fn(),
  useAllPurchases: vi.fn(),
  useCreateHolisticService: vi.fn(),
  useUpdateHolisticService: vi.fn(),
}));

import {
  useAdminHolisticServices,
  useAllPurchases,
  useCreateHolisticService,
  useUpdateHolisticService,
} from '@/hooks/api/useAdminHolisticServices';

const mockServices: HolisticServiceAdmin[] = [
  {
    id: 1,
    name: 'Árbol Genealógico',
    slug: 'arbol-genealogico',
    shortDescription: 'Sanación de linaje familiar',
    longDescription: 'Descripción larga',
    priceArs: 15000,
    durationMinutes: 60,
    sessionType: 'family_tree',
    whatsappNumber: '+54911234567',
    mercadoPagoLink: 'https://mpago.la/test1',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockPurchases: ServicePurchase[] = [
  {
    id: 10,
    userId: 5,
    holisticServiceId: 1,
    holisticService: {
      id: 1,
      name: 'Árbol Genealógico',
      slug: 'arbol-genealogico',
      durationMinutes: 60,
      sessionType: 'family_tree',
    },
    sessionId: null,
    paymentStatus: 'paid',
    amountArs: 15000,
    paymentReference: null,
    paidAt: '2026-03-01T14:00:00.000Z',
    initPoint: null,
    mercadoPagoPaymentId: 'MP-98765',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T14:00:00.000Z',
  },
];

describe('HolisticServicesManagement', () => {
  beforeEach(() => {
    vi.mocked(useAdminHolisticServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAdminHolisticServices>);

    vi.mocked(useAllPurchases).mockReturnValue({
      data: mockPurchases,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAllPurchases>);

    vi.mocked(useCreateHolisticService).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateHolisticService>);

    vi.mocked(useUpdateHolisticService).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateHolisticService>);
  });

  it('should render tabs for services and transaction history', () => {
    render(<HolisticServicesManagement />);

    expect(screen.getByRole('tab', { name: /servicios/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /historial de transacciones/i })).toBeInTheDocument();
  });

  it('should NOT render a "Pagos Pendientes" tab', () => {
    render(<HolisticServicesManagement />);

    expect(screen.queryByRole('tab', { name: /pagos pendientes/i })).not.toBeInTheDocument();
  });

  it('should show services in Servicios tab by default', () => {
    render(<HolisticServicesManagement />);

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
  });

  it('should switch to Historial de Transacciones tab when clicked', async () => {
    render(<HolisticServicesManagement />);

    const historialTab = screen.getByRole('tab', { name: /historial de transacciones/i });
    fireEvent.click(historialTab);

    await waitFor(() => {
      expect(screen.getByTestId('transactions-table')).toBeInTheDocument();
    });
  });

  it('should show transaction data in historial tab', async () => {
    render(<HolisticServicesManagement />);

    const historialTab = screen.getByRole('tab', { name: /historial de transacciones/i });
    fireEvent.click(historialTab);

    await waitFor(() => {
      expect(screen.getByText('MP-98765')).toBeInTheDocument();
    });
  });

  it('should NOT show an approve button anywhere', async () => {
    render(<HolisticServicesManagement />);

    // Check services tab
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();

    // Check historial tab
    const historialTab = screen.getByRole('tab', { name: /historial de transacciones/i });
    fireEvent.click(historialTab);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
    });
  });

  it('should open EditServiceModal when edit button is clicked', async () => {
    render(<HolisticServicesManagement />);

    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should show loading skeleton while loading services', () => {
    vi.mocked(useAdminHolisticServices).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useAdminHolisticServices>);

    render(<HolisticServicesManagement />);

    expect(screen.getByTestId('services-loading')).toBeInTheDocument();
  });

  it('should show loading skeleton while loading transactions', async () => {
    vi.mocked(useAllPurchases).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useAllPurchases>);

    render(<HolisticServicesManagement />);

    const historialTab = screen.getByRole('tab', { name: /historial de transacciones/i });
    fireEvent.click(historialTab);

    await waitFor(() => {
      expect(screen.getByTestId('transactions-loading')).toBeInTheDocument();
    });
  });

  it('should show error state when services fetch fails', () => {
    vi.mocked(useAdminHolisticServices).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Error de red'),
    } as ReturnType<typeof useAdminHolisticServices>);

    render(<HolisticServicesManagement />);

    expect(screen.getByText(/error al cargar servicios/i)).toBeInTheDocument();
  });

  it('should show error state when transactions fetch fails', async () => {
    vi.mocked(useAllPurchases).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Error de red'),
    } as ReturnType<typeof useAllPurchases>);

    render(<HolisticServicesManagement />);

    const historialTab = screen.getByRole('tab', { name: /historial de transacciones/i });
    fireEvent.click(historialTab);

    await waitFor(() => {
      expect(screen.getByText(/error al cargar historial/i)).toBeInTheDocument();
    });
  });

  it('should show "Nuevo Servicio" button in services tab', () => {
    render(<HolisticServicesManagement />);

    expect(screen.getByRole('button', { name: /nuevo servicio/i })).toBeInTheDocument();
  });

  it('should have correct data-testid', () => {
    render(<HolisticServicesManagement />);

    expect(screen.getByTestId('holistic-services-management')).toBeInTheDocument();
  });
});
