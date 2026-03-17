/**
 * HolisticServicesManagement Component Tests
 * TDD: Tests escritos ANTES de la implementación
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HolisticServicesManagement } from './HolisticServicesManagement';
import type { HolisticServiceAdmin, ServicePurchase } from '@/types';

// Mock de hooks
vi.mock('@/hooks/api/useAdminHolisticServices', () => ({
  useAdminHolisticServices: vi.fn(),
  usePendingPayments: vi.fn(),
  useCreateHolisticService: vi.fn(),
  useUpdateHolisticService: vi.fn(),
  useApprovePayment: vi.fn(),
}));

import {
  useAdminHolisticServices,
  usePendingPayments,
  useCreateHolisticService,
  useUpdateHolisticService,
  useApprovePayment,
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

const mockPendingPayments: ServicePurchase[] = [
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
    paymentStatus: 'pending',
    amountArs: 15000,
    paymentReference: null,
    paidAt: null,
    initPoint: null,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
];

describe('HolisticServicesManagement', () => {
  beforeEach(() => {
    vi.mocked(useAdminHolisticServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAdminHolisticServices>);

    vi.mocked(usePendingPayments).mockReturnValue({
      data: mockPendingPayments,
      isLoading: false,
      error: null,
    } as ReturnType<typeof usePendingPayments>);

    vi.mocked(useCreateHolisticService).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateHolisticService>);

    vi.mocked(useUpdateHolisticService).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateHolisticService>);

    vi.mocked(useApprovePayment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useApprovePayment>);
  });

  it('should render tabs for services and pending payments', () => {
    render(<HolisticServicesManagement />);

    expect(screen.getByRole('tab', { name: /servicios/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pagos pendientes/i })).toBeInTheDocument();
  });

  it('should show services in Servicios tab by default', () => {
    render(<HolisticServicesManagement />);

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
  });

  it('should show pending payment badge with count', () => {
    render(<HolisticServicesManagement />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should switch to Pagos Pendientes tab when clicked', async () => {
    render(<HolisticServicesManagement />);

    const pagosTab = screen.getByRole('tab', { name: /pagos pendientes/i });
    fireEvent.click(pagosTab);

    await waitFor(() => {
      expect(screen.getByTestId('pending-payments-table')).toBeInTheDocument();
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

  it('should open ApprovePaymentDialog when approve button is clicked in payments tab', async () => {
    render(<HolisticServicesManagement />);

    const pagosTab = screen.getByRole('tab', { name: /pagos pendientes/i });
    fireEvent.click(pagosTab);

    await waitFor(() => {
      const approveButtons = screen.getAllByRole('button', { name: /aprobar/i });
      fireEvent.click(approveButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
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

  it('should show error state when services fetch fails', () => {
    vi.mocked(useAdminHolisticServices).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Error de red'),
    } as ReturnType<typeof useAdminHolisticServices>);

    render(<HolisticServicesManagement />);

    expect(screen.getByText(/error al cargar servicios/i)).toBeInTheDocument();
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
