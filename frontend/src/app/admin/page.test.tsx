import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import AdminDashboardPage from './page';
import * as dashboardApi from '@/lib/api/dashboard-api';

// Mock the API module
vi.mock('@/lib/api/dashboard-api');

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

describe('AdminDashboardPage', () => {
  const mockStats = {
    totalUsers: { value: 150, change: 5, trend: 'up' as const },
    monthlyReadings: { value: 450, change: 12, trend: 'up' as const },
    activeTarotistas: { value: 25, change: 0, trend: 'stable' as const },
    monthlyRevenue: { value: 5000, change: 8, trend: 'up' as const },
  };

  const mockCharts = {
    dailyReadings: [
      { date: '2025-12-01', value: 10 },
      { date: '2025-12-02', value: 15 },
    ],
    planDistribution: [
      { plan: 'Gratis', count: 100, percentage: 50 },
      { plan: 'Premium', count: 100, percentage: 50 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dashboardApi.fetchDashboardStats).mockResolvedValue(mockStats);
    vi.mocked(dashboardApi.fetchDashboardCharts).mockResolvedValue(mockCharts);
  });

  it('should render admin dashboard with correct title', async () => {
    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('heading', { level: 1, name: /dashboard admin/i })).toBeInTheDocument();
  });

  it('should have container class', () => {
    const { container } = render(<AdminDashboardPage />, { wrapper: createWrapper() });

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('container');
  });

  it('should have py-8 class', () => {
    const { container } = render(<AdminDashboardPage />, { wrapper: createWrapper() });

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('py-8');
  });

  it('should have font-serif class on heading', () => {
    render(<AdminDashboardPage />, { wrapper: createWrapper() });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-serif');
  });
});
