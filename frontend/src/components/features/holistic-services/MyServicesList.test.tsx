/**
 * Tests for MyServicesList component
 *
 * TDD — tests for T-SF-D03: full appointment info in "Mis Servicios" cards.
 *
 * Covers:
 * - Skeleton while loading
 * - Empty state with catalog link
 * - Service name, duration, price in each card
 * - Status badges: Pendiente (amber), Confirmado (green), Completado (grey), Cancelado (red)
 * - Confirmed state: selectedDate + selectedTime from purchase
 * - Pending state: initPoint link to retry payment
 * - WhatsApp link shown only for confirmed/completed state
 * - "Reservar Turno" button NOT shown (deprecated flow)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyServicesList } from './MyServicesList';
import * as useHolisticServicesHook from '@/hooks/api/useHolisticServices';
import type { ServicePurchase } from '@/types';

vi.mock('@/hooks/api/useHolisticServices', () => ({
  useMyPurchases: vi.fn(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// ============================================================================
// Mock data
// ============================================================================

const mockPurchasePending: ServicePurchase = {
  id: 10,
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
  initPoint: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=abc123',
  selectedDate: null,
  selectedTime: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

// Paid purchase with selectedDate/selectedTime (new flow from T-SF-D02)
// Future date → badge "Confirmado"
const mockPurchaseConfirmed: ServicePurchase = {
  id: 11,
  userId: 7,
  holisticServiceId: 2,
  holisticService: {
    id: 2,
    name: 'Péndulo Hebreo',
    slug: 'pendulo-hebreo',
    durationMinutes: 60,
    sessionType: 'hebrew_pendulum',
  },
  sessionId: null,
  paymentStatus: 'paid',
  amountArs: 8000,
  paymentReference: 'ref-abc',
  paidAt: '2025-01-05T12:00:00.000Z',
  whatsappNumber: '+5491112345678',
  initPoint: null,
  selectedDate: '2099-12-31',
  selectedTime: '14:00',
  createdAt: '2025-01-03T00:00:00.000Z',
  updatedAt: '2025-01-05T12:00:00.000Z',
};

// Paid purchase with past date → badge "Completado"
const mockPurchaseCompleted: ServicePurchase = {
  id: 12,
  userId: 7,
  holisticServiceId: 3,
  holisticService: {
    id: 3,
    name: 'Limpieza Energética',
    slug: 'limpieza-energetica',
    durationMinutes: 60,
    sessionType: 'energy_cleaning',
  },
  sessionId: null,
  paymentStatus: 'paid',
  amountArs: 10000,
  paymentReference: 'ref-xyz',
  paidAt: '2020-02-01T12:00:00.000Z',
  whatsappNumber: '+5491112345678',
  initPoint: null,
  selectedDate: '2020-04-20',
  selectedTime: '10:00',
  createdAt: '2020-01-28T00:00:00.000Z',
  updatedAt: '2020-02-01T12:00:00.000Z',
};

const mockPurchaseCancelled: ServicePurchase = {
  id: 13,
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
  paymentStatus: 'cancelled',
  amountArs: 15000,
  paymentReference: null,
  paidAt: null,
  initPoint: null,
  selectedDate: null,
  selectedTime: null,
  createdAt: '2025-01-10T00:00:00.000Z',
  updatedAt: '2025-01-10T00:00:00.000Z',
};

// Pending purchase WITH selectedDate and selectedTime already chosen
// (e.g., user picked a slot but hasn't paid yet)
// Bug: old code would show the appointment info block because hasAppointment
// only checked selectedDate != null, ignoring paymentStatus.
const mockPurchasePendingWithDate: ServicePurchase = {
  id: 14,
  userId: 7,
  holisticServiceId: 2,
  holisticService: {
    id: 2,
    name: 'Péndulo Hebreo',
    slug: 'pendulo-hebreo',
    durationMinutes: 60,
    sessionType: 'hebrew_pendulum',
  },
  sessionId: null,
  paymentStatus: 'pending',
  amountArs: 8000,
  paymentReference: null,
  paidAt: null,
  initPoint: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=xyz789',
  selectedDate: '2099-12-31',
  selectedTime: '10:00',
  createdAt: '2025-01-15T00:00:00.000Z',
  updatedAt: '2025-01-15T00:00:00.000Z',
};

// ============================================================================
// Tests
// ============================================================================

describe('MyServicesList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // ---- Skeleton ----

  it('should render skeleton while loading', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(screen.getAllByTestId('purchase-card-skeleton').length).toBeGreaterThan(0);
  });

  // ---- Empty state ----

  it('should render empty state with catalog link when no purchases', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(screen.getByTestId('my-services-empty')).toBeInTheDocument();
    expect(screen.getByText(/no tenés servicios contratados/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver servicios/i })).toBeInTheDocument();
  });

  // ---- Main container ----

  it('should have data-testid on main container when data is present', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(screen.getByTestId('my-services-list')).toBeInTheDocument();
  });

  // ---- Service name ----

  it('should render service name in each card', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending, mockPurchaseConfirmed],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
    expect(screen.getByText('Péndulo Hebreo')).toBeInTheDocument();
  });

  // ---- Duration ----

  it('should render service duration in each card', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(screen.getByTestId(`purchase-duration-${mockPurchasePending.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`purchase-duration-${mockPurchasePending.id}`)).toHaveTextContent(
      '90'
    );
  });

  // ---- Price ----

  it('should render formatted price in ARS for each card', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(screen.getByText(/15[\.,]000/)).toBeInTheDocument();
    expect(screen.getByText(/ARS/i)).toBeInTheDocument();
  });

  // ---- Status badges ----

  it('should render "Pendiente" amber badge for pending status', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const badge = screen.getByTestId('purchase-status-badge-10');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/pendiente/i);
    expect(badge.className).toMatch(/amber|yellow|orange/i);
  });

  it('should render "Confirmado" green badge for paid+future date status', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseConfirmed],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const badge = screen.getByTestId('purchase-status-badge-11');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/confirmado/i);
    expect(badge.className).toMatch(/green|emerald|teal/i);
  });

  it('should render "Completado" grey badge for paid+past date status', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseCompleted],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const badge = screen.getByTestId('purchase-status-badge-12');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/completado/i);
    expect(badge.className).toMatch(/gray|grey|slate|neutral/i);
  });

  it('should render "Cancelado" red badge for cancelled status', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseCancelled],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const badge = screen.getByTestId('purchase-status-badge-13');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/cancelado/i);
    expect(badge.className).toMatch(/red|rose|destructive/i);
  });

  // ---- Turno info (confirmed/completed): selectedDate + selectedTime ----

  it('should show selectedDate and selectedTime for confirmed purchase', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseConfirmed],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const dateEl = screen.getByTestId(`purchase-appointment-date-${mockPurchaseConfirmed.id}`);
    const timeEl = screen.getByTestId(`purchase-appointment-time-${mockPurchaseConfirmed.id}`);
    expect(dateEl).toBeInTheDocument();
    expect(timeEl).toBeInTheDocument();
    expect(timeEl).toHaveTextContent('14:00');
  });

  it('should show selectedDate and selectedTime for completed purchase', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseCompleted],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const timeEl = screen.getByTestId(`purchase-appointment-time-${mockPurchaseCompleted.id}`);
    expect(timeEl).toHaveTextContent('10:00');
  });

  it('should NOT show appointment date section for pending purchase', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(
      screen.queryByTestId(`purchase-appointment-date-${mockPurchasePending.id}`)
    ).not.toBeInTheDocument();
  });

  // ---- WhatsApp link ----

  it('should show WhatsApp link for confirmed purchase', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseConfirmed],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const waLink = screen.getByTestId(`whatsapp-link-${mockPurchaseConfirmed.id}`);
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });

  it('should show WhatsApp link for completed purchase', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseCompleted],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const waLink = screen.getByTestId(`whatsapp-link-${mockPurchaseCompleted.id}`);
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });

  it('should NOT show WhatsApp link for pending purchase', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(screen.queryByTestId(`whatsapp-link-${mockPurchasePending.id}`)).not.toBeInTheDocument();
  });

  it('should NOT show WhatsApp link for cancelled purchase', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseCancelled],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(
      screen.queryByTestId(`whatsapp-link-${mockPurchaseCancelled.id}`)
    ).not.toBeInTheDocument();
  });

  // ---- Retry payment link (pending) ----

  it('should show retry payment link for pending purchase with initPoint', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const retryLink = screen.getByTestId(`retry-payment-link-${mockPurchasePending.id}`);
    expect(retryLink).toBeInTheDocument();
    expect(retryLink).toHaveAttribute(
      'href',
      'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=abc123'
    );
  });

  it('should NOT show retry payment link for confirmed purchase', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseConfirmed],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(
      screen.queryByTestId(`retry-payment-link-${mockPurchaseConfirmed.id}`)
    ).not.toBeInTheDocument();
  });

  // ---- Bug fix: pending + selectedDate + selectedTime should NOT show appointment info ----

  it('should NOT show appointment date/time for pending purchase even when selectedDate and selectedTime are set', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePendingWithDate],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(
      screen.queryByTestId(`purchase-appointment-date-${mockPurchasePendingWithDate.id}`)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`purchase-appointment-time-${mockPurchasePendingWithDate.id}`)
    ).not.toBeInTheDocument();
  });
});
