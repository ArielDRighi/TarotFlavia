/**
 * Tests for ServiceDetailPage component
 *
 * Updated for T-SF-D02: interactive calendar pre-payment flow.
 * User must select a date + time slot before the CTA is enabled.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServiceDetailPage } from './ServiceDetailPage';
import * as useHolisticServicesHook from '@/hooks/api/useHolisticServices';
import type { HolisticServiceDetail } from '@/types';

vi.mock('@/hooks/api/useHolisticServices', () => ({
  useHolisticServiceDetail: vi.fn(),
}));

// Mock BookingCalendar — exposes onBook callback via a test button
vi.mock('@/components/features/marketplace/BookingCalendar', () => ({
  BookingCalendar: ({
    readOnly,
    serviceSlug,
    serviceDurationMinutes,
    onBook,
  }: {
    readOnly?: boolean;
    serviceSlug?: string;
    serviceDurationMinutes?: number;
    onBook?: (date: string, time: string, duration: number) => void;
  }) => (
    <div
      data-testid="booking-calendar"
      data-readonly={String(readOnly ?? false)}
      data-service-slug={serviceSlug ?? ''}
      data-service-duration={String(serviceDurationMinutes ?? '')}
    >
      <button data-testid="mock-select-slot" onClick={() => onBook?.('2026-04-15', '10:00', 90)}>
        Seleccionar horario
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

const mockServiceDetail: HolisticServiceDetail = {
  id: 1,
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Sanación a través del árbol genealógico familiar',
  longDescription:
    'El trabajo con el árbol genealógico busca sanar patrones repetitivos que se transmiten de generación en generación. A través de constelaciones familiares y registros akáshicos, exploramos los vínculos y heridas que impactan en tu vida actual.',
  priceArs: 15000,
  durationMinutes: 90,
  sessionType: 'family_tree',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('ServiceDetailPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should have data-testid attribute', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByTestId('service-detail-page')).toBeInTheDocument();
  });

  it('should render service name in h1', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Árbol Genealógico' })
    ).toBeInTheDocument();
  });

  it('should render long description', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByText(/El trabajo con el árbol genealógico/)).toBeInTheDocument();
  });

  it('should render price in ARS', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByText(/15\.000/)).toBeInTheDocument();
    expect(screen.getByText(/ARS/i)).toBeInTheDocument();
  });

  it('should render duration', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByText(/90/)).toBeInTheDocument();
    expect(screen.getByText(/min/i)).toBeInTheDocument();
  });

  it('should NOT show WhatsApp phone number', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    // Should not show any phone number (e.g. +54...) or text like "número de whatsapp"
    expect(screen.queryByText(/\+54/)).not.toBeInTheDocument();
    expect(screen.queryByText(/número de whatsapp/i)).not.toBeInTheDocument();
  });

  it('should render BookingCalendar with readOnly=false (interactive)', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    const calendar = screen.getByTestId('booking-calendar');
    expect(calendar).toBeInTheDocument();
    expect(calendar).toHaveAttribute('data-readonly', 'false');
  });

  it('should pass serviceSlug to BookingCalendar', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    const calendar = screen.getByTestId('booking-calendar');
    expect(calendar).toHaveAttribute('data-service-slug', 'arbol-genealogico');
  });

  it('should pass serviceDurationMinutes to BookingCalendar', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    const calendar = screen.getByTestId('booking-calendar');
    expect(calendar).toHaveAttribute(
      'data-service-duration',
      String(mockServiceDetail.durationMinutes)
    );
  });

  it('should render "Contratar servicio" button disabled when no slot selected', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    const button = screen.getByTestId('contratar-button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('should show slot required hint when no slot is selected', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByTestId('slot-required-hint')).toBeInTheDocument();
  });

  it('should enable CTA and show correct href after slot is selected', async () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    // Simulate slot selection via BookingCalendar mock
    await userEvent.click(screen.getByTestId('mock-select-slot'));

    const link = screen.getByRole('link', { name: /contratar servicio/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/servicios/arbol-genealogico/pago?date=2026-04-15&time=10%3A00'
    );
  });

  it('should show selected slot hint after slot is picked', async () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: mockServiceDetail,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    await userEvent.click(screen.getByTestId('mock-select-slot'));

    expect(screen.getByTestId('slot-selected-hint')).toBeInTheDocument();
    expect(screen.getByText(/2026-04-15/)).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
  });

  it('should render skeleton when loading', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByTestId('service-detail-skeleton')).toBeInTheDocument();
  });

  it('should render not-found state when service is not found (404)', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Servicio no encontrado'),
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="slug-inexistente" />, { wrapper });

    expect(screen.getByTestId('service-detail-not-found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al catálogo/i })).toBeInTheDocument();
  });

  it('should render error state for non-404 errors', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServiceDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network Error'),
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServiceDetail>);

    render(<ServiceDetailPage slug="arbol-genealogico" />, { wrapper });

    expect(screen.getByTestId('service-detail-error')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al catálogo/i })).toBeInTheDocument();
  });
});
