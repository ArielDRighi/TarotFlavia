import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyServicesWidget } from './MyServicesWidget';
import * as useHolisticServicesHook from '@/hooks/api/useHolisticServices';
import type { ServicePurchase } from '@/types';

vi.mock('@/hooks/api/useHolisticServices', () => ({
  useMyPurchases: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function createMockPurchase(overrides: Partial<ServicePurchase> = {}): ServicePurchase {
  return {
    id: 1,
    userId: 1,
    holisticServiceId: 1,
    holisticService: {
      id: 1,
      name: 'Árbol Genealógico',
      slug: 'arbol-genealogico',
      durationMinutes: 90,
      sessionType: 'family_tree',
    },
    sessionId: null,
    paymentStatus: 'paid',
    amountArs: 15000,
    paymentReference: null,
    paidAt: null,
    initPoint: null,
    selectedDate: null,
    selectedTime: null,
    mercadoPagoPaymentId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('MyServicesWidget', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should render loading skeleton when fetching purchases', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.getByTestId('my-services-widget-loading')).toBeInTheDocument();
  });

  it('should render error state with retry when fetch fails', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.getByTestId('my-services-widget-error')).toBeInTheDocument();
    expect(screen.getByText('No se pudieron cargar tus servicios.')).toBeInTheDocument();

    const { default: userEvent } = await import('@testing-library/user-event');
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should render nothing when user has no purchases', () => {
    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    const { container } = render(<MyServicesWidget />, { wrapper });

    expect(container.innerHTML).toBe('');
  });

  it('should render widget with purchases', () => {
    const purchases = [
      createMockPurchase({ id: 1 }),
      createMockPurchase({
        id: 2,
        holisticService: {
          id: 2,
          name: 'Péndulo Hebreo',
          slug: 'pendulo-hebreo',
          durationMinutes: 60,
          sessionType: 'hebrew_pendulum',
        },
        paymentStatus: 'pending',
      }),
    ];

    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: purchases,
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.getByTestId('my-services-widget')).toBeInTheDocument();
    expect(screen.getByText('Mis Servicios')).toBeInTheDocument();
    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
    expect(screen.getByText('Péndulo Hebreo')).toBeInTheDocument();
  });

  it('should show derived status badges for each purchase', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const purchases = [
      createMockPurchase({ id: 1, paymentStatus: 'paid', selectedDate: futureDateStr }),
      createMockPurchase({ id: 2, paymentStatus: 'pending' }),
    ];

    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: purchases,
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.getByText('Confirmado')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('should show "Completado" for paid purchases without selectedDate', () => {
    const purchases = [createMockPurchase({ id: 1, paymentStatus: 'paid', selectedDate: null })];

    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: purchases,
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('should show "Completado" for paid purchases with past selectedDate', () => {
    const purchases = [
      createMockPurchase({ id: 1, paymentStatus: 'paid', selectedDate: '2020-01-01' }),
    ];

    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: purchases,
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('should limit visible purchases to 3 and show total count', () => {
    const purchases = [
      createMockPurchase({ id: 1 }),
      createMockPurchase({ id: 2 }),
      createMockPurchase({ id: 3 }),
      createMockPurchase({ id: 4 }),
    ];

    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: purchases,
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.getByTestId('widget-purchase-1')).toBeInTheDocument();
    expect(screen.getByTestId('widget-purchase-2')).toBeInTheDocument();
    expect(screen.getByTestId('widget-purchase-3')).toBeInTheDocument();
    expect(screen.queryByTestId('widget-purchase-4')).not.toBeInTheDocument();
    expect(screen.getByText('Ver todos (4)')).toBeInTheDocument();
  });

  it('should show "Ver todos mis servicios" when 3 or fewer purchases', () => {
    const purchases = [createMockPurchase({ id: 1 })];

    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: purchases,
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.getByText('Ver todos mis servicios')).toBeInTheDocument();
  });

  it('should show appointment date and time when purchase has selectedDate and selectedTime', () => {
    const purchases = [
      createMockPurchase({
        id: 1,
        paymentStatus: 'pending',
        selectedDate: '2026-05-15',
        selectedTime: '14:30',
      }),
    ];

    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: purchases,
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.getByText('15/05/2026')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  it('should not show appointment info when purchase has no selectedDate', () => {
    const purchases = [createMockPurchase({ id: 1, selectedDate: null, selectedTime: null })];

    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: purchases,
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    expect(screen.queryByText(/\d{2}\/\d{2}\/\d{4}/)).not.toBeInTheDocument();
  });

  it('should link to /mis-servicios from the footer', () => {
    const purchases = [createMockPurchase({ id: 1 })];

    vi.mocked(useHolisticServicesHook.useMyPurchases).mockReturnValue({
      data: purchases,
      isLoading: false,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useMyPurchases>);

    render(<MyServicesWidget />, { wrapper });

    const viewAllLink = screen.getByTestId('widget-view-all-link');
    expect(viewAllLink).toHaveAttribute('href', '/mis-servicios');
  });
});
