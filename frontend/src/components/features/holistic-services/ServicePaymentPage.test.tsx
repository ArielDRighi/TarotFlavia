/**
 * Tests for ServicePaymentPage component
 *
 * TDD RED phase — tests written before implementation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServicePaymentPage } from './ServicePaymentPage';
import * as useHolisticServicesHook from '@/hooks/api/useHolisticServices';
import * as useHolisticServiceMutationsHook from '@/hooks/api/useHolisticServiceMutations';
import type { HolisticServiceDetail, ServicePurchase } from '@/types';

vi.mock('@/hooks/api/useHolisticServices', () => ({
  useHolisticServiceDetail: vi.fn(),
}));

vi.mock('@/hooks/api/useHolisticServiceMutations', () => ({
  useCreatePurchase: vi.fn(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock window.open — returns a controllable tab object to test blank-tab trick
const mockMpTab = {
  location: { href: '' },
  close: vi.fn(),
};
const mockWindowOpen = vi.fn().mockReturnValue(mockMpTab);
Object.defineProperty(window, 'open', { value: mockWindowOpen, writable: true });

const mockService: HolisticServiceDetail = {
  id: 1,
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Sanación a través del árbol genealógico familiar',
  longDescription: 'Descripción larga del servicio.',
  priceArs: 15000,
  durationMinutes: 90,
  sessionType: 'family_tree',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const mockPurchase: ServicePurchase = {
  id: 42,
  userId: 7,
  holisticServiceId: 1,
  sessionId: null,
  paymentStatus: 'pending',
  amountArs: 15000,
  paymentReference: null,
  paidAt: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const mockMutateAsync = vi.fn();

describe('ServicePaymentPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    mockWindowOpen.mockReset();
    mockWindowOpen.mockReturnValue(mockMpTab);
    mockMpTab.location.href = '';
    mockMpTab.close.mockReset();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // ---- Loading state ----

  it('should render skeleton while service is loading', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByTestId('service-payment-skeleton')).toBeInTheDocument();
  });

  // ---- Error state ----

  it('should render error state when service is not found', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Servicio no encontrado'),
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="slug-inexistente" />, { wrapper });

    expect(screen.getByTestId('service-payment-error')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al catálogo/i })).toBeInTheDocument();
  });

  // ---- Happy path: payment summary ----

  it('should have data-testid attribute on main container', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByTestId('service-payment-page')).toBeInTheDocument();
  });

  it('should display the service name', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
  });

  it('should display the price formatted in ARS', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    // Price should be formatted with thousands separator and ARS label
    expect(screen.getByText(/15[\.,]000/)).toBeInTheDocument();
    expect(screen.getByText(/ARS/i)).toBeInTheDocument();
  });

  it('should display the duration in minutes', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByText(/90/)).toBeInTheDocument();
    expect(screen.getByText(/min/i)).toBeInTheDocument();
  });

  it('should render "Pagar con Mercado Pago" button', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByRole('button', { name: /pagar con mercado pago/i })).toBeInTheDocument();
  });

  // ---- Payment button click flow ----

  it('should call createPurchase with correct serviceId when button is clicked', async () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    mockMutateAsync.mockResolvedValue({
      ...mockPurchase,
      mercadoPagoUrl: 'https://mp.com/pay/123',
    });

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /pagar con mercado pago/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({ holisticServiceId: 1 });
  });

  it('should open MP link in new tab after purchase creation', async () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    mockMutateAsync.mockResolvedValue({
      ...mockPurchase,
      mercadoPagoUrl: 'https://mp.com/pay/123',
    });

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /pagar con mercado pago/i }));

    await waitFor(() => {
      // Blank tab opened first (inside user gesture to avoid popup blocker)
      expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
      // URL assigned to tab after API call resolves
      expect(mockMpTab.location.href).toBe('https://mp.com/pay/123');
    });
  });

  it('should show post-click verification message after payment initiated', async () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    mockMutateAsync.mockResolvedValue({
      ...mockPurchase,
      mercadoPagoUrl: 'https://mp.com/pay/123',
    });

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /pagar con mercado pago/i }));

    await waitFor(() => {
      expect(screen.getByTestId('payment-pending-message')).toBeInTheDocument();
    });

    expect(screen.getByText(/pago está siendo verificado/i)).toBeInTheDocument();
  });

  // ---- Error handling ----

  it('should show error message when purchase creation fails', async () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    mockMutateAsync.mockRejectedValue(new Error('Error al crear la compra'));

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /pagar con mercado pago/i }));

    await waitFor(() => {
      expect(screen.getByTestId('payment-error-message')).toBeInTheDocument();
    });
  });

  // ---- Loading state on button ----

  it('should disable button while purchase is being created', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockService,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    vi.mocked(useHolisticServiceMutationsHook.useCreatePurchase).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as unknown as ReturnType<typeof useHolisticServiceMutationsHook.useCreatePurchase>);

    render(<ServicePaymentPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByRole('button', { name: /procesando/i })).toBeDisabled();
  });
});
