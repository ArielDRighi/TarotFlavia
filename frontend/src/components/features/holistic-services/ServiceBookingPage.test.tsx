/**
 * Tests for ServiceBookingPage component
 *
 * TDD RED phase — tests written before implementation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServiceBookingPage } from './ServiceBookingPage';
import * as useHolisticServicesHook from '@/hooks/api/useHolisticServices';
import * as useSessionsHook from '@/hooks/api/useSessions';
import type { ServicePurchase } from '@/types';

vi.mock('@/hooks/api/useHolisticServices', () => ({
  usePurchaseDetail: vi.fn(),
}));

vi.mock('@/hooks/api/useSessions', () => ({
  useBookSession: vi.fn(),
}));

// Mock BookingCalendar
vi.mock('@/components/features/marketplace/BookingCalendar', () => ({
  BookingCalendar: ({
    readOnly,
    onBook,
  }: {
    readOnly?: boolean;
    onBook: (date: string, time: string, duration: number) => void;
  }) => (
    <div data-testid="booking-calendar" data-readonly={String(readOnly ?? false)}>
      <button onClick={() => onBook('2026-04-15', '10:00', 90)} data-testid="mock-book-btn">
        Reservar mock
      </button>
    </div>
  ),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockPendingPurchase: ServicePurchase = {
  id: 42,
  userId: 7,
  holisticServiceId: 1,
  holisticService: {
    id: 1,
    name: 'Árbol Genealógico',
    slug: 'arbol-genealogico',
    durationMinutes: 90,
    sessionType: 'family_tree',
  },
  sessionId: null,
  paymentStatus: 'pending',
  amountArs: 15000,
  paymentReference: null,
  paidAt: null,
  initPoint: null,
  mercadoPagoPaymentId: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const mockPaidPurchase: ServicePurchase = {
  ...mockPendingPurchase,
  paymentStatus: 'paid',
  paidAt: '2025-01-10T12:00:00.000Z',
  whatsappNumber: '+5491112345678',
};

const mockBookedPurchase: ServicePurchase = {
  ...mockPaidPurchase,
  sessionId: 99,
};

const mockMutateAsync = vi.fn();

describe('ServiceBookingPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // ---- Loading state ----

  it('should render skeleton while purchase is loading', () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    expect(screen.getByTestId('service-booking-skeleton')).toBeInTheDocument();
  });

  // ---- Error state ----

  it('should render error state when purchase is not found', () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Compra no encontrada'),
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={999} />, { wrapper });

    expect(screen.getByTestId('service-booking-error')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mis servicios/i })).toBeInTheDocument();
  });

  // ---- Payment pending ----

  it('should show payment pending message when paymentStatus is not paid', () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockPendingPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    expect(screen.getByTestId('payment-pending-notice')).toBeInTheDocument();
    expect(screen.getByText(/pago aún está siendo verificado/i)).toBeInTheDocument();
    expect(screen.queryByTestId('booking-calendar')).not.toBeInTheDocument();
  });

  // ---- Payment approved: calendar shown ----

  it('should render booking calendar when payment is paid', () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockPaidPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    expect(screen.getByTestId('booking-calendar')).toBeInTheDocument();
    expect(screen.getByTestId('booking-calendar')).toHaveAttribute('data-readonly', 'false');
  });

  it('should have data-testid on main container when paid', () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockPaidPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    expect(screen.getByTestId('service-booking-page')).toBeInTheDocument();
  });

  // ---- Book session flow ----

  it('should call bookSession with correct data when onBook fires', async () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockPaidPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    mockMutateAsync.mockResolvedValue({ id: 99 });

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    await userEvent.click(screen.getByTestId('mock-book-btn'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          tarotistaId: 1,
          sessionDate: '2026-04-15',
          sessionTime: '10:00',
          durationMinutes: 90,
          sessionType: 'FAMILY_TREE',
        })
      );
    });
  });

  // ---- Confirmation view ----

  it('should show confirmation view after successful booking', async () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockPaidPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    mockMutateAsync.mockResolvedValue({ id: 99 });

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    await userEvent.click(screen.getByTestId('mock-book-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
    });
  });

  it('should show service name in confirmation', async () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockPaidPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    mockMutateAsync.mockResolvedValue({ id: 99 });

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    await userEvent.click(screen.getByTestId('mock-book-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
    });

    expect(screen.getByText(/Árbol Genealógico/i)).toBeInTheDocument();
  });

  it('should show WhatsApp link in confirmation', async () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockPaidPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    mockMutateAsync.mockResolvedValue({ id: 99 });

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    await userEvent.click(screen.getByTestId('mock-book-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
    });

    const waLink = screen.getByRole('link', { name: /whatsapp/i });
    expect(waLink).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });

  it('should show "Ir a Mis Servicios" button in confirmation', async () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockPaidPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    mockMutateAsync.mockResolvedValue({ id: 99 });

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    await userEvent.click(screen.getByTestId('mock-book-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /mis servicios/i })).toBeInTheDocument();
  });

  // ---- Booking error ----

  it('should show error when booking fails', async () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockPaidPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    mockMutateAsync.mockRejectedValue(new Error('Slot no disponible'));

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    await userEvent.click(screen.getByTestId('mock-book-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('booking-error-message')).toBeInTheDocument();
    });
  });

  // ---- Already booked ----

  it('should show already booked message when sessionId is not null', () => {
    vi.mocked(useHolisticServicesHook.usePurchaseDetail).mockReturnValue({
      data: mockBookedPurchase,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.usePurchaseDetail>);

    vi.mocked(useSessionsHook.useBookSession).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSessionsHook.useBookSession>);

    render(<ServiceBookingPage purchaseId={42} />, { wrapper });

    expect(screen.getByTestId('already-booked-message')).toBeInTheDocument();
    expect(screen.queryByTestId('booking-calendar')).not.toBeInTheDocument();
  });
});
