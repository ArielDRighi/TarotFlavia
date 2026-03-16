/**
 * Tests for ServiciosPage component
 *
 * TDD RED phase — tests written before implementation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServiciosPage } from './ServiciosPage';
import * as useHolisticServicesHook from '@/hooks/api/useHolisticServices';
import { useAuthStore } from '@/stores/authStore';
import type { HolisticService } from '@/types';

vi.mock('@/hooks/api/useHolisticServices', () => ({
  useHolisticServices: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock Next.js Link
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

const mockServices: HolisticService[] = [
  {
    id: 1,
    name: 'Árbol Genealógico',
    slug: 'arbol-genealogico',
    shortDescription: 'Sanación a través del árbol genealógico familiar',
    priceArs: 15000,
    durationMinutes: 90,
    sessionType: 'family_tree',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Péndulo Hebreo',
    slug: 'pendulo-hebreo',
    shortDescription: 'Diagnóstico y sanación con péndulo hebreo',
    priceArs: 8000,
    durationMinutes: 60,
    sessionType: 'hebrew_pendulum',
    imageUrl: null,
    displayOrder: 2,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

describe('ServiciosPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    // Default: unauthenticated user
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should render page title', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should have data-testid attribute', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    expect(screen.getByTestId('servicios-page')).toBeInTheDocument();
  });

  it('should render skeleton cards when loading', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    expect(screen.getAllByTestId('service-card-skeleton').length).toBeGreaterThan(0);
  });

  it('should render service cards when data is loaded', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    expect(screen.getByText('Árbol Genealógico')).toBeInTheDocument();
    expect(screen.getByText('Péndulo Hebreo')).toBeInTheDocument();
  });

  it('should render empty state when no services available', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    expect(screen.getByTestId('servicios-empty-state')).toBeInTheDocument();
  });

  it('should render error state with retry button when fetch fails', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    expect(screen.getByTestId('servicios-error-state')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('should call refetch when retry button is clicked', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should render a responsive grid for service cards', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    const grid = screen.getByTestId('servicios-grid');
    expect(grid).toBeInTheDocument();
    expect(grid.className).toMatch(/grid/);
  });

  it('should show "Mis Servicios" link for authenticated users', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        email: 'test@test.com',
        name: 'Test',
        roles: ['consumer'],
        plan: 'free',
        profilePicture: null,
      },
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    const link = screen.getByTestId('mis-servicios-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/mis-servicios');
    expect(screen.getByText('Mis Servicios')).toBeInTheDocument();
  });

  it('should NOT show "Mis Servicios" link for unauthenticated users', () => {
    vi.mocked(useHolisticServicesHook.useHolisticServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useHolisticServicesHook.useHolisticServices>);

    render(<ServiciosPage />, { wrapper });

    expect(screen.queryByTestId('mis-servicios-link')).not.toBeInTheDocument();
  });
});
