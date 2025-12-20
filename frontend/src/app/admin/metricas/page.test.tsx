/**
 * Tests for Platform Metrics Page
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import PlatformMetricsPage from './page';
import * as platformMetricsApi from '@/lib/api/platform-metrics-api';
import type { PlatformMetricsDto } from '@/types';

// Mock the API module
vi.mock('@/lib/api/platform-metrics-api');

// Helper to create QueryClient for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// Wrapper component for React Query
function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('PlatformMetricsPage', () => {
  const mockMetrics: PlatformMetricsDto = {
    totalReadings: 1500,
    totalRevenueShare: 52500.0,
    totalPlatformFee: 22500.0,
    totalGrossRevenue: 75000.0,
    activeTarotistas: 10,
    activeUsers: 500,
    period: {
      start: new Date('2024-12-01T00:00:00Z'),
      end: new Date('2024-12-31T23:59:59Z'),
    },
    topTarotistas: [
      {
        tarotistaId: 1,
        nombrePublico: 'Luna Misteriosa',
        totalReadings: 150,
        totalRevenueShare: 5250.0,
        totalPlatformFee: 2250.0,
        totalGrossRevenue: 7500.0,
        averageRating: 4.8,
        totalReviews: 50,
        period: {
          start: new Date('2024-12-01T00:00:00Z'),
          end: new Date('2024-12-31T23:59:59Z'),
        },
      },
      {
        tarotistaId: 2,
        nombrePublico: 'Estrella Mística',
        totalReadings: 130,
        totalRevenueShare: 4550.0,
        totalPlatformFee: 1950.0,
        totalGrossRevenue: 6500.0,
        averageRating: 4.7,
        totalReviews: 42,
        period: {
          start: new Date('2024-12-01T00:00:00Z'),
          end: new Date('2024-12-31T23:59:59Z'),
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(platformMetricsApi.getPlatformMetrics).mockResolvedValue(mockMetrics);
  });

  it('should render platform metrics page with correct title', async () => {
    render(<PlatformMetricsPage />, { wrapper: createWrapper() });

    expect(
      screen.getByRole('heading', { level: 1, name: /métricas de plataforma/i })
    ).toBeInTheDocument();
  });

  it('should have container class', () => {
    const { container } = render(<PlatformMetricsPage />, { wrapper: createWrapper() });

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('container');
  });

  it('should have py-8 class', () => {
    const { container } = render(<PlatformMetricsPage />, { wrapper: createWrapper() });

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('py-8');
  });

  it('should render loading skeleton while fetching data', () => {
    render(<PlatformMetricsPage />, { wrapper: createWrapper() });

    // Debe haber skeletons mientras carga
    const skeletons = screen.getAllByTestId(/skeleton/i);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render metric cards when data is loaded', async () => {
    render(<PlatformMetricsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/revenue total/i)).toBeInTheDocument();
    });

    // Verificar que se muestran las 4 tarjetas principales
    expect(screen.getByText(/sesiones completadas/i)).toBeInTheDocument();
    expect(screen.getByText(/lecturas totales/i)).toBeInTheDocument();
    expect(screen.getByText(/usuarios activos/i)).toBeInTheDocument();
  });

  it('should render top tarotistas table when data is loaded', async () => {
    render(<PlatformMetricsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/top tarotistas/i)).toBeInTheDocument();
    });

    // Verificar que se muestran los tarotistas
    expect(screen.getByText('Luna Misteriosa')).toBeInTheDocument();
    expect(screen.getByText('Estrella Mística')).toBeInTheDocument();
  });

  it('should display error message when API fails', async () => {
    vi.mocked(platformMetricsApi.getPlatformMetrics).mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(<PlatformMetricsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/error al cargar métricas/i)).toBeInTheDocument();
    });
  });

  it('should have period selector in header', async () => {
    render(<PlatformMetricsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      // El selector de período debe estar presente
      const selectors = screen.getAllByRole('combobox');
      expect(selectors.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should handle edge case when activeUsers is 0', async () => {
    const metricsWithZeroUsers: PlatformMetricsDto = {
      ...mockMetrics,
      activeUsers: 0,
    };

    vi.mocked(platformMetricsApi.getPlatformMetrics).mockResolvedValue(metricsWithZeroUsers);

    render(<PlatformMetricsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/revenue total/i)).toBeInTheDocument();
    });

    // Verificar que muestra "N/A" en lugar de Infinity o NaN
    expect(screen.getByText(/promedio: n\/a por usuario/i)).toBeInTheDocument();
  });
});
