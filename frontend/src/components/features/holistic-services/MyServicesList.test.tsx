/**
 * Tests for MyServicesList component
 *
 * TDD RED phase — tests written before implementation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyServicesList } from './MyServicesList';
import * as useHolisticServicesHook from '@/hooks/api/useHolisticServices';
import * as useSessionsHook from '@/hooks/api/useSessions';
import type { ServicePurchase, SessionDetail } from '@/types';

vi.mock('@/hooks/api/useHolisticServices', () => ({
  useMyPurchases: vi.fn(),
}));

vi.mock('@/hooks/api/useSessions', () => ({
  useSessionDetail: vi.fn(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

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
  initPoint: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const mockPurchasePaidNoSession: ServicePurchase = {
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
  createdAt: '2025-01-03T00:00:00.000Z',
  updatedAt: '2025-01-05T12:00:00.000Z',
};

const mockPurchasePaidWithSession: ServicePurchase = {
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
  sessionId: 55,
  paymentStatus: 'paid',
  amountArs: 10000,
  paymentReference: 'ref-xyz',
  paidAt: '2025-02-01T12:00:00.000Z',
  whatsappNumber: '+5491112345678',
  initPoint: null,
  createdAt: '2025-01-28T00:00:00.000Z',
  updatedAt: '2025-02-01T12:00:00.000Z',
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
  createdAt: '2025-01-10T00:00:00.000Z',
  updatedAt: '2025-01-10T00:00:00.000Z',
};

const mockSessionDetail: SessionDetail = {
  id: 55,
  tarotistaId: 1,
  userId: 7,
  sessionDate: '2026-04-20',
  sessionTime: '14:00',
  durationMinutes: 60,
  sessionType: 'ENERGY_CLEANING',
  status: 'confirmed',
  priceUsd: 0,
  paymentStatus: 'PAID',
  googleMeetLink: '',
  userEmail: 'user@test.com',
  createdAt: '2025-02-01T12:00:00.000Z',
  updatedAt: '2025-02-01T12:00:00.000Z',
};

describe('MyServicesList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();

    // Default: no session detail (for purchases without sessionId)
    vi.mocked(useSessionsHook.useSessionDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useSessionsHook.useSessionDetail>);
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

  // ---- Purchase cards ----

  it('should render service name in each card', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending, mockPurchasePaidNoSession],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
    expect(screen.getByText('Péndulo Hebreo')).toBeInTheDocument();
  });

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

  it('should render amber badge for pending status', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const badge = screen.getByTestId('purchase-status-badge-10');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/amber|yellow|orange/i);
  });

  it('should render green badge for paid status', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePaidNoSession],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const badge = screen.getByTestId('purchase-status-badge-11');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/green|emerald|teal/i);
  });

  it('should render red badge for cancelled status', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchaseCancelled],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const badge = screen.getByTestId('purchase-status-badge-13');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/red|rose|destructive/i);
  });

  // ---- Reservar Turno button (paid, no session) ----

  it('should render "Reservar Turno" button when paid without session', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePaidNoSession],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    const link = screen.getByRole('link', { name: /reservar turno/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/servicios/reservar/11');
  });

  it('should NOT render "Reservar Turno" button for pending purchase', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePending],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesList />, { wrapper });

    expect(screen.queryByRole('link', { name: /reservar turno/i })).not.toBeInTheDocument();
  });

  // ---- Session info (paid with session) ----

  it('should render WhatsApp link when purchase is paid with session booked', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePaidWithSession],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    vi.mocked(useSessionsHook.useSessionDetail).mockReturnValue({
      data: mockSessionDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useSessionsHook.useSessionDetail>);

    render(<MyServicesList />, { wrapper });

    const waLink = screen.getByRole('link', { name: /whatsapp/i });
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });

  it('should NOT render "Reservar Turno" when session already booked', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePaidWithSession],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    vi.mocked(useSessionsHook.useSessionDetail).mockReturnValue({
      data: mockSessionDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useSessionsHook.useSessionDetail>);

    render(<MyServicesList />, { wrapper });

    expect(screen.queryByRole('link', { name: /reservar turno/i })).not.toBeInTheDocument();
  });

  it('should show session date and time when session is booked', async () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePaidWithSession],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    vi.mocked(useSessionsHook.useSessionDetail).mockReturnValue({
      data: mockSessionDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useSessionsHook.useSessionDetail>);

    render(<MyServicesList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('session-date-12')).toBeInTheDocument();
      expect(screen.getByTestId('session-time-12')).toBeInTheDocument();
    });

    expect(screen.getByTestId('session-time-12')).toHaveTextContent('14:00');
  });

  it('should render session-info container when purchase has session', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [mockPurchasePaidWithSession],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    vi.mocked(useSessionsHook.useSessionDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useSessionsHook.useSessionDetail>);

    render(<MyServicesList />, { wrapper });

    expect(screen.getByTestId('session-info-12')).toBeInTheDocument();
  });
});
